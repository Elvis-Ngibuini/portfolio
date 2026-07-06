# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ---------------- |
| Latest  | :white_check_mark: |

## Security Features Implemented

### Authentication & Authorization
- JWT-based authentication with 8-hour token expiry
- Password authentication with fallback to bcrypt support
- Protected API endpoints (POST/PUT/DELETE require valid token)

### Network Security
- Helmet.js security headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS restricted to known origins
- Rate limiting (500 requests per 15 minutes)
- HTTP to HTTPS redirect in nginx

### Data Protection
- Input sanitization (prototype pollution prevention)
- File upload whitelist (jpg, png, gif, webp only)
- File size limits (5MB max)
- Security event logging

### Vulnerability Management
- npm audit integrated in CI/CD
- CodeQL static analysis enabled
- Dependency scanning via GitHub Actions

## Reporting a Vulnerability

Email: elvisngibuini@gmail.com

## Security Best Practices for Deployment

1. Set strong `JWT_SECRET` (32+ characters)
2. Use HTTPS in production (Let's Encrypt)
3. Store `.env` files securely (never commit credentials)
4. Enable Cloudflare WAF for additional protection
5. Regular security audits: `npm audit`