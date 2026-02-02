# Installation Checklist

Use this checklist to ensure you've completed all setup steps.

## ✅ Software Installation

- [ ] **Node.js installed**
  - Version: `node --version` shows v14 or higher
  - npm installed: `npm --version` works

- [ ] **MySQL Server installed**
  - MySQL installed: `mysql --version` works
  - MySQL service is running
  - Root password is set and remembered

- [ ] **VS Code installed** (or another code editor)
  - VS Code opens successfully
  - Can open project folder

## ✅ Project Setup

- [ ] **Project folder opened in VS Code**
  - Folder: `D:\new project`
  - All files are visible

- [ ] **Dependencies installed**
  - Ran `npm install` successfully
  - No errors in terminal
  - `node_modules` folder exists

## ✅ Database Setup

- [ ] **MySQL service running**
  - Checked in Services (services.msc)
  - Status shows "Running"

- [ ] **Database created**
  - Database `skillhire_db` exists
  - Verified with `SHOW DATABASES;`

- [ ] **Schema imported**
  - Ran `mysql -u root -p skillhire_db < database/schema.sql`
  - Or imported via MySQL Workbench
  - No errors during import

- [ ] **Tables verified**
  - Can see tables: users, jobs, applications, etc.
  - Admin user exists

## ✅ Configuration

- [ ] **.env file created**
  - Copied from `.env.example`
  - Renamed to `.env`

- [ ] **.env file configured**
  - DB_PASSWORD set to MySQL root password
  - JWT_SECRET changed to random string
  - All other values set correctly

- [ ] **uploads folder created**
  - Folder exists in project root
  - Named: `uploads`

## ✅ Server Startup

- [ ] **Server starts successfully**
  - Ran `npm start`
  - No errors in terminal
  - Shows "Server running on port 3000"

- [ ] **Database connects**
  - Terminal shows "Database connected successfully"
  - No connection errors

- [ ] **Application accessible**
  - Can open `http://localhost:3000` in browser
  - Homepage loads correctly

## ✅ Testing

- [ ] **Admin login works**
  - Email: `admin@skillhire.com`
  - Password: `admin123`
  - Can access admin panel

- [ ] **Registration works**
  - Can create new account
  - Can select role (Job Seeker/Employer)
  - Registration completes successfully

- [ ] **Pages load correctly**
  - Home page works
  - Login page works
  - Register page works
  - Dashboard pages work (after login)

## 🎯 All Done!

If all items are checked, your SkillHire application is fully set up and ready to use!

---

## Quick Commands Reference

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MySQL version
mysql --version

# Install dependencies
npm install

# Start server
npm start

# Start server with auto-reload (development)
npm run dev

# Connect to MySQL
mysql -u root -p

# Import database
mysql -u root -p skillhire_db < database/schema.sql
```

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

