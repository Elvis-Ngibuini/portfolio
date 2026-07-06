# Backend Deployment Guide

Your portfolio backend needs to be deployed separately from the frontend (GitHub Pages). Here are the recommended options:

## Option 1: Render (Recommended - Free Tier)

### Steps:
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: portfolio-api
   - **Root Directory**: server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://eluisngibuni.github.io
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=elvisngibuini@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=elvisngibuini@gmail.com
   EMAIL_TO=elvisngibuini@gmail.com
   ADMIN_API_KEY=lyVRAsues3sICGgJjXDfcYy5dnRFq5eJ9o34i6yL/fQ=
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

6. Click "Create Web Service"

7. Once deployed, copy your service URL (e.g., `https://portfolio-api-xxxx.onrender.com`)

8. Update `admin.html` line 629:
   ```javascript
   const API_BASE = 'https://portfolio-api-xxxx.onrender.com/api';
   ```

9. Update `js/api.js` with the same URL

---

## Option 2: Railway (Alternative - Free Trial)

### Steps:
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your portfolio repository
4. Configure:
   - **Root Directory**: server
   - **Start Command**: `npm start`

5. Add Environment Variables (same as Render above)

6. Deploy and get your service URL

7. Update `admin.html` and `js/api.js` with the Railway URL

---

## Option 3: Vercel (Serverless)

### Steps:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create `vercel.json` in server folder:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

3. Deploy:
   ```bash
   cd server
   vercel --prod
   ```

4. Add environment variables in Vercel dashboard

5. Update `admin.html` and `js/api.js` with Vercel URL

---

## Gmail App Password Setup

To enable email notifications:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Other (Custom name)"
5. Enter "Portfolio Backend"
6. Click "Generate"
7. Copy the 16-character password
8. Use this password in `EMAIL_PASS` environment variable

---

## Update Frontend to Use Backend

After deploying backend, update these files:

### 1. admin.html (line 629)
```javascript
const API_BASE = 'https://your-backend-url.com/api';
```

### 2. js/api.js
Find and update the API_BASE constant:
```javascript
const API_BASE = 'https://your-backend-url.com/api';
```

### 3. Test the connection
- Visit your admin panel
- Try submitting a contact form
- Check if emails are received

---

## Security Checklist

- [ ] Environment variables are set (not hardcoded)
- [ ] ADMIN_API_KEY is secure and matches in both frontend and backend
- [ ] FRONTEND_URL is set to your GitHub Pages URL
- [ ] Gmail App Password is configured
- [ ] CORS is configured to only allow your domain
- [ ] Rate limiting is enabled

---

## Troubleshooting

### Contact form not working
- Check browser console for CORS errors
- Verify backend URL is correct in `js/api.js`
- Test backend directly: `curl https://your-backend-url.com/api/health`

### Admin panel authentication failed
- Verify ADMIN_API_KEY matches in `admin.html` and backend `.env`
- Check browser console for 401 errors

### Emails not sending
- Verify Gmail App Password is correct
- Check backend logs for email errors
- Ensure 2-Step Verification is enabled on Gmail

---

## Cost Estimate

- **Render Free Tier**: $0/month (sleeps after 15 min inactivity)
- **Railway Free Trial**: $5 credit (then ~$5-10/month)
- **Vercel Free Tier**: $0/month (generous limits)

**Recommendation**: Start with Render's free tier. It's perfect for portfolios with moderate traffic.

---

## Next Steps

1. Choose a backend hosting platform
2. Deploy backend following steps above
3. Get Gmail App Password
4. Update frontend with backend URL
5. Test contact form and admin panel
6. Monitor for any errors

---

**Need Help?** Check the main DEPLOYMENT-CHECKLIST.md for more details.
