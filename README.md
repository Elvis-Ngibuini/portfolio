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

## 🛠️ Features

- **JWT Authentication** - Secure admin login with 8-hour token expiry
- **In-memory Caching** - 5-minute TTL for API responses
- **Bulk Endpoint** - Single request for all portfolio data
- **Project Filtering** - Frontend filtering by category/featured
- **Image Upload** - Multer-based file uploads

## 🌐 GitHub

https://github.com/Elvis-Ngibuini/portfolio