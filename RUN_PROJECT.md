# Step-by-Step Guide to Run the Resume Project

This guide will help you set up and run the complete Django + React Resume Builder and Analyzer project.

## Prerequisites

Before starting, ensure you have installed:
- **Python 3.8+** (Check with `python --version` or `python3 --version`)
- **Node.js 14+** and **npm** (Check with `node --version` and `npm --version`)
- **MySQL Server** (Check with `mysql --version`)
- **Git** (optional, for cloning)

---

## Part 1: Backend Setup (Django)

### Step 1: Navigate to Project Directory
```bash
cd resume-project
```

### Step 2: Create Python Virtual Environment (if not already created)
```bash
# Windows
python -m venv backend-env

# macOS/Linux
python3 -m venv backend-env
```

### Step 3: Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\backend-env\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
backend-env\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source backend-env/bin/activate
```

You should see `(backend-env)` in your terminal prompt.

### Step 4: Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Note:** This may take a few minutes. If you encounter errors:
- On Windows, you might need Visual C++ Build Tools for some packages
- For MySQL issues, install `mysqlclient` separately or use `pip install mysqlclient` (may require MySQL development libraries)

### Step 5: Set Up MySQL Database

1. **Open MySQL Command Line or MySQL Workbench**

2. **Create the database:**
```sql
CREATE DATABASE resume_builder_db;
```

3. **Verify the database was created:**
```sql
SHOW DATABASES;
```

### Step 6: Create Environment File (.env)

Create a `.env` file in the `resume-project` directory (same level as `manage.py`):

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Windows (Command Prompt)
type nul > .env

# macOS/Linux
touch .env
```

**Add the following content to `.env`:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**To get a Gemini API Key:**
1. Go to https://ai.google.dev/
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one
5. Copy the key and paste it in the `.env` file

### Step 7: Run Django Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

This creates all necessary database tables.

### Step 8: Create Media Directory (if it doesn't exist)
```bash
# Windows
mkdir media
mkdir media\temp

# macOS/Linux
mkdir -p media/temp
```

### Step 9: Start Django Development Server
```bash
python manage.py runserver
```

**You should see:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Keep this terminal window open!** The Django server must be running.

---

## Part 2: Frontend Setup (React)

### Step 10: Open a NEW Terminal Window

**Important:** Keep the Django server running in the first terminal, and open a new terminal for the React frontend.

### Step 11: Navigate to Frontend Directory
```bash
cd resume-project/frontend
```

### Step 12: Install Node Dependencies
```bash
npm install
```

**Note:** This may take a few minutes. If you encounter errors:
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- On Windows, you might need to run PowerShell as Administrator

### Step 13: Start React Development Server
```bash
npm start
```

**You should see:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

The React app will automatically open in your browser at `http://localhost:3000`

---

## Part 3: Verify Everything is Working

### Step 14: Check Both Servers are Running

1. **Django Backend:** Should be running at `http://127.0.0.1:8000`
   - Test: Open `http://127.0.0.1:8000/api/hello/` in browser
   - Should see: `{"message":"Hello from Django!"}`

2. **React Frontend:** Should be running at `http://localhost:3000`
   - Should automatically open in browser
   - You should see the login/register page

### Step 15: Create a Test User Account

1. Click on **"Register"** or navigate to `/register`
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `testpass123`
3. Click **Register**
4. You should be redirected to the login page

### Step 16: Login and Test Features

1. **Login** with your credentials
2. You should see the **HomePage** with two cards:
   - **Resume Builder** - Create resumes
   - **Resume Analyzer** - Analyze existing resumes

3. **Test Resume Analyzer:**
   - Click **"Analyze Now"** button
   - Upload a PDF resume
   - Paste a job description
   - Click **"Analyze Resume"**
   - Wait for analysis (may take 30-60 seconds)
   - You should see results with match score, skills, recommendations, etc.

---

## Troubleshooting

### Issue: Django Server Won't Start

**Error: "ModuleNotFoundError"**
- Solution: Make sure virtual environment is activated and all dependencies are installed
```bash
pip install -r requirements.txt
```

**Error: "Can't connect to MySQL server"**
- Solution: 
  1. Check MySQL is running: `mysql -u root -p`
  2. Verify database exists: `SHOW DATABASES;`
  3. Check `settings.py` has correct MySQL credentials

**Error: "GEMINI_API_KEY not found"**
- Solution: Create `.env` file in `resume-project` directory with:
```env
GEMINI_API_KEY=your_key_here
```

### Issue: React Server Won't Start

**Error: "Port 3000 is already in use"**
- Solution: Kill the process using port 3000 or use a different port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Error: "Module not found"**
- Solution: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS Errors in Browser Console

- Solution: Make sure Django CORS settings allow `http://localhost:3000`
- Check `backend/settings.py` has:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Issue: Analysis Fails with API Error

- Solution: 
  1. Check your Gemini API key is valid in `.env`
  2. Check API quota hasn't been exceeded (free tier: 20 requests/day)
  3. Wait a few hours if quota is exceeded

---

## Quick Start Commands Summary

**Terminal 1 (Backend):**
```bash
cd resume-project
backend-env\Scripts\activate  # Windows
# OR
source backend-env/bin/activate  # macOS/Linux
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd resume-project/frontend
npm start
```

---

## Project Structure

```
resume-project/
├── backend/              # Django backend settings
├── api/                  # Django app (models, views, urls)
├── frontend/             # React frontend
│   ├── src/
│   │   ├── pages/       # React pages (HomePage, AnalyzerPage, etc.)
│   │   ├── components/  # React components
│   │   └── context/     # React context (AuthContext)
│   └── public/
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create this!)
└── db.sqlite3          # SQLite database (if not using MySQL)
```

---

## Next Steps

1. **Explore the Resume Builder:** Create and customize resumes
2. **Test the Analyzer:** Upload resumes and analyze them against job descriptions
3. **Download Reports:** Generate PDF reports from analysis results
4. **Customize:** Modify styles, add features, or integrate additional APIs

---

## Stopping the Servers

- **Django:** Press `CTRL+C` in the Django terminal
- **React:** Press `CTRL+C` in the React terminal

---

## Need Help?

- Check Django logs in the terminal running `runserver`
- Check React errors in the browser console (F12)
- Verify all environment variables are set correctly
- Ensure both servers are running simultaneously

Good luck! 🚀
