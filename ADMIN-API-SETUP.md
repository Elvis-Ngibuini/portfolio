# Admin API Key Setup Guide

## Overview
Your admin endpoints are now protected with API key authentication. This prevents unauthorized access to contact submissions and admin features.

---

## Quick Setup

### 1. Your Current API Key
Located in `server/.env`:
```
ADMIN_API_KEY=portfolio_admin_key_2026_secure_eluis
```

⚠️ **IMPORTANT**: Change this to a secure random key before deploying to production!

### 2. Generate a Secure API Key (Production)
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://www.uuidgenerator.net/api/guid
```

### 3. Update Your .env File
```env
ADMIN_API_KEY=your-new-secure-key-here
```

---

## Using the API Key

### In Admin Panel (admin.html)

You need to update `admin.html` to include the API key in all requests. Here's how:

#### Option 1: Store in localStorage (Recommended for Development)
```javascript
// Add this at the top of admin.html script section
const ADMIN_API_KEY = 'portfolio_admin_key_2026_secure_eluis';

// Update all fetch requests to include the header
async function loadContacts() {
    const response = await fetch('http://localhost:3000/api/contact', {
        headers: {
            'X-API-Key': ADMIN_API_KEY
        }
    });
    // ... rest of code
}
```

#### Option 2: Prompt for API Key (Recommended for Production)
```javascript
// Add this at the top of admin.html
let ADMIN_API_KEY = localStorage.getItem('admin_api_key');

if (!ADMIN_API_KEY) {
    ADMIN_API_KEY = prompt('Enter Admin API Key:');
    if (ADMIN_API_KEY) {
        localStorage.setItem('admin_api_key', ADMIN_API_KEY);
    }
}

// Use in all requests
async function loadContacts() {
    const response = await fetch('http://localhost:3000/api/contact', {
        headers: {
            'X-API-Key': ADMIN_API_KEY
        }
    });
    // ... rest of code
}
```

---

## Testing the API Key

### Test Without API Key (Should Fail)
```bash
curl http://localhost:3000/api/contact
# Expected: 401 Unauthorized
```

### Test With Wrong API Key (Should Fail)
```bash
curl -H "X-API-Key: wrong-key" http://localhost:3000/api/contact
# Expected: 401 Unauthorized
```

### Test With Correct API Key (Should Work)
```bash
curl -H "X-API-Key: portfolio_admin_key_2026_secure_eluis" http://localhost:3000/api/contact
# Expected: 200 OK with contact data
```

---

## Protected Endpoints

All these endpoints now require the `X-API-Key` header:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contact` | List all contacts |
| GET | `/api/contact/:id` | Get single contact |
| GET | `/api/contact/stats/dashboard` | Get statistics |
| PUT | `/api/contact/:id/status` | Update status |
| PUT | `/api/contact/:id/notes` | Update notes |
| PUT | `/api/contact/:id/priority` | Update priority |
| DELETE | `/api/contact/:id` | Delete contact |

**Note**: `POST /api/contact` (form submission) does NOT require API key - it's public.

---

## Security Best Practices

### ✅ DO
- Use a strong, random API key (32+ characters)
- Store API key in environment variables
- Use HTTPS in production
- Rotate API keys periodically (every 3-6 months)
- Keep API keys out of version control
- Use different keys for development and production

### ❌ DON'T
- Hardcode API keys in frontend code
- Share API keys publicly
- Use simple/guessable keys
- Commit API keys to Git
- Use the same key across multiple projects
- Store API keys in plain text files

---

## Troubleshooting

### Error: "Unauthorized - Invalid API key"
**Cause**: API key is missing or incorrect
**Solution**: 
1. Check that `X-API-Key` header is included
2. Verify the key matches the one in `server/.env`
3. Restart the server after changing .env

### Error: "Admin API key not configured"
**Cause**: `ADMIN_API_KEY` not set in .env or set to default value
**Solution**: 
1. Open `server/.env`
2. Set `ADMIN_API_KEY=your-secure-key`
3. Restart the server

### Admin panel not loading data
**Cause**: API key not included in requests
**Solution**: 
1. Update admin.html to include API key header
2. Check browser console for errors
3. Verify server is running

---

## Development vs Production

### Development Mode
- API key warnings shown in console
- If no API key set, access is allowed (with warning)
- Easier for local testing

### Production Mode
- API key is REQUIRED
- No access without valid key
- Set `NODE_ENV=production` in .env

---

## Quick Fix for Admin Panel

If you want to quickly update your admin panel to work with the new API key:

1. Open `admin.html`
2. Find the `loadContacts()` function (around line 640)
3. Add this at the very top of the `<script>` section:

```javascript
// Admin API Configuration
const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    apiKey: 'portfolio_admin_key_2026_secure_eluis' // Change this!
};

// Helper function to make authenticated requests
async function authenticatedFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'X-API-Key': API_CONFIG.apiKey,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
}
```

4. Replace all `fetch()` calls with `authenticatedFetch()`

---

## Example: Complete Admin Request

```javascript
// Load contacts with authentication
async function loadContacts(page = 1, limit = 10) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/contact?page=${page}&limit=${limit}`,
            {
                headers: {
                    'X-API-Key': 'portfolio_admin_key_2026_secure_eluis'
                }
            }
        );
        
        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid API key. Please check your configuration.');
                return;
            }
            throw new Error('Failed to load contacts');
        }
        
        const data = await response.json();
        displayContacts(data.data.contacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
        showError('Failed to load contacts');
    }
}
```

---

## Need Help?

If you encounter issues:
1. Check server logs for error messages
2. Verify .env file is properly configured
3. Ensure server is restarted after .env changes
4. Test API key with curl commands above
5. Check browser console for frontend errors

---

**Last Updated**: February 18, 2026
**Status**: ✅ Implemented and Ready to Use
