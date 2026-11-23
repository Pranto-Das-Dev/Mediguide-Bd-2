const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../.env')
});

const db = require('./db');
const promiseDb = db.promise();
console.log('Promise DB Type:', typeof promiseDb.execute);
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32) {
    console.error('Error: SESSION_SECRET is missing or too short in .env');
    process.exit(1);
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '../frontend')));

const sessionStore = new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'mediguide_db',
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions'
    }
});

app.use(session({
    name: 'mediguide.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000
    }
}));
// Admin Authentication Middleware
function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Please login first.'
        });
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }

    next();
}
// Test API
app.get('/api/test-me', (req, res) => {
    res.json({
        message: 'MediGuide BD route is working!'
    });
});

// API status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'success',
        message: 'MediGuide BD API is running'
    });
});

// Register
app.post('/api/register', (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({
            error: 'Name, email and password are required'
        });
    }

    const cleanName = String(full_name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    if (cleanName.length < 2 || cleanName.length > 100) {
        return res.status(400).json({
            error: 'Name must be between 2 and 100 characters'
        });
    }

    if (cleanEmail.length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
            error: 'Please enter a valid email address'
        });
    }

    if (cleanPassword.length < 8 ||
        Buffer.byteLength(cleanPassword, 'utf8') > 72) {
        return res.status(400).json({
            error: 'Password must be 8 to 72 bytes long'
        });
    }

    bcrypt.hash(cleanPassword, 12, (hashError, passwordHash) => {
        if (hashError) {
            console.error('Password hashing failed:', hashError.message);
            return res.status(500).json({
                error: 'Could not register user'
            });
        }

        const sql = `
            INSERT INTO users (full_name, email, password_hash)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [cleanName, cleanEmail, passwordHash],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({
                            error: 'This email is already registered'
                        });
                    }

                    console.error('Registration failed:', err.message);
                    return res.status(500).json({
                        error: 'Registration failed'
                    });
                }

                return res.status(201).json({
                    message: 'Registration successful',
                    user_id: result.insertId
                });
            }
        );
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required'
        });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    db.query(
        'SELECT user_id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
        [cleanEmail],
        (err, results) => {
            if (err) {
                console.error('Login database error:', err.message);
                return res.status(500).json({
                    error: 'Login failed'
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    error: 'Invalid email or password'
                });
            }

            const user = results[0];

            bcrypt.compare(
                String(password),
                user.password_hash,
                (compareError, matched) => {
                    if (compareError || !matched) {
                        return res.status(401).json({
                            error: 'Invalid email or password'
                        });
                    }

                    req.session.regenerate((sessionError) => {
                        if (sessionError) {
                            console.error(
                                'Session error:',
                                sessionError.message
                            );
                            return res.status(500).json({
                                error: 'Could not create login session'
                            });
                        }

                        req.session.user = {
                            user_id: user.user_id,
                            full_name: user.full_name,
                            email: user.email,
                            role: user.role
                        };

                        req.session.save((saveError) => {
                            if (saveError) {
                                console.error(
                                    'Session save failed:',
                                    saveError.message
                                );
                                return res.status(500).json({
                                    error: 'Could not save login session'
                                });
                            }

                            return res.json({
                                message: 'Login successful',
                                user: req.session.user
                            });
                        });
                    });
                }
            );
        }
    );
});

// Current logged-in user
app.get('/api/me', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Not authenticated'
        });
    }

    return res.json({
        user: req.session.user
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout failed:', err.message);
            return res.status(500).json({
                error: 'Logout failed'
            });
        }

        res.clearCookie('mediguide.sid', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        return res.json({
            message: 'Logout successful'
        });
    });
});
// Save health information
app.post('/api/saved', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    const { item_type, item_id, item_name } = req.body;

    const allowedTypes = [
        'conditions',
        'symptoms',
        'medicines',
        'services'
    ];

    const userId = req.session.user.user_id;
    const itemId = Number(item_id);
    const itemType = String(item_type || '').trim();
    const itemName = String(item_name || '').trim();

    if (
        !allowedTypes.includes(itemType) ||
        !Number.isInteger(itemId) ||
        itemId <= 0 ||
        !itemName ||
        itemName.length > 150
    ) {
        return res.status(400).json({
            error: 'Invalid saved information'
        });
    }

    const sql = `
        INSERT INTO saved_health_info
        (user_id, item_type, item_id, item_name)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE item_name = VALUES(item_name)
    `;

    db.query(
        sql,
        [userId, itemType, itemId, itemName],
        (err, result) => {
            if (err) {
                console.error('Save information error:', err.message);

                return res.status(500).json({
                    error: 'Could not save information'
                });
            }

            return res.status(201).json({
                message: 'Information saved successfully',
                saved_id: result.insertId
            });
        }
    );
});


// Get saved health information
app.get('/api/saved', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    const userId = req.session.user.user_id;

    db.query(
        `SELECT saved_id, item_type, item_id, item_name, saved_at
         FROM saved_health_info
         WHERE user_id = ?
         ORDER BY saved_at DESC`,
        [userId],
        (err, results) => {
            if (err) {
                console.error('Get saved information error:', err.message);

                return res.status(500).json({
                    error: 'Could not load saved information'
                });
            }

            return res.json({
                count: results.length,
                results: results
            });
        }
    );
});


// Remove saved health information
app.delete('/api/saved/:id', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    const savedId = Number(req.params.id);

    if (!Number.isInteger(savedId) || savedId <= 0) {
        return res.status(400).json({
            error: 'Invalid saved information ID'
        });
    }

    const userId = req.session.user.user_id;

    db.query(
        `DELETE FROM saved_health_info
         WHERE saved_id = ? AND user_id = ?`,
        [savedId, userId],
        (err, result) => {
            if (err) {
                console.error('Delete saved information error:', err.message);

                return res.status(500).json({
                    error: 'Could not remove saved information'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Saved information not found'
                });
            }

            return res.json({
                message: 'Saved information removed successfully'
            });
        }
    );
});

// Health conditions search
app.get('/api/conditions', (req, res) => {
    const sql = `
        SELECT id, name, description, symptoms, prevention, created_at
        FROM health_conditions
        ORDER BY name
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Conditions query failed:', err.message);
            return res.status(500).json({
                error: 'Could not load health conditions'
            });
        }

        res.json(results);
    });
});

// Symptoms search
app.get('/api/symptoms', (req, res) => {
    db.query(
        'SELECT * FROM symptoms ORDER BY symptom_name',
        (err, results) => {
            if (err) {
                console.error('Symptoms query failed:', err.message);
                return res.status(500).json({
                    error: 'Could not load symptoms'
                });
            }

            res.json(results);
        }
    );
});

// Medicines search
app.get('/api/medicines', (req, res) => {
    db.query(
        'SELECT * FROM medicines ORDER BY name',
        (err, results) => {
            if (err) {
                console.error('Medicines query failed:', err.message);
                return res.status(500).json({
                    error: 'Could not load medicines'
                });
            }

            res.json(results);
        }
    );
});

// Healthcare services search
app.get('/api/services', (req, res) => {
    db.query(
        'SELECT * FROM healthcare_services ORDER BY name',
        (err, results) => {
            if (err) {
                console.error('Services query failed:', err.message);
                return res.status(500).json({
                    error: 'Could not load healthcare services'
                });
            }

            res.json(results);
        }
    );
});
// Save Search History
app.post('/api/search-history', (req, res) => {

    // Check login
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    const { search_query, search_type } = req.body;

    const allowedTypes = [
        'all',
        'conditions',
        'symptoms',
        'medicines',
        'services'
    ];

    const userId = req.session.user.user_id;
    const query = String(search_query || '').trim();
    const type = String(search_type || '').trim();

    if (
        !query ||
        query.length > 255 ||
        !allowedTypes.includes(type)
    ) {
        return res.status(400).json({
            error: 'Invalid search information'
        });
    }

    const sql = `
        INSERT INTO search_history
        (user_id, search_query, search_type)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [userId, query, type],
        (err, result) => {

            if (err) {
                console.error('Search history error:', err.message);

                return res.status(500).json({
                    error: 'Could not save search history'
                });
            }

            return res.status(201).json({
                message: 'Search history saved successfully',
                history_id: result.insertId
            });
        }
    );
});


// Get Search History
app.get('/api/search-history', (req, res) => {

    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    const userId = req.session.user.user_id;

    db.query(
        `SELECT history_id, search_query, search_type, searched_at
         FROM search_history
         WHERE user_id = ?
         ORDER BY searched_at DESC`,
        [userId],
        (err, results) => {

            if (err) {
                console.error('Search history loading error:', err.message);

                return res.status(500).json({
                    error: 'Could not load search history'
                });
            }

            return res.json({
                count: results.length,
                results: results
            });
        }
    );
});


// Delete Search History
app.delete('/api/search-history/:id', (req, res) => {

    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: 'Please login first'
        });
    }

    const historyId = Number(req.params.id);

    if (!Number.isInteger(historyId) || historyId <= 0) {
        return res.status(400).json({
            error: 'Invalid history ID'
        });
    }

    const userId = req.session.user.user_id;

    db.query(
        `DELETE FROM search_history
         WHERE history_id = ? AND user_id = ?`,
        [historyId, userId],
        (err, result) => {

            if (err) {
                console.error('Search history delete error:', err.message);

                return res.status(500).json({
                    error: 'Could not delete search history'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Search history not found'
                });
            }

            return res.json({
                message: 'Search history deleted successfully'
            });
        }
    );
});
// Admin Access Test
app.get('/api/admin/check', requireAdmin, (req, res) => {
    res.json({
        success: true,
        message: 'Admin access granted.',
        user: req.session.user
    });
});
// ===================================
// ADMIN: HEALTH CONDITIONS CRUD
// ===================================

// Add Health Condition
app.post('/api/admin/conditions', requireAdmin, async (req, res) => {
    try {
        const { name, description, symptoms, prevention } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required.'
            });
        }

        const [result] = await promiseDb.execute(
            `INSERT INTO health_conditions
            (name, description, symptoms, prevention)
            VALUES (?, ?, ?, ?)`,
            [name, description, symptoms || '', prevention || '']
        );

        res.status(201).json({
            success: true,
            message: 'Health condition added successfully.',
            id: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to add health condition.'
        });
    }
});


// Update Health Condition
app.put('/api/admin/conditions/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description, symptoms, prevention } = req.body;
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0 || !name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID, name and description are required.'
            });
        }
        console.log('Update API: Promise DB is being used');
        const [result] = await promiseDb.execute(
            `UPDATE health_conditions
            SET name = ?, description = ?, symptoms = ?, prevention = ?
            WHERE id = ?`,
            [name, description, symptoms || '', prevention || '', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Health condition not found.'
            });
        }

        res.json({
            success: true,
            message: 'Health condition updated successfully.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update health condition.'
        });
    }
});


// Delete Health Condition
app.delete('/api/admin/conditions/:id', requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID.'
            });
        }

        const [result] = await promiseDb.execute(
            'DELETE FROM health_conditions WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Health condition not found.'
            });
        }

        res.json({
            success: true,
            message: 'Health condition deleted successfully.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete health condition.'
        });
    }
});
// ========================================
// ADMIN: ADD MEDICINE
// ========================================
app.post('/api/admin/medicines', requireAdmin, async (req, res) => {
    try {
        const { name, generic_name, category, uses, precautions } = req.body;

        if (!name || !generic_name || !category || !uses) {
            return res.status(400).json({
                success: false,
                message: 'Name, generic name, category and uses are required.'
            });
        }

        const [result] = await promiseDb.execute(
            `INSERT INTO medicines
            (name, generic_name, category, uses, precautions)
            VALUES (?, ?, ?, ?, ?)`,
            [name, generic_name, category, uses, precautions || '']
        );

        res.status(201).json({
            success: true,
            message: 'Medicine added successfully.',
            id: result.insertId
        });

    } catch (error) {
        console.error('Add medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add medicine.'
        });
    }
});


// ========================================
// ADMIN: UPDATE MEDICINE
// ========================================
app.put('/api/admin/medicines/:id', requireAdmin, async (req, res) => {
    try {
        const { name, generic_name, category, uses, precautions } = req.body;
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0 ||
            !name || !generic_name || !category || !uses) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID and all required fields are needed.'
            });
        }

        const [result] = await promiseDb.execute(
            `UPDATE medicines
            SET name = ?, generic_name = ?, category = ?,
                uses = ?, precautions = ?
            WHERE medicine_id = ?`,
            [name, generic_name, category, uses, precautions || '', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found.'
            });
        }

        res.json({
            success: true,
            message: 'Medicine updated successfully.'
        });

    } catch (error) {
        console.error('Update medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update medicine.'
        });
    }
});


// ========================================
// ADMIN: DELETE MEDICINE
// ========================================
app.delete('/api/admin/medicines/:id', requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid medicine ID.'
            });
        }

        const [result] = await promiseDb.execute(
            'DELETE FROM medicines WHERE medicine_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found.'
            });
        }

        res.json({
            success: true,
            message: 'Medicine deleted successfully.'
        });

    } catch (error) {
        console.error('Delete medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete medicine.'
        });
    }
});
// ===============================
// ADMIN HEALTHCARE SERVICES CRUD
// ===============================

// ADD HEALTHCARE SERVICE
app.post('/api/admin/services', requireAdmin, async (req, res) => {
    try {
        const { name, service_type, address, phone, description } = req.body;

        if (!name || !service_type) {
            return res.status(400).json({
                success: false,
                message: 'Name and service type are required.'
            });
        }

        const [result] = await promiseDb.execute(
            `INSERT INTO healthcare_services
            (name, service_type, address, phone, description)
            VALUES (?, ?, ?, ?, ?)`,
            [name, service_type, address || '', phone || '', description || '']
        );

        res.status(201).json({
            success: true,
            message: 'Healthcare service added successfully.',
            id: result.insertId
        });

    } catch (error) {
        console.error('Add service error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add healthcare service.'
        });
    }
});


// UPDATE HEALTHCARE SERVICE
app.put('/api/admin/services/:id', requireAdmin, async (req, res) => {
    try {
        const { name, service_type, address, phone, description } = req.body;
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0 || !name || !service_type) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID, name and service type are required.'
            });
        }

        const [result] = await promiseDb.execute(
            `UPDATE healthcare_services
            SET name = ?, service_type = ?, address = ?,
                phone = ?, description = ?
            WHERE service_id = ?`,
            [name, service_type, address || '', phone || '', description || '', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Healthcare service not found.'
            });
        }

        res.json({
            success: true,
            message: 'Healthcare service updated successfully.'
        });

    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update healthcare service.'
        });
    }
});


// DELETE HEALTHCARE SERVICE
app.delete('/api/admin/services/:id', requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID.'
            });
        }

        const [result] = await promiseDb.execute(
            'DELETE FROM healthcare_services WHERE service_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Healthcare service not found.'
            });
        }

        res.json({
            success: true,
            message: 'Healthcare service deleted successfully.'
        });

    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete healthcare service.'
        });
    }
});
// =====================================
// ADMIN USER MANAGEMENT
// =====================================

// GET ALL USERS
app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const [users] = await promiseDb.execute(
            `SELECT user_id, full_name, email, role, created_at
             FROM users
             ORDER BY user_id DESC`
        );

        res.json({
            success: true,
            count: users.length,
            results: users
        });

    } catch (error) {
        console.error('Load users error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to load users.'
        });
    }
});


// UPDATE USER ROLE
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { role } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID.'
            });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role.'
            });
        }

        if (id === req.session.user.user_id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role.'
            });
        }

        const [result] = await promiseDb.execute(
            'UPDATE users SET role = ? WHERE user_id = ?',
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully.'
        });

    } catch (error) {
        console.error('Update user role error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update user role.'
        });
    }
});


// DELETE USER
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID.'
            });
        }

        if (id === req.session.user.user_id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account.'
            });
        }

        const [result] = await promiseDb.execute(
            'DELETE FROM users WHERE user_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully.'
        });

    } catch (error) {
        console.error('Delete user error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete user.'
        });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(
        `MediGuide BD is running at http://localhost:${PORT}`
    );
});