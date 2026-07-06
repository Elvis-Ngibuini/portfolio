# 🚨 How to Access Your Admin Panel (CORS Fix)

## The Problem
You're getting CORS errors because you're opening the admin.html file directly instead of through the HTTP server.

## ❌ Wrong Way (Causes CORS Errors)
- Double-clicking `admin.html` in file explorer
- URL looks like: `file:///C:/Users/.../admin.html`
- Origin is `null` → CORS blocked

## ✅ Correct Way (No CORS Errors)
- Access through HTTP server
- URL should be: `http://localhost:8000/admin.html`
- Origin is `http://localhost:8000` → Works perfectly

## 🎯 Step-by-Step Solution

### Step 1: Make Sure Servers Are Running
```bash
# Option A: Use the batch file
start-dev.bat

# Option B: Manual start
# Terminal 1:
python -m http.server 8000

# Terminal 2:
cd server
npm run dev
```

### Step 2: Access Admin Panel Correctly
Choose ONE of these methods:

#### Method 1: Direct URL
1. Open your browser
2. Type: `http://localhost:8000/admin.html`
3. Press Enter

#### Method 2: Portfolio Launcher
1. Go to: `http://localhost:8000/launch-portfolio.html`
2. Wait for green status indicators
3. Click "Admin Panel" button

#### Method 3: Portfolio Dashboard
1. Go to: `http://localhost:8000/portfolio-dashboard.html`
2. Click the Admin Panel card

## 🔧 Quick Links (Copy & Paste)

- **Admin Panel**: http://localhost:8000/admin.html
- **Portfolio Launcher**: http://localhost:8000/launch-portfolio.html
- **Portfolio Dashboard**: http://localhost:8000/portfolio-dashboard.html
- **Main Portfolio**: http://localhost:8000

## 🚀 Pro Tip
Bookmark these URLs in your browser for easy access!

## ❓ Still Having Issues?

1. **Check if servers are running**: Both should show green status in the launcher
2. **Clear browser cache**: Ctrl+F5 or Ctrl+Shift+R
3. **Try incognito mode**: To rule out browser extensions
4. **Check the URL**: Must start with `http://localhost:8000`

## 📞 Remember
- ✅ Always use `http://localhost:8000/...`
- ❌ Never open HTML files directly from file explorer
- 🚀 Use the launcher for easy access to all tools