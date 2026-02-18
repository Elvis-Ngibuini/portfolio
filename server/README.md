# Portfolio Backend API

A Node.js/Express backend API for the Eluis Ngibuini portfolio website, providing contact form functionality, project management, and analytics tracking.

## Features

- 📧 **Contact Form API** - Handle contact form submissions with email notifications
- 📊 **Projects API** - Manage and serve project data
- 📈 **Analytics Tracking** - Track page views, user interactions, and statistics
- 🔒 **Security** - Rate limiting, input validation, and security headers
- 📱 **CORS Support** - Cross-origin resource sharing for frontend integration

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=eluisngibuinithamaini@gmail.com
```

### 3. Gmail Setup (for contact form)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Contact Form
- `POST /api/contact` - Submit contact form
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "Hello, I'd like to discuss a project..."
  }
  ```

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `GET /api/projects/stats/overview` - Get project statistics

### Analytics
- `POST /api/analytics/track` - Track page view/interaction
- `POST /api/analytics/contact` - Track contact form submission
- `GET /api/analytics/dashboard` - Get analytics dashboard data

### Health Check
- `GET /health` - Server health status

## Frontend Integration

Add the API script to your HTML:

```html
<script src="js/api.js"></script>
<script src="js/script.js"></script>
```

Update your contact form:

```html
<form id="contact-form" onsubmit="handleContactFormSubmission(event)">
  <!-- form fields -->
</form>
```

## Development

### Project Structure

```
server/
├── routes/
│   ├── contact.js      # Contact form handling
│   ├── projects.js     # Project data API
│   └── analytics.js    # Analytics tracking
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md          # This file
```

### Adding New Features

1. **New Route**: Create a new file in `routes/` directory
2. **Add to Server**: Import and use in `server.js`
3. **Update Frontend**: Add corresponding API calls in `js/api.js`

### Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Using Joi schema validation
- **CORS Protection**: Configured for your frontend domain
- **Security Headers**: Using Helmet.js
- **Error Handling**: Comprehensive error responses

## Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

1. **Environment Variables**: Set production values in `.env`
2. **Process Manager**: Use PM2 for production
   ```bash
   npm install -g pm2
   pm2 start server.js --name "portfolio-api"
   ```

3. **Reverse Proxy**: Configure Nginx/Apache to proxy to Node.js
4. **SSL Certificate**: Use Let's Encrypt for HTTPS

### Hosting Options

- **VPS**: DigitalOcean, Linode, AWS EC2
- **Platform**: Heroku, Railway, Render
- **Serverless**: Vercel, Netlify Functions

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Analytics Dashboard
Access analytics at `GET /api/analytics/dashboard` (consider adding authentication for production)

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check Gmail app password
   - Verify SMTP settings
   - Check firewall/network restrictions

2. **CORS errors**
   - Verify `FRONTEND_URL` in `.env`
   - Check browser console for specific errors

3. **Rate limiting**
   - Adjust limits in `server.js`
   - Clear rate limit cache (restart server)

### Logs

Check console output for detailed error messages and request logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.