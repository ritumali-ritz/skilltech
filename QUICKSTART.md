# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE skillhire_db;"

# Import schema
mysql -u root -p skillhire_db < database/schema.sql
```

### 3. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your MySQL credentials
```

### 4. Create Uploads Directory
```bash
mkdir uploads
```

### 5. Start Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 6. Access Application
- Open browser: http://localhost:3000
- Admin Login: admin@skillhire.com / admin123

## 📝 Default Credentials

**Admin Account:**
- Email: `admin@skillhire.com`
- Password: `admin123`

⚠️ **Change these immediately after first login!**

## 🎯 Test the Application

1. **Register** as a Job Seeker
2. **Add skills** to your profile
3. **Browse jobs** and see recommendations
4. **Apply** to a job
5. **Register** as an Employer
6. **Post a job** (will be pending admin approval)
7. **Login as admin** to approve jobs

## 🔧 Common Commands

```bash
# Generate admin password hash
node scripts/generate-admin-hash.js [password]

# Setup database automatically
node scripts/setup-database.js

# Check if server is running
curl http://localhost:3000/api/health
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the UI in `public/css/style.css`
- Add more skills in the database
- Deploy to production (see README.md deployment section)

## ❓ Need Help?

Check the [README.md](README.md) for:
- Detailed setup instructions
- API documentation
- Deployment guide
- Troubleshooting section

