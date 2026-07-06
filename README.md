# Portfolio - Eluis Ngibuini

A modern portfolio website with admin dashboard and RESTful API backend.

## 🚀 Quick Start

### Frontend
Open `portfolio-main/index.html` in a browser or serve via static server.

### Backend
```bash
cd portfolio-main/server
npm install
npm start
```

Server runs on `http://localhost:3001`

## 🔐 Admin Access

Login at `portfolio-main/admin.html`:
- Username: `portfolioadmin`
- Password: `Admin123`

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bulk` | No | Fetch all data (projects, skills, etc.) |
| GET | `/api/home` | No | Home page content |
| GET | `/api/projects` | No | All projects |
| GET | `/api/skills` | No | Technical skills |
| GET | `/api/graphic-design` | No | Design portfolio |
| GET | `/api/challenges` | No | Security challenges |
| GET | `/api/contributions` | No | Open source contributions |
| GET | `/api/experience` | No | Work experience |
| GET | `/api/contact-info` | No | Contact information |
| POST | `/api/auth/login` | No | Get JWT token |

## 🐳 Docker Deployment

```bash
# Generate strong secrets
node generate-secrets.js > .env

# For production with Let's Encrypt
echo "DOMAIN=yourdomain.com" >> .env
echo "EMAIL=you@yourdomain.com" >> .env
echo "STAGING=false" >> .env  # Remove for production

# Build and run
docker compose up -d
```

Access:
- Frontend: http://localhost (http) or https://localhost (with SSL)
- Backend API: http://localhost/api/
- Admin: http://localhost/admin

## 🔒 Security Features

- JWT authentication with 8-hour expiry (configurable)
- In-memory caching (5min TTL)
- Security headers (CSP, HSTS, XSS protection)
- Rate limiting (500 req/15min)
- Input sanitization
- File upload whitelist (jpg, png, gif, webp)
- Structured security logging
- Let's Encrypt SSL automation

## 🌐 GitHub

https://github.com/Elvis-Ngibuini/portfolio