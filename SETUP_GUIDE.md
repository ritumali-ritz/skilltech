# Complete Setup Guide - From Scratch

This guide will walk you through setting up the SkillHire project from the very beginning, including downloading and installing all required software.

## 📋 What You'll Need

1. **Node.js** (JavaScript runtime)
2. **MySQL Server** (Database)
3. **A Code Editor** (VS Code recommended)
4. **Git** (Optional, for version control)

---

## Step 1: Download and Install Node.js

### Windows:

1. **Go to Node.js website:**
   - Visit: https://nodejs.org/
   - You'll see two versions: **LTS** (recommended) and **Current**
   - Click the **LTS** version button (e.g., "20.x.x LTS")

2. **Download:**
   - The website will automatically detect your Windows system
   - Click the download button for Windows Installer (.msi)

3. **Install:**
   - Double-click the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - ✅ **Important:** Check "Automatically install the necessary tools" if prompted
   - Click "Install" (you may need admin privileges)
   - Wait for installation to complete
   - Click "Finish"

4. **Verify Installation:**
   - Open **Command Prompt** (Press `Win + R`, type `cmd`, press Enter)
   - Type: `node --version`
   - You should see something like: `v20.x.x`
   - Type: `npm --version`
   - You should see something like: `10.x.x`

✅ **Node.js is now installed!**

---

## Step 2: Download and Install MySQL Server

### Windows:

1. **Go to MySQL website:**
   - Visit: https://dev.mysql.com/downloads/installer/
   - Scroll down to "MySQL Installer for Windows"
   - Click "Download" button (choose the larger file, usually 400+ MB)

2. **Choose Setup Type:**
   - Select **"Developer Default"** (includes MySQL Server + tools)
   - Click "Next"

3. **Installation:**
   - Click "Execute" to install all components
   - Wait for all components to install (this may take 10-15 minutes)
   - Click "Next" when done

4. **Configuration:**
   - **Type and Networking:** Keep defaults, click "Next"
   - **Authentication Method:** Select **"Use Strong Password Encryption"**, click "Next"
   - **Accounts and Roles:**
     - **Root Password:** Create a strong password (remember this!)
     - Example: `MySecurePass123!`
     - ✅ **Write this password down!** You'll need it later
     - Click "Next"
   - **Windows Service:** Keep defaults, click "Next"
   - **Apply Configuration:** Click "Execute"
   - Wait for configuration to complete
   - Click "Finish"

5. **Verify Installation:**
   - Open **Command Prompt**
   - Type: `mysql --version`
   - You should see: `mysql Ver 8.x.x`

✅ **MySQL is now installed!**

---

## Step 3: Install VS Code (Code Editor)

1. **Download VS Code:**
   - Visit: https://code.visualstudio.com/
   - Click "Download for Windows"
   - The installer will download automatically

2. **Install:**
   - Double-click the downloaded `.exe` file
   - Check "Add to PATH" during installation
   - Click "Install"
   - Click "Finish"

3. **Open VS Code:**
   - Launch VS Code
   - Go to **File → Open Folder**
   - Navigate to your project folder: `D:\new project`

✅ **VS Code is ready!**

---

## Step 4: Set Up Your Project

### 4.1 Open Project in VS Code

1. Open VS Code
2. Click **File → Open Folder**
3. Navigate to: `D:\new project`
4. Click "Select Folder"

### 4.2 Install Project Dependencies

1. **Open Terminal in VS Code:**
   - Press `Ctrl + `` (backtick) or go to **Terminal → New Terminal**

2. **Install npm packages:**
   ```bash
   npm install
   ```
   - This will install all required packages (Express, MySQL, etc.)
   - Wait for it to complete (may take 2-3 minutes)

✅ **Dependencies installed!**

---

## Step 5: Set Up MySQL Database

### 5.1 Start MySQL Service

1. **Open Services:**
   - Press `Win + R`
   - Type: `services.msc`
   - Press Enter

2. **Find MySQL:**
   - Look for "MySQL80" or "MySQL"
   - Right-click → **Start** (if not already running)
   - Status should show "Running"

### 5.2 Create Database

1. **Open MySQL Command Line:**
   - Press `Win + R`
   - Type: `cmd`
   - Press Enter

2. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```
   - Enter your root password (the one you set during installation)
   - Press Enter

3. **Create Database:**
   ```sql
   CREATE DATABASE skillhire_db;
   ```
   - Press Enter
   - You should see: `Query OK, 1 row affected`

4. **Verify:**
   ```sql
   SHOW DATABASES;
   ```
   - You should see `skillhire_db` in the list

5. **Exit MySQL:**
   ```sql
   exit;
   ```

### 5.3 Import Database Schema

**Option A: Using Command Line (Recommended)**

1. Open Command Prompt
2. Navigate to your project folder:
   ```bash
   cd "D:\new project"
   ```
3. Import the schema:
   ```bash
   mysql -u root -p skillhire_db < database/schema.sql
   ```
4. Enter your MySQL root password when prompted
5. Wait for import to complete (no errors = success!)

**Option B: Using MySQL Workbench (Easier for beginners)**

1. **Download MySQL Workbench:**
   - Visit: https://dev.mysql.com/downloads/workbench/
   - Download and install

2. **Open MySQL Workbench:**
   - Launch the application
   - Connect to your MySQL server (click on the connection)
   - Enter your root password

3. **Import Schema:**
   - Click **File → Open SQL Script**
   - Navigate to: `D:\new project\database\schema.sql`
   - Click **Execute** button (lightning bolt icon)
   - Wait for "Script executed successfully"

✅ **Database is ready!**

---

## Step 6: Configure Environment Variables

### 6.1 Create .env File

1. In VS Code, look for `.env.example` file in the project root
2. **Right-click** on `.env.example`
3. Select **"Copy"**
4. **Right-click** in the same folder
5. Select **"Paste"**
6. **Rename** the copied file to `.env` (remove `.example`)

### 6.2 Edit .env File

1. Open `.env` file in VS Code
2. Update these values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YourMySQLPasswordHere
DB_NAME=skillhire_db

# JWT Secret Key (Change this to a random string!)
JWT_SECRET=my_super_secret_jwt_key_12345_change_this

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Important:**
- Replace `YourMySQLPasswordHere` with your actual MySQL root password
- Change `JWT_SECRET` to any random string (e.g., `skillhire_secret_key_2024`)

3. **Save the file** (Ctrl + S)

✅ **Configuration done!**

---

## Step 7: Create Uploads Directory

1. In VS Code, right-click in the project root folder
2. Select **"New Folder"**
3. Name it: `uploads`
4. Press Enter

✅ **Uploads folder created!**

---

## Step 8: Start the Server

### 8.1 Start MySQL (if not running)

- Open Services (`Win + R` → `services.msc`)
- Ensure MySQL is running

### 8.2 Start Node.js Server

1. **Open Terminal in VS Code:**
   - Press `Ctrl + `` (backtick)

2. **Start the server:**
   ```bash
   npm start
   ```

3. **You should see:**
   ```
   🚀 SkillHire Server running on port 3000
   📡 API available at http://localhost:3000/api
   🌐 Frontend available at http://localhost:3000
   ✅ Database connected successfully!
   ```

✅ **Server is running!**

---

## Step 9: Access the Application

1. **Open your web browser** (Chrome, Firefox, Edge, etc.)

2. **Navigate to:**
   ```
   http://localhost:3000
   ```

3. **You should see the SkillHire homepage!**

---

## Step 10: Test the Application

### 10.1 Login as Admin

1. Click **"Login"** button
2. Use these credentials:
   - **Email:** `admin@skillhire.com`
   - **Password:** `admin123`
3. Click **"Login"**
4. You should be redirected to the Admin Panel

### 10.2 Register a New User

1. Click **"Register"**
2. Fill in the form:
   - Select **"Job Seeker"** or **"Employer"**
   - Enter your details
   - Create a password
3. Click **"Create Account"**
4. You'll be automatically logged in

### 10.3 Test Features

- Browse jobs
- Apply for jobs (as Job Seeker)
- Post jobs (as Employer)
- View admin panel

---

## 🎉 Congratulations!

Your SkillHire application is now running!

---

## 🔧 Troubleshooting

### Problem: "npm: command not found"

**Solution:**
- Restart your computer after installing Node.js
- Or add Node.js to PATH manually

### Problem: "MySQL connection error"

**Solutions:**
1. Check if MySQL service is running:
   - `Win + R` → `services.msc` → Check MySQL status
2. Verify password in `.env` file
3. Check if database exists:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### Problem: "Port 3000 already in use"

**Solution:**
- Change PORT in `.env` to `3001` or another number
- Or close the program using port 3000

### Problem: "Cannot find module"

**Solution:**
- Run `npm install` again in the project folder

### Problem: Database import fails

**Solution:**
- Make sure you're in the project root folder
- Check the file path: `database/schema.sql`
- Try using MySQL Workbench instead

---

## 📚 Next Steps

1. **Explore the code:**
   - Open files in VS Code
   - Read the comments
   - Understand the structure

2. **Customize:**
   - Change colors in `public/css/style.css`
   - Modify pages in `public/` folder
   - Update database schema if needed

3. **Learn:**
   - Read `README.md` for detailed documentation
   - Check `QUICKSTART.md` for quick reference
   - Review `PREVIEW.md` for UI overview

4. **Deploy:**
   - Follow deployment guide in `README.md`
   - Deploy to free hosting (Render, Heroku)

---

## 💡 Tips

- **Keep MySQL running** while developing
- **Save files** before testing changes
- **Check terminal** for error messages
- **Use VS Code** for better code editing
- **Read error messages** - they usually tell you what's wrong

---

## 🆘 Need Help?

1. Check the error message in the terminal
2. Read the `README.md` troubleshooting section
3. Verify all steps were completed correctly
4. Make sure all software is installed and running

---

**Happy Coding! 🚀**

