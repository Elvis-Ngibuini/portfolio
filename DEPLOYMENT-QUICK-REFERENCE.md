# 🚀 Deployment Quick Reference

## Pre-Deployment Checklist

Run this command to test everything:
```bash
test-deployment.bat
```

## Frontend Deployment (GitHub Pages)

### One-Command Deployment:
```bash
deploy.bat
```

### Manual Steps:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

Then enable GitHub Pages:
1. Go to: https://github.com/EluisNgibuni/portfolio/settings/pages
2. Source: Deploy from branch
3. Branch: main / root
4. Save

**Your site will be live at:** https://eluisngibuni.github.io/portfolio

---

## Backend Deployment

### Recommended: Render.com (Free)

1. Sign up at [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Settings:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
4. Add environment variables (see below)
5. Deploy

### Environment Variables for Backend:
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
JWT_SECRET=your-super-secret-jwt-key
```

---

## After Backend Deployment

Update these 2 files with your backend URL:

### 1. admin.html (line 630)
```javascript
const API_BASE = 'https://your-backend-url.com/api';
```

### 2. js/api.js (line 4)
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

Then redeploy frontend:
```bash
deploy.bat
```

---

## Gmail App Password Setup

1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification first
3. Create app password for "Mail"
4. Copy 16-character password
5. Use in `EMAIL_PASS` environment variable

---

## Testing After Deployment

### Test Frontend:
- Visit: https://eluisngibuni.github.io/portfolio
- Check all links work
- Test mobile responsiveness
- Verify images load

### Test Contact Form:
1. Fill out contact form
2. Submit
3. Check email received

### Test Admin Panel:
1. Visit: https://eluisngibuni.github.io/portfolio/admin.html
2. Should see contact submissions
3. Try updating status

---

## Troubleshooting

### Contact form not working
- Check browser console for errors
- Verify backend URL in `js/api.js`
- Check CORS settings in backend

### Admin panel shows "Authentication failed"
- Verify API key matches in `admin.html` and backend
- Check backend is running

### Emails not sending
- Verify Gmail App Password is correct
- Check backend logs
- Ensure 2-Step Verification enabled

---

## Important URLs

- **Frontend**: https://eluisngibuni.github.io/portfolio
- **Admin Panel**: https://eluisngibuni.github.io/portfolio/admin.html
- **Backend**: (Update after deployment)
- **GitHub Repo**: https://github.com/EluisNgibuni/portfolio

---

## Security Notes

✅ Production API key configured
✅ .gitignore protects sensitive files
✅ Environment variables not in code
✅ CORS configured for your domain only

---

## Need More Help?

- Full guide: `DEPLOYMENT-CHECKLIST.md`
- Backend guide: `BACKEND-DEPLOYMENT.md`
- Security info: `SECURITY-IMPROVEMENTS.md`

---

**Last Updated**: February 18, 2026
