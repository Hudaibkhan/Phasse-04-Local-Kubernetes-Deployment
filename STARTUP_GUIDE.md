# 🚀 Startup Guide - Backend (Port 8001) + Frontend

## Quick Start

### Terminal 1: Backend (Port 8001)
```bash
cd Quantum-Todo-Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 Prerequisites Checklist

### Backend Requirements
- [ ] Python 3.11+ installed
- [ ] Virtual environment activated (optional but recommended)
- [ ] `.env` file exists with GEMINI_API_KEY
- [ ] Neon PostgreSQL database accessible
- [ ] Port 8001 is available

### Frontend Requirements
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] `.env.local` configured to point to `http://localhost:8001/api`

---

## 🔧 Detailed Setup Instructions

### Step 1: Backend Setup

#### 1.1 Navigate to Backend Directory
```bash
cd E:\Q4_Officail\hackathon_02\evolution_todo\Quantum-Todo-Backend
```

#### 1.2 Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Linux/Mac
source venv/bin/activate
```

#### 1.3 Install Dependencies
```bash
pip install -r requirements.txt
```

**Expected packages:**
- fastapi
- uvicorn[standard]
- sqlmodel
- openai-agents>=0.2.0
- python-dotenv
- And more...

#### 1.4 Verify Environment Variables
Check your `.env` file has:
```env
DATABASE_URL=postgresql://...
GEMINI_API_KEY=AIzaSyBI9dPTqH0xXILv0S3VMM_I_vzVKLl0uLQ
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_for_testing
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### 1.5 Start Backend Server on Port 8001
```bash
uvicorn main:app --reload --port 8001
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### 1.6 Verify Backend is Running
Open browser: http://localhost:8001/docs

You should see the FastAPI Swagger documentation.

---

### Step 2: Frontend Setup

#### 2.1 Navigate to Frontend Directory
```bash
cd E:\Q4_Officail\hackathon_02\evolution_todo\frontend
```

#### 2.2 Verify Environment Configuration
Check `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

✅ **Already configured!**

#### 2.3 Install Dependencies
```bash
npm install
```

**Expected packages:**
- next@15.5.9
- react@18.3.1
- tailwindcss@3.4.1
- And more...

#### 2.4 Start Frontend Development Server
```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.5.9
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.5s
```

#### 2.5 Open Application
Open browser: http://localhost:3000

---

## 🧪 Testing the Integration

### Test 1: Backend Health Check
```bash
curl http://localhost:8001/docs
```
✅ Should return FastAPI documentation page

### Test 2: Frontend API Connection
1. Open http://localhost:3000
2. Open browser DevTools (F12)
3. Check Console for: `Using API Base URL: http://localhost:8001/api`

### Test 3: Authentication Flow
1. Navigate to http://localhost:3000/signup
2. Create a test account
3. Login with credentials
4. Should redirect to dashboard

### Test 4: Chatbot Integration
1. Login to dashboard
2. Look for floating chat button (bottom-right corner)
3. Click chat button
4. Type: "Add a task to buy milk"
5. Task should appear in dashboard

### Test 5: Backend Logs
Check backend terminal for:
```
INFO:     Chat request from user <uuid> | Message length: 23 chars | IP: 127.0.0.1
INFO:     Processing message for user <uuid>: Add a task to buy milk...
INFO:     Task added for user <uuid>: Buy milk
INFO:     Agent response for user <uuid>: I've added a task...
INFO:     Chat success for user <uuid> | Processing time: 2.34s | Response length: 67 chars | Tool calls: 1
```

---

## 🔍 Troubleshooting

### Backend Issues

#### Error: "Port 8001 is already in use"
**Solution:**
```bash
# Find process using port 8001
netstat -ano | findstr :8001

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or use a different port
uvicorn main:app --reload --port 8002
# (Remember to update frontend .env.local)
```

#### Error: "GEMINI_API_KEY environment variable not set"
**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify GEMINI_API_KEY is set
cat .env | grep GEMINI_API_KEY

# If missing, add it:
echo "GEMINI_API_KEY=your_key_here" >> .env
```

#### Error: "Module 'agents' not found"
**Solution:**
```bash
pip install openai-agents>=0.2.0
```

#### Error: "Database connection failed"
**Solution:**
- Verify DATABASE_URL in .env
- Check Neon PostgreSQL is accessible
- Test connection: `psql <DATABASE_URL>`

### Frontend Issues

#### Error: "CORS policy blocked"
**Solution:**
Check backend `.env` has:
```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Restart backend after changing CORS settings.

#### Error: "Failed to fetch" in browser console
**Solution:**
1. Verify backend is running on port 8001
2. Check `.env.local` has correct API URL
3. Restart frontend dev server: `npm run dev`

#### Error: "Module not found" during npm install
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Chat button not appearing
**Solution:**
1. Check you're logged in
2. Navigate to /dashboard
3. Check browser console for errors
4. Verify ChatWidget is in dashboard layout

---

## 📊 Port Configuration Summary

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8001 | http://localhost:8001 |
| Backend Docs | 8001 | http://localhost:8001/docs |
| Frontend | 3000 | http://localhost:3000 |
| Database | Remote | Neon PostgreSQL |

---

## 🎯 Development Workflow

### Daily Startup
```bash
# Terminal 1: Backend
cd Quantum-Todo-Backend
venv\Scripts\activate  # If using venv
uvicorn main:app --reload --port 8001

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Making Changes

**Backend Changes:**
- Edit files in `Quantum-Todo-Backend/src/`
- Server auto-reloads (--reload flag)
- Check terminal for errors

**Frontend Changes:**
- Edit files in `frontend/src/`
- Next.js auto-reloads
- Check browser console for errors

**AI Agent Changes:**
- Edit `src/ai/agent.py` or `src/ai/connection.py`
- Backend auto-reloads
- Test with: `python test_agent.py`

### Stopping Services
```bash
# In each terminal, press:
Ctrl + C
```

---

## 🔐 Security Notes

### Development Mode
- Using HTTP (not HTTPS) for local development
- CORS allows localhost origins
- JWT tokens stored in localStorage
- Gemini API key in .env file

### Production Considerations
- Use HTTPS for all connections
- Restrict CORS to production domains
- Use HTTP-only cookies for tokens
- Store API keys in secure vault
- Enable rate limiting
- Add request logging

---

## 📝 Common Commands

### Backend
```bash
# Start server
uvicorn main:app --reload --port 8001

# Start with custom host
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Run tests
pytest

# Test agent standalone
python test_agent.py

# Check dependencies
pip list | grep openai
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check dependencies
npm list next react
```

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Backend terminal shows: `Application startup complete`
✅ Frontend terminal shows: `✓ Ready in X.Xs`
✅ Browser console shows: `Using API Base URL: http://localhost:8001/api`
✅ You can login to dashboard
✅ Chat button appears in bottom-right
✅ Typing "Add task" creates a task
✅ Task appears in dashboard immediately
✅ Backend logs show tool calls

---

## 📞 Need Help?

1. **Check Logs:**
   - Backend: Terminal output
   - Frontend: Browser DevTools Console
   - Network: Browser DevTools Network tab

2. **Review Documentation:**
   - `MIGRATION_GUIDE.md` - OpenAI Agents SDK integration
   - `README.md` - Project overview
   - Backend API docs: http://localhost:8001/docs

3. **Test Components Independently:**
   - Backend: `python test_agent.py`
   - Frontend: Check individual pages
   - Database: Test with SQL client

---

**Last Updated:** 2026-02-09
**Backend Port:** 8001
**Frontend Port:** 3000
**Status:** ✅ Ready to Run
