# Troubleshooting: "Error connecting to server" in Resume Analyzer

## Quick Checklist

1. ✅ **Django Backend is Running**
   - Open a terminal and run: `python manage.py runserver`
   - Should see: `Starting development server at http://127.0.0.1:8000/`
   - Keep this terminal open!

2. ✅ **React Frontend is Running**
   - Should be at `http://localhost:3000`
   - Check browser console (F12) for errors

3. ✅ **You are Logged In**
   - Make sure you're authenticated
   - Check if auth token is valid

4. ✅ **CORS is Configured**
   - Check `backend/settings.py` has:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
   ]
   ```

## Step-by-Step Debugging

### Step 1: Verify Django Server is Running

**Open PowerShell and run:**
```powershell
cd D:\College_project02\resume-project
.\backend-env\Scripts\Activate.ps1
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**If you see errors:**
- Check if port 8000 is already in use
- Check if MySQL is running
- Check if `.env` file exists with `GEMINI_API_KEY`

### Step 2: Test API Endpoint Directly

**Open browser and go to:**
```
http://127.0.0.1:8000/api/hello/
```

**Expected response:**
```json
{"message":"Hello from Django!"}
```

**If this doesn't work:**
- Django server is not running or not accessible
- Check firewall settings
- Try `http://localhost:8000/api/hello/` instead

### Step 3: Check Browser Console

1. Open React app in browser (`http://localhost:3000`)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to analyze a resume
5. Look for error messages

**Common errors:**

**CORS Error:**
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/analyze/' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:** Check CORS settings in `backend/settings.py`

**401 Unauthorized:**
```
Request failed with status code 401
```
**Solution:** You need to login again. Token might be expired.

**Network Error:**
```
Network Error
```
**Solution:** Django server is not running or not accessible.

### Step 4: Check Django Terminal for Errors

When you click "Analyze Resume", check the Django terminal for errors:

**Common Django Errors:**

**Import Error:**
```
ModuleNotFoundError: No module named 'analyse_pdf'
```
**Solution:** The analyzer script can't find the Flask analyzer module. Check if `frontend/public/Analyzer/analyse_pdf.py` exists.

**Database Error:**
```
django.db.utils.OperationalError: (2003, "Can't connect to MySQL server")
```
**Solution:** 
- Start MySQL server
- Check database credentials in `backend/settings.py`
- Verify database `resume_builder_db` exists

**File Not Found:**
```
FileNotFoundError: [Errno 2] No such file or directory: 'media/temp'
```
**Solution:** Create the directory:
```powershell
mkdir media\temp
```

### Step 5: Verify Authentication

1. Open browser console (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Check **Local Storage** or **Session Storage**
4. Look for `authTokens` key
5. Verify it has `access` and `refresh` tokens

**If tokens are missing:**
- Logout and login again
- Check `AuthContext.js` for token storage

### Step 6: Check API Endpoint URL

The frontend calls: `http://127.0.0.1:8000/api/analyze/`

**Verify this matches Django URLs:**
- Check `api/urls.py` has: `path('analyze/', ResumeAnalysisView.as_view(), name='analyze')`
- Check `backend/urls.py` includes: `path('api/', include('api.urls'))`

### Step 7: Test with Postman/curl (Advanced)

**Using PowerShell:**
```powershell
# First, get a token (replace with your actual credentials)
$body = @{
    username = "your_username"
    password = "your_password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method Post -Body $body -ContentType "application/json"
$token = $response.access

# Test analyze endpoint (you'll need to create a test file)
# This is just to verify the endpoint is accessible
```

## Common Solutions

### Solution 1: Restart Both Servers

1. **Stop Django server:** Press `CTRL+C` in Django terminal
2. **Stop React server:** Press `CTRL+C` in React terminal
3. **Restart Django:**
   ```powershell
   cd D:\College_project02\resume-project
   .\backend-env\Scripts\Activate.ps1
   python manage.py runserver
   ```
4. **Restart React:**
   ```powershell
   cd D:\College_project02\resume-project\frontend
   npm start
   ```

### Solution 2: Clear Browser Cache

1. Press `CTRL+SHIFT+DELETE`
2. Clear cached images and files
3. Reload the page (`CTRL+F5`)

### Solution 3: Check Firewall/Antivirus

- Temporarily disable firewall/antivirus
- Check if they're blocking `localhost:8000` or `127.0.0.1:8000`

### Solution 4: Use localhost instead of 127.0.0.1

If `127.0.0.1:8000` doesn't work, try `localhost:8000`:

**Update `AnalyzerPage.js`:**
```javascript
// Change from:
'http://127.0.0.1:8000/api/analyze/'
// To:
'http://localhost:8000/api/analyze/'
```

### Solution 5: Check .env File

Make sure `.env` file exists in `resume-project` directory:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

## Still Not Working?

1. **Check Django logs** in the terminal running `runserver`
2. **Check browser console** (F12) for detailed error messages
3. **Verify both servers are running** simultaneously
4. **Check network tab** in browser DevTools to see the actual HTTP request/response

## Quick Test Commands

**Test Django is running:**
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/hello/" -Method GET
```

**Check if port 8000 is in use:**
```powershell
netstat -ano | findstr :8000
```

**Check if port 3000 is in use:**
```powershell
netstat -ano | findstr :3000
```
