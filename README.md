MediGuide BD

Project Overview

MediGuide BD is a web-based health information platform designed to help users find health-related information and healthcare services.

Main Features

- User Registration and Login
- Health Conditions Information
- Symptoms Search
- Medicine Information
- Healthcare Services Directory
- User Dashboard
- Save Health Information
- Search History
- Admin Panel
- Admin User Management
- Add, Edit and Delete Information

Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MySQL
- XAMPP
- PHPMyAdmin

Requirements

- Node.js
- XAMPP
- Visual Studio Code
- Web Browser

Installation and Setup

1. Start XAMPP

Start Apache and MySQL from XAMPP Control Panel.

2. Setup Database

1. Open http://localhost/phpmyadmin
2. Create or select the database named "mediguide_db".
3. Import the provided SQL database backup file.

3. Install Dependencies

Open the project folder in VS Code and run:

npm.cmd install

4. Configure Environment

Create a ".env" file in the project root.
Add a unique SESSION_SECRET value of at least 32 characters.

Never share your real ".env" file publicly.

5. Start the Server

Run this command from the project root:

node backend/server.js

6. Open the Application

Open your browser and visit:

http://localhost:3000

Project Structure

- backend/ - Server-side code and APIs
- frontend/ - User interface and web pages
- package.json - Project dependencies
- README.md - Project documentation

Database

Database Name: "mediguide_db"

Project Purpose

The purpose of MediGuide BD is to provide accessible health information and healthcare service details through a simple web application.