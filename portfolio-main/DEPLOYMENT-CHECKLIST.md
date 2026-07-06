# Deployment Checklist - Portfolio Project

## Pre-Deployment Checklist

### ✅ Security Configuration

- [ ] **Update Admin API Key in admin.html**
  - Open `admin.html`
  - Find line: `const ADMIN_API_KEY = 'portfolio_admin_key_2026_secure_eluis';`
  - Replace with production key from `server/.env.production`
  - Or use the secure key: `lyVRAsues3sICGgJjXDfcYy5dnRFq5eJ9o34i6yL/fQ=`

- [ ] **Configure Production Environment**
  - Copy `server/.env.production` to `server/.env`
  - Update `FRONTEND_URL` with your actual domain
  - Set `NODE_ENV=production`
  - Configure Gmail App Password for EMAIL_PASS

- [ ] **Test API Authentication**
  ```bash
  # Should fail (401)
  curl http://localhost:3000/api/contact
  
  # Should work (200)
  curl -H "X-API-Key: your-api-key" http://localhost:3000/api/contact
  ```

- [ ] **Verify CORS Configuration**
  - Check `server/server.js` has correct production URL
  - Test from production domain only

### ✅ Content Updates

- [ ] **Domain URLs Updated**
  - ✅ `sitemap.xml` - Updated to eluisngibuni.github.io/portfolio
  - ✅ `robots.txt` - Updated to eluisngibuni.github.io/portfolio
  - ✅ `index.html` - Canonical URL and Schema.org updated

- [ ] **Profile Information**
  - ✅ Email: elvisngibuini@gmail.com
  - ✅ Phone: +254 757 953 492
  - Profile image: `images/eluis.jpg` (verify it exists)

### ✅ Testing

#### Security Tests
- [ ] Test contact form with HTML injection (should be sanitized)
- [ ] Test honeypot field (fill hidden "website" field - should fail)
- [ ] Test admin endpoints without API key (should return 401)
- [ ] Test admin endpoints with wrong API key (should return 401)
- [ ] Test admin endpoints with correct API key (should work)

#### Functionality Tests
- [ ] Submit contact form (should work without API key)
- [ ] Receive email notification
- [ ] View contact in admin panel
- [ ] Update contact status
- [ ] Add notes to contact
- [ ] Change priority
- [ ] Export contacts to CSV
- [ ] Test all navigation links
- [ ] Test dark/light mode toggle
- [ ] Test mobile responsive design

#### Performance Tests
- [ ] Run Lighthouse audit (target: 90+ score)
  ```bash
  # In Chrome DevTools > Lighthouse
  # Or use: npm install -g lighthouse
  lighthouse http://localhost:8000 --view
  ```
- [ ] Check page load speed (<3 seconds)
- [ ] Verify images are optimized
- [ ] Test on slow 3G connection

#### SEO Tests
- [ ] Validate sitemap.xml
  - Visit: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- [ ] Test robots.txt
  - Visit: http://localhost:8000/robots.txt
- [ ] Verify structured data
  - Visit: https://search.google.com/test/rich-results
  - Enter your URL
- [ ] Check meta tags
  - Open Graph tags present
  - Twitter card tags present
  - Description meta tag present

#### Accessibility Tests
- [ ] Test skip-to-content link (press Tab key)
- [ ] Navigate entire site with keyboard only
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify focus indicators are visible
- [ ] Check color contrast ratios
  - Visit: https://webaim.org/resources/contrastchecker/
- [ ] Test with browser zoom (200%, 400%)

### ✅ Documentation

- [ ] README.md is up to date
- [ ] SECURITY-IMPROVEMENTS.md reviewed
- [ ] ADMIN-API-SETUP.md reviewed
- [ ] All guides are accurate

---

## Deployment Steps

### Option 1: GitHub Pages (Current Setup)

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Production ready - security improvements"
   git push origin main
   ```

2. **Configure GitHub Pages**
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: main / root
   - Save

3. **Update Backend URL**
   - If using separate backend server, update API_BASE in:
     - `js/api.js`
     - `admin.html`

4. **Test Live Site**
   - Visit: https://eluisngibuni.github.io/portfolio
   - Test all functionality
   - Check browser console for errors

### Option 2: Custom Domain

1. **Configure DNS**
   - Add CNAME record pointing to: eluisngibuni.github.io
   - Or A records to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153

2. **Update GitHub Pages**
   - Settings > Pages > Custom domain
   - Enter your domain
   - Enable "Enforce HTTPS"

3. **Update All URLs**
   - `sitemap.xml`
   - `robots.txt`
   - `index.html` (canonical and schema)
   - `server/.env` (FRONTEND_URL)

### Option 3: VPS/Cloud Server

1. **Server Setup**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/EluisNgibuni/portfolio.git
   cd portfolio
   
   # Install dependencies
   cd server
   npm install
   
   # Configure environment
   cp .env.production .env
   nano .env  # Update with production values
   
   # Start backend
   pm2 start server.js --name portfolio-api
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Frontend
       location / {
           root /var/www/portfolio;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable HTTPS**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment

### Immediate Actions

- [ ] Test live site thoroughly
- [ ] Submit sitemap to Google Search Console
  - Visit: https://search.google.com/search-console
  - Add property
  - Submit sitemap URL
- [ ] Test contact form on live site
- [ ] Verify email notifications work
- [ ] Check admin panel access

### Monitoring Setup

- [ ] Set up uptime monitoring
  - UptimeRobot: https://uptimerobot.com
  - Pingdom: https://www.pingdom.com
  
- [ ] Configure error tracking
  - Sentry: https://sentry.io
  - LogRocket: https://logrocket.com

- [ ] Set up analytics
  - Google Analytics
  - Plausible Analytics (privacy-friendly)

### Security Hardening

- [ ] Enable HTTPS/SSL
- [ ] Configure security headers
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security audits (quarterly)

### Backup Strategy

- [ ] Database backups (if using MongoDB)
  ```bash
  # Daily backup cron job
  0 2 * * * mongodump --out /backups/$(date +\%Y\%m\%d)
  ```

- [ ] Contact submissions backup
  ```bash
  # Weekly backup of contacts.json
  0 0 * * 0 cp server/storage/contacts.json backups/contacts-$(date +\%Y\%m\%d).json
  ```

- [ ] Code repository backup
  - GitHub already provides this
  - Consider GitLab mirror for redundancy

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review contact submissions

### Weekly
- [ ] Review analytics
- [ ] Check for security updates
- [ ] Backup contact data

### Monthly
- [ ] Update dependencies
  ```bash
  cd server
  npm outdated
  npm update
  ```
- [ ] Review and rotate logs
- [ ] Performance audit
- [ ] SEO check

### Quarterly
- [ ] Security audit
- [ ] Rotate API keys
- [ ] Update content
- [ ] Review and update documentation

---

## Troubleshooting

### Contact Form Not Working
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check CORS configuration
4. Verify email configuration in .env
5. Check server logs: `pm2 logs portfolio-api`

### Admin Panel Not Loading
1. Verify API key is correct
2. Check browser console for 401 errors
3. Verify server is running
4. Check CORS allows admin domain
5. Test API with curl

### Email Not Sending
1. Verify Gmail App Password is correct
2. Check EMAIL_PASS in .env
3. Test SMTP connection
4. Check server logs for email errors
5. Verify Gmail account allows less secure apps

### Performance Issues
1. Run Lighthouse audit
2. Check image sizes
3. Enable caching
4. Minify CSS/JS
5. Use CDN for static assets

---

## Rollback Plan

If deployment fails:

1. **Revert Git Changes**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Previous .env**
   ```bash
   cp .env.backup .env
   pm2 restart portfolio-api
   ```

3. **Restore Database**
   ```bash
   mongorestore /backups/latest
   ```

---

## Success Criteria

Your deployment is successful when:

- ✅ Site loads in <3 seconds
- ✅ Lighthouse score >90
- ✅ Contact form works
- ✅ Email notifications received
- ✅ Admin panel accessible with API key
- ✅ All links work
- ✅ Mobile responsive
- ✅ HTTPS enabled
- ✅ No console errors
- ✅ SEO tags present
- ✅ Sitemap indexed by Google

---

## Support Resources

- **Documentation**: See all .md files in project root
- **Security Guide**: SECURITY-IMPROVEMENTS.md
- **Admin Setup**: ADMIN-API-SETUP.md
- **GitHub Issues**: https://github.com/EluisNgibuni/portfolio/issues

---

**Last Updated**: February 18, 2026
**Status**: ✅ Ready for Deployment
**Next Review**: March 18, 2026
