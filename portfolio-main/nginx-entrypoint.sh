#!/bin/sh
set -e

echo "🔐 Setting up SSL certificates..."

# Create SSL directory
mkdir -p /etc/nginx/ssl /var/www/certbot

# Check if certificates exist, if not generate self-signed
if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
    if [ "$STAGING" = "true" ]; then
        echo "⚠️ Using Let's Encrypt staging environment"
        CERTBOT_FLAGS="--staging"
    else
        CERTBOT_FLAGS="--force-renewal"
    fi
    
    # Try Let's Encrypt, fall back to self-signed
    if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
        echo "🔒 Requesting Let's Encrypt certificate for $DOMAIN"
        certbot certonly \
            --webroot -w /var/www/certbot \
            --email "$EMAIL" \
            --agree-tos \
            --no-eff-email \
            -d "$DOMAIN" \
            $CERTBOT_FLAGS || echo "Certbot failed, using self-signed fallback"
        
        if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
            ln -sf /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/cert.pem
            ln -sf /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/key.pem
        fi
    fi
    
    # Self-signed fallback if no certs
    if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
        echo "⚠️ Generating self-signed certificate"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/nginx/ssl/key.pem \
            -out /etc/nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null
    fi
fi

echo "✅ SSL setup complete"
exec nginx -g 'daemon off;'