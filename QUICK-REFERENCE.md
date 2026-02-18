# 🚀 Portfolio Management - Quick Reference

## 🎯 Essential URLs (Bookmark These!)

### Main Access Points
- **Start Page**: http://localhost:8000/START-HERE.html
- **Portfolio Launcher**: http://localhost:8000/launch-portfolio.html
- **Live Portfolio**: http://localhost:8000
- **Resume**: http://localhost:8000/resume.html

### Management Tools
- **Dashboard**: http://localhost:8000/portfolio-dashboard.html
- **Admin Panel**: http://localhost:8000/admin.html
- **Content Manager**: http://localhost:8000/portfolio-manager.html
- **Content Generator**: http://localhost:8000/portfolio-generator.html
- **Image Optimizer**: http://localhost:8000/image-optimizer.html

## ⚡ Quick Commands

### Start Servers
```bash
# Automatic (Recommended)
start-dev.bat

# Manual - Terminal 1
python -m http.server 8000

# Manual - Terminal 2
cd server
npm run dev
```

### Stop Servers
```bash
# Press Ctrl+C in each terminal window
```

## 🎨 Common Updates

### Change Profile Image
1. Add image to `images/` folder
2. Open `index.html`
3. Find: `<img src="images/eluis.jpg"`
4. Replace: `eluis.jpg` with your filename
5. Save and refresh

### Add New Project
1. Go to: http://localhost:8000/portfolio-generator.html
2. Fill in project details
3. Click "Generate Project HTML"
4. Copy generated code
5. Paste into `index.html` projects section
6. Save and test

### Update Contact Info
1. Open `index.html`
2. Find contact section
3. Update email, phone, social links
4. Save and refresh

### Add Work Experience
1. Use Content Generator
2. Fill in job details
3. Generate HTML
4. Add to experience section
5. Save and test

## 🖼️ Image Guidelines

### Profile Photo
- Size: 400x400px
- Format: JPG or WebP
- Quality: 80-90%
- Max size: 100KB

### Project Screenshots
- Size: 800x600px
- Format: JPG or WebP
- Quality: 75-85%
- Max size: 200KB

### Certificates
- Size: 600x400px
- Format: JPG
- Quality: 85-95%
- Max size: 150KB

## ⚠️ Avoiding CORS Errors

### ✅ Correct Access
- http://localhost:8000/admin.html
- http://localhost:8000/portfolio-dashboard.html
- Always use HTTP server URLs

### ❌ Wrong Access
- Opening admin.html directly from file explorer
- Using file:/// URLs
- Double-clicking HTML files

### Why?
Opening files directly causes CORS errors that prevent the admin panel from connecting to the backend API.

## 🔧 Troubleshooting

### Servers Won't Start
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID [process_id] /F
```

### CORS Errors
1. Access via http://localhost:8000
2. Check both servers are running
3. Clear browser cache (Ctrl+F5)
4. Try incognito mode

### Images Not Loading
1. Check file paths (case-sensitive)
2. Verify images are in `images/` folder
3. Optimize large images
4. Check image format (jpg, png, webp)

### Contact Form Not Working
1. Ensure backend server is running
2. Check `server/.env` configuration
3. Verify email credentials
4. Check browser console for errors

## 📁 File Locations

### Content Files
- Main page: `index.html`
- Resume: `resume.html`
- Styles: `css/styles.css`
- Scripts: `js/script.js`

### Images
- Profile: `images/eluis.jpg`
- Projects: `images/*.png`
- Certificates: `images/*.png`

### Backend
- Server: `server/server.js`
- Config: `server/.env`
- Storage: `server/storage/contacts.json`

### Documentation
- Update guide: `PORTFOLIO-UPDATE-GUIDE.md`
- Deployment: `DEPLOYMENT-GUIDE.md`
- Admin access: `HOW-TO-ACCESS-ADMIN.md`

## 🚀 Deployment Checklist

- [ ] Test all functionality locally
- [ ] Optimize all images
- [ ] Update meta tags and descriptions
- [ ] Test on mobile devices
- [ ] Check all links work
- [ ] Test contact form
- [ ] Backup current version
- [ ] Deploy to hosting platform
- [ ] Test live version
- [ ] Update DNS if using custom domain

## 📞 Quick Help

### Need to...
- **Update content?** → Use Content Manager or Generator
- **Manage contacts?** → Use Admin Panel
- **Optimize images?** → Use Image Optimizer
- **Deploy portfolio?** → Read Deployment Guide
- **Fix CORS errors?** → Access via http://localhost:8000

### Documentation
- Portfolio updates: `PORTFOLIO-UPDATE-GUIDE.md`
- Deployment steps: `DEPLOYMENT-GUIDE.md`
- Admin access: `HOW-TO-ACCESS-ADMIN.md`
- Full README: `README.md`

## 🎉 Remember

1. **Always start servers first** using `start-dev.bat`
2. **Access via HTTP server** (http://localhost:8000)
3. **Never open HTML files directly** from file explorer
4. **Use the tools provided** for easy updates
5. **Backup before major changes**
6. **Test locally before deploying**

---

**Quick Start**: Run `start-dev.bat` → Open http://localhost:8000/START-HERE.html → Choose your tool!