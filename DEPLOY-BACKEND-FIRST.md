# 🔧 Deploy Backend First - Step by Step

Since you want the contact form working from day one, let's deploy the backend before the frontend.

---

## Why Deploy Backend First?

✅ Contact form will work immediately when frontend goes live
✅ Admin panel will be functional from the start
✅ No need to redeploy frontend later
✅ Professional setup from the beginning

---

## Step 1: Get Gmail App Password (5 minutes)

### Why?
Your contact form sends email notifications. Gmail requires an "App Password" for this.

### Instructions:

1. **Enable 2-Step Verification** (if not already enabled)
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification"
   - Click "Get Started" and follow the prompts
   - Use your phone for verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - You might need to sign in again
   - Select:
     - App: "Mail"
     - Device: "Other (Custom name)"
   - Type: "Portfolio Backend"
   - Click "Generate"

3. **Copy the Password**
   - You'll see a 16-character password like: `abcd efgh ijkl mnop`
   - Copy it (you can include or remove spaces, both work)
   - Save it somewhere safe - you'll need it in Step 3

### Troubleshooting:
- **Don't see "App passwords"?** → Enable 2-Step Verification first
- **Still not showing?** → Your account might use advanced protection. Try using a different Gmail account.

---

## Step 2: Sign Up for Render (2 minutes)

### Why Render?
- ✅ Free tier available (perfect for portfolios)
- ✅ Easy to use
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL certificates
- ✅ Good performance

### Instructions:

1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. If using GitHub, authorize Render to access your repositories
5. Verify your email if prompted

---

## Step 3: Deploy Backend to Render (15 minutes)

### Before You Start:
Make sure you have:
- ✅ Gmail App Password from Step 1
- ✅ Render account from Step 2
- ✅ Your code ready (it already is!)

### Instructions:

1. **Push Your Code to GitHub First**
   
   Open your terminal and run:
   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```
   
   Then create a GitHub repository:
   - Go to: https://github.com/new
   - Repository name: `portfolio`
   - Public repository
   - Don't initialize with README
   - Click "Create repository"
   
   Copy the commands GitHub shows and run them:
   ```bash
   git remote add origin https://github.com/EluisNgibuni/portfolio.git
   git push -u origin main
   ```

2. **Create Web Service on Render**
   
   - Go to Render dashboard: https://dashboard.render.com
   - Click "New +" button (top right)
   - Select "Web Service"

3. **Connect Your Repository**
   
   - Click "Connect account" if you haven't connected GitHub yet
   - Find and select your `portfolio` repository
   - Click "Connect"

4. **Configure the Service**
   
   Fill in these settings:
   
   ```
   Name: portfolio-api
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Environment Variables**
   
   Scroll down to "Environment Variables" section and click "Add Environment Variable"
   
   Add these one by one (click "Add Environment Variable" for each):
   
   ```
   Key: NODE_ENV
   Value: production
   
   Key: FRONTEND_URL
   Value: https://eluisngibuni.github.io
   
   Key: EMAIL_HOST
   Value: smtp.gmail.com
   
   Key: EMAIL_PORT
   Value: 587
   
   Key: EMAIL_USER
   Value: elvisngibuini@gmail.com
   
   Key: EMAIL_PASS
   Value: [paste your 16-character password from Step 1]
   
   Key: EMAIL_FROM
   Value: elvisngibuini@gmail.com
   
   Key: EMAIL_TO
   Value: elvisngibuini@gmail.com
   
   Key: ADMIN_API_KEY
   Value: lyVRAsues3sICGgJjXDfcYy5dnRFq5eJ9o34i6yL/fQ=
   
   Key: JWT_SECRET
   Value: portfolio_jwt_secret_2026_eluis_secure_key_production
   ```

6. **Create Web Service**
   
   - Double-check all environment variables are correct
   - Click "Create Web Service" button at the bottom
   - Wait for deployment (5-10 minutes)

7. **Monitor Deployment**
   
   You'll see logs scrolling. Look for:
   - ✅ "Build successful"
   - ✅ "Deploy successful"
   - ✅ "Your service is live 🎉"
   - ✅ "Server running on port 10000" (or similar)

8. **Copy Your Backend URL**
   
   - At the top of the page, you'll see your service URL
   - Format: `https://portfolio-api-xxxx.onrender.com`
   - Copy this URL - you'll need it in Step 4
   - Save it somewhere safe!

### Troubleshooting:

**Build Failed?**
- Check the logs for specific errors
- Verify `server/package.json` exists in your repository
- Make sure all environment variables are set

**Deploy Failed?**
- Check if all environment variables are correct
- Verify EMAIL_PASS has no extra spaces
- Check logs for specific error messages

**Service Won't Start?**
- Verify PORT is not hardcoded in server.js (should use process.env.PORT)
- Check if all dependencies are in package.json

---

## Step 4: Update Frontend with Backend URL (5 minutes)

Now that your backend is live, let's connect your frontend to it.

### Instructions:

1. **Update admin.html**
   
   Open `admin.html` in your code editor
   
   Find line 630 (search for `const API_BASE`):
   ```javascript
   const API_BASE = 'http://localhost:3000/api';
   ```
   
   Replace with your Render URL from Step 3:
   ```javascript
   const API_BASE = 'https://portfolio-api-xxxx.onrender.com/api';
   ```
   
   Save the file.

2. **Update js/api.js**
   
   Open `js/api.js` in your code editor
   
   Find line 4 (search for `const API_BASE_URL`):
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```
   
   Replace with your Render URL from Step 3:
   ```javascript
   const API_BASE_URL = 'https://portfolio-api-xxxx.onrender.com/api';
   ```
   
   Save the file.

3. **Commit the Changes**
   
   ```bash
   git add admin.html js/api.js
   git commit -m "Connect frontend to production backend"
   git push origin main
   ```

---

## Step 5: Test Backend (5 minutes)

Before deploying the frontend, let's make sure the backend works!

### Test 1: Health Check

Open your browser and visit:
```
https://your-backend-url.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Portfolio API is running"
}
```

### Test 2: Test Contact Form Locally

1. Open `index.html` in your browser (locally)
2. Scroll to the contact form
3. Fill it out with test data
4. Submit
5. Check your email (elvisngibuini@gmail.com)

**Expected Result:**
- ✅ Success message appears
- ✅ Email received within 1-2 minutes

### Test 3: Test Admin Panel Locally

1. Open `admin.html` in your browser (locally)
2. You should see the admin dashboard
3. Your test contact should appear in the list

**Expected Result:**
- ✅ Admin panel loads
- ✅ Contact submission visible
- ✅ Can view details
- ✅ Can update status

### Troubleshooting:

**Health check fails (404 or timeout)?**
- Wait 30 seconds (free tier may be sleeping)
- Check if service is running in Render dashboard
- Verify URL is correct

**Contact form shows error?**
- Open browser console (F12) and check for errors
- Verify backend URL is correct in `js/api.js`
- Check CORS errors (backend should allow your domain)

**Admin panel shows "Authentication failed"?**
- Verify API key in `admin.html` matches backend
- Check browser console for 401 errors

**Email not received?**
- Check spam folder
- Verify EMAIL_PASS is correct in Render
- Check Render logs for email errors

---

## Step 6: Deploy Frontend (10 minutes)

Now that the backend is working, let's deploy the frontend!

### Instructions:

1. **Enable GitHub Pages**
   
   - Go to: https://github.com/EluisNgibuni/portfolio/settings/pages
   - Under "Source", select:
     - Branch: `main`
     - Folder: `/ (root)`
   - Click "Save"
   - Wait 2-3 minutes

2. **Get Your Live URL**
   
   GitHub will show:
   ```
   Your site is published at https://eluisngibuni.github.io/portfolio
   ```

3. **Test Everything Live**
   
   Visit: https://eluisngibuni.github.io/portfolio
   
   Test:
   - ✅ Portfolio loads correctly
   - ✅ All images display
   - ✅ Navigation works
   - ✅ Contact form works
   - ✅ Email received
   
   Visit: https://eluisngibuni.github.io/portfolio/admin.html
   
   Test:
   - ✅ Admin panel loads
   - ✅ Can see contacts
   - ✅ Can update status
   - ✅ Can add notes

---

## 🎉 Congratulations!

Your portfolio is now fully deployed with a working backend!

### What You Have:
- ✅ Professional portfolio website
- ✅ Working contact form with email notifications
- ✅ Admin panel to manage contacts
- ✅ Secure API with authentication
- ✅ Mobile responsive design
- ✅ Production-ready setup

### Your URLs:
- **Portfolio**: https://eluisngibuni.github.io/portfolio
- **Admin Panel**: https://eluisngibuni.github.io/portfolio/admin.html
- **Backend API**: https://your-backend-url.onrender.com

---

## Important Notes

### Backend Free Tier Limitations:
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes ~30 seconds
- ⚠️ 750 hours/month free (enough for most portfolios)

**Solution**: Upgrade to paid plan ($7/month) for always-on service, or accept the 30-second delay on first contact.

### Keeping Backend Awake (Optional):
You can use a service like UptimeRobot to ping your backend every 14 minutes:
1. Sign up at: https://uptimerobot.com
2. Add monitor for: https://your-backend-url.onrender.com/api/health
3. Check interval: 14 minutes

---

## Next Steps

### 1. Submit to Google Search Console (5 minutes)
- Go to: https://search.google.com/search-console
- Add property: https://eluisngibuni.github.io/portfolio
- Submit sitemap: https://eluisngibuni.github.io/portfolio/sitemap.xml

### 2. Share Your Portfolio
- ✅ Add to LinkedIn profile
- ✅ Add to resume
- ✅ Share on Twitter/X
- ✅ Add to email signature

### 3. Monitor Your Backend
- Check Render dashboard regularly
- Review contact submissions in admin panel
- Respond to inquiries promptly

---

## Maintenance

### Updating Content:
```bash
# Make your changes
git add .
git commit -m "Update portfolio content"
git push origin main
# Changes live in 2-3 minutes
```

### Checking Logs:
- Go to Render dashboard
- Click on your service
- Click "Logs" tab
- View real-time logs

### Updating Environment Variables:
- Go to Render dashboard
- Click on your service
- Click "Environment" tab
- Update variables
- Service will automatically restart

---

## Support

If you encounter issues:
1. Check the troubleshooting sections above
2. Review Render logs for errors
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are correct

---

**Created**: February 18, 2026
**Status**: Ready to Deploy Backend First
**Estimated Time**: 40-50 minutes total
