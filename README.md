# SkillTech - Modern Job Portal & Recruitment Management System

**SkillTech** is a comprehensive, full-stack **Job Portal & Recruitment Management System** designed to bridge the gap between talented job seekers and employers. Built with a focus on modern aesthetics and seamless user experience, it provides a robust platform for career growth and talent acquisition.

---

### **🚀 Key Features**

*   **Dual-User Ecosystem**: Dedicated dashboards and tailored workflows for both **Job Seekers** (to find and apply for jobs) and **Employers** (to post listings and manage applications).
*   **Advanced Job Discovery**: Dynamic search and filtering system that allows users to browse jobs based on categories, skills, and industry requirements.
*   **Secure Authentication**: Role-based access control (RBAC) ensuring that sensitive information and administrative tools are accessible only to authorized users.
*   **Real-time Admin Oversight**: A centralized **Admin Panel** to monitor platform activity, manage registered companies, and curate skill sets.
*   **Modern Interactive UI**: A premium, responsive interface featuring smooth transitions, glassmorphism elements, and intuitive navigation for a professional feel.
*   **Automated Backend**: Powered by Node.js and Express, with a structured SQL database schema for efficient data handling and performance.

---

### **🛠️ Tech Stack**

*   **Frontend**: HTML5, CSS3 (Custom Design System), JavaScript (ES6+)
*   **Backend**: Node.js, Express.js
*   **Database**: SQL (Structured for scalability)
*   **Authentication**: JWT-based secure sessions
*   **Tools**: Git, dotenv (Environment Management), RESTful APIs

---

### **🎯 Objective**
The primary goal of **SkillTech** is to simplify the hiring process. By providing a clean, skill-focused environment, it ensures that the right talent finds the right opportunity without the noise of traditional job boards.

---

## 🚀 Features

### Core Functionality
- **Multi-Role System**: Job Seekers, Employers, and Admins
- **Smart Job Matching**: AI-powered skill-based job recommendations
- **Advanced Search & Filters**: Search by skills, location, category, job type
- **Application Tracking**: Real-time status updates (Pending, Accepted, Rejected)
- **Company Profiles**: Complete employer branding and company management
- **Resume Management**: Upload and manage resumes (PDF support)
- **Skill Management**: Add, remove, and track skills with proficiency levels

### User Roles

#### Job Seeker
- Create profile with skills and experience
- Get personalized job recommendations
- Apply to jobs with cover letters
- Track application status
- Save jobs for later
- Upload resume

#### Employer
- Post job openings with detailed requirements
- Manage company profile
- View and filter applicants
- Accept/reject applications
- Track job performance

#### Admin
- User management (activate/deactivate)
- Job approval system
- Platform analytics dashboard
- Delete fake/inappropriate jobs
- Audit logs

### Technical Features
- **RESTful API**: Complete backend API with Express.js
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: bcrypt password hashing
- **File Uploads**: Multer for resume and profile photo handling
- **Database**: MySQL with proper relationships and indexing
- **Responsive Design**: Mobile-first, fully responsive UI
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Glassmorphism design with smooth animations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher, or MariaDB)
- **npm** or **yarn**

## 🛠️ Installation & Setup

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd skillhire-job-portal

# Or extract the downloaded zip file
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- bcryptjs
- jsonwebtoken
- dotenv
- multer
- cors
- express-validator
- nodemailer

### Step 3: Database Setup

1. **Create MySQL Database**:
   ```sql
   CREATE DATABASE skillhire_db;
   ```

2. **Import Schema**:
   ```bash
   mysql -u root -p skillhire_db < database/schema.sql
   ```
   
   Or using MySQL Workbench:
   - Open MySQL Workbench
   - Connect to your MySQL server
   - Open `database/schema.sql`
   - Execute the script

3. **Verify Tables**:
   ```sql
   USE skillhire_db;
   SHOW TABLES;
   ```
   
   You should see: users, companies, jobs, applications, skills, user_skills, job_skills, saved_jobs, admin_logs

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your settings:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=skillhire_db

   # JWT Secret Key (IMPORTANT: Change this!)
   JWT_SECRET=your_super_secret_jwt_key_change_in_production

   # File Upload Configuration
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   ```

### Step 5: Create Uploads Directory

```bash
mkdir uploads
```

### Step 6: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### Step 7: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## 🔐 Default Admin Credentials

**⚠️ IMPORTANT: Change these credentials immediately after first login!**

- **Email**: admin@skillhire.com
- **Password**: admin123

To change the admin password:
1. Login as admin
2. Or update directly in database:
   ```sql
   -- Generate new password hash using Node.js:
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('new_password', 10).then(h => console.log(h));"
   
   -- Then update in MySQL:
   UPDATE users SET password = 'generated_hash_here' WHERE email = 'admin@skillhire.com';
   ```

## 📁 Project Structure

```
skillhire-job-portal/
├── config/
│   └── database.js          # MySQL connection configuration
├── database/
│   └── schema.sql           # Complete database schema
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── app.js           # Core JavaScript utilities
│   │   ├── home.js          # Home page logic
│   │   ├── register.js      # Registration logic
│   │   ├── login.js          # Login logic
│   │   ├── job-seeker-dashboard.js
│   │   ├── employer-dashboard.js
│   │   ├── admin-panel.js
│   │   ├── browse-jobs.js
│   │   └── job-details.js
│   ├── index.html           # Home page
│   ├── register.html
│   ├── login.html
│   ├── job-seeker-dashboard.html
│   ├── employer-dashboard.html
│   ├── admin-panel.html
│   ├── browse-jobs.html
│   └── job-details.html
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── jobs.js              # Job management routes
│   ├── applications.js      # Application routes
│   ├── users.js             # User profile routes
│   ├── skills.js            # Skills routes
│   ├── companies.js         # Company routes
│   └── admin.js             # Admin routes
├── utils/
│   └── helpers.js           # Utility functions
├── uploads/                 # File uploads directory
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Example environment file
├── .gitignore
├── package.json
├── server.js                # Main server file
└── README.md
```

## 🔄 Data Flow Explanation

### Authentication Flow

1. **Registration**:
   ```
   Frontend (register.html) 
   → POST /api/auth/register 
   → Backend validates & hashes password 
   → Creates user in database 
   → Returns JWT token 
   → Frontend stores token in localStorage
   ```

2. **Login**:
   ```
   Frontend (login.html) 
   → POST /api/auth/login 
   → Backend verifies credentials 
   → Returns JWT token 
   → Frontend stores token & redirects based on role
   ```

3. **Protected Routes**:
   ```
   Frontend request 
   → Includes JWT in Authorization header 
   → Middleware verifies token 
   → Extracts user info 
   → Allows/denies access
   ```

### Skill Matching Algorithm

The skill matching system works as follows:

1. **User Skills**: Job seeker adds skills to their profile
2. **Job Requirements**: Employer specifies required skills for a job
3. **Matching Process**:
   ```javascript
   matchScore = (matchedSkills / totalRequiredSkills) * 100
   ```
4. **Recommendations**: Jobs are sorted by match score (highest first)
5. **Display**: Top 10 matching jobs shown to user

**Example**:
- Job requires: JavaScript, React, Node.js (3 skills)
- User has: JavaScript, React, Python (2 matches)
- Match Score: (2/3) * 100 = 67%

### Job Application Flow

1. **Job Seeker** browses jobs
2. **Clicks "Apply"** → Opens application form
3. **Submits application** → POST /api/applications
4. **Backend creates** application record with status "pending"
5. **Employer views** applications in dashboard
6. **Employer updates** status (accept/reject)
7. **Job Seeker sees** updated status in "My Applications"

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (Employer only)
- `GET /api/jobs/recommended/:userId` - Get recommended jobs

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applicants for job
- `PATCH /api/applications/:id/status` - Update application status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/skills` - Add skill
- `DELETE /api/users/skills/:id` - Remove skill
- `POST /api/users/saved-jobs` - Save job
- `GET /api/users/saved-jobs` - Get saved jobs

### Companies
- `GET /api/companies/my-company` - Get company profile
- `POST /api/companies` - Create/update company

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/categories` - Get skill categories

### Admin
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/jobs` - Get all jobs
- `PATCH /api/admin/jobs/:id/status` - Update job status
- `DELETE /api/admin/jobs/:id` - Delete job

## 🚀 Deployment Guide

### Option 1: Free Hosting (Recommended for Beginners)

#### Using Render.com (Free Tier)

1. **Prepare for Deployment**:
   - Update `.env` with production values
   - Set `NODE_ENV=production`
   - Update `JWT_SECRET` to a strong random string

2. **Database Setup**:
   - Use **PlanetScale** (free MySQL) or **Railway** (free PostgreSQL)
   - Import your schema
   - Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env`

3. **Deploy to Render**:
   - Create account at [render.com](https://render.com)
   - Click "New Web Service"
   - Connect your GitHub repository
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables from `.env`

4. **Static Files**:
   - Render serves static files automatically
   - Ensure `public` folder is included

#### Using Heroku (Alternative)

1. Create `Procfile`:
   ```
   web: node server.js
   ```

2. Deploy:
   ```bash
   heroku create skillhire-app
   heroku addons:create cleardb:ignite
   heroku config:set JWT_SECRET=your_secret
   git push heroku main
   ```

### Option 2: VPS Deployment (Advanced)

1. **Server Setup** (Ubuntu):
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server
   sudo mysql_secure_installation
   
   # Install PM2 (Process Manager)
   sudo npm install -g pm2
   ```

2. **Upload Project**:
   ```bash
   # Using SCP or SFTP
   scp -r skillhire-job-portal user@your-server:/var/www/
   ```

3. **Configure**:
   ```bash
   cd /var/www/skillhire-job-portal
   npm install
   # Edit .env file
   # Import database schema
   ```

4. **Start with PM2**:
   ```bash
   pm2 start server.js --name skillhire
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx** (Reverse Proxy):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL Certificate** (Let's Encrypt):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=skillhire_db
JWT_SECRET=generate_strong_random_string_here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Generate Strong JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🧪 Testing the Application

### Manual Testing Checklist

1. **Registration**:
   - [ ] Register as Job Seeker
   - [ ] Register as Employer
   - [ ] Test password strength checker
   - [ ] Test form validation

2. **Login**:
   - [ ] Login with correct credentials
   - [ ] Test incorrect credentials
   - [ ] Test role-based redirect

3. **Job Seeker**:
   - [ ] Update profile
   - [ ] Add skills
   - [ ] View recommended jobs
   - [ ] Apply to job
   - [ ] Save job
   - [ ] Track applications

4. **Employer**:
   - [ ] Create company profile
   - [ ] Post job
   - [ ] View applicants
   - [ ] Accept/reject applications

5. **Admin**:
   - [ ] View analytics
   - [ ] Manage users
   - [ ] Approve jobs
   - [ ] Delete jobs

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check MySQL is running: `sudo systemctl status mysql`
   - Verify credentials in `.env`
   - Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

2. **Port Already in Use**:
   - Change PORT in `.env`
   - Or kill process: `lsof -ti:3000 | xargs kill`

3. **File Upload Errors**:
   - Check `uploads/` directory exists
   - Verify permissions: `chmod 755 uploads`
   - Check file size limits

4. **JWT Token Errors**:
   - Verify `JWT_SECRET` is set in `.env`
   - Clear localStorage and login again
   - Check token expiration

5. **CORS Errors**:
   - Ensure CORS is enabled in `server.js`
   - Check API URL in frontend

## 📚 Learning Resources

### Understanding the Codebase

1. **Backend Architecture**:
   - Express.js routing
   - Middleware pattern
   - Database queries with mysql2
   - JWT authentication

2. **Frontend Architecture**:
   - Vanilla JavaScript (no framework)
   - Fetch API for HTTP requests
   - LocalStorage for state management
   - DOM manipulation

3. **Database Design**:
   - Relational database concepts
   - Foreign keys and relationships
   - Indexing for performance
   - Normalization

### Next Steps for Enhancement

- [ ] Add email notifications
- [ ] Implement real-time chat
- [ ] Add job alerts
- [ ] Implement advanced search with Elasticsearch
- [ ] Add resume parsing with AI
- [ ] Implement payment gateway for premium features
- [ ] Add multi-language support
- [ ] Implement Redis caching
- [ ] Add unit and integration tests
- [ ] Implement CI/CD pipeline

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or contributions, please open an issue on the repository.

## 🎓 Educational Purpose

This project is designed for learning purposes and demonstrates:
- Full-stack web development
- RESTful API design
- Database design and relationships
- Authentication and authorization
- File upload handling
- Modern UI/UX design
- Deployment practices

---

**Built with ❤️ for learning and real-world deployment**

