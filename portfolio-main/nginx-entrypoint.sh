#!/bin/sh
set -e

echo "🔐 Setting up SSL certificates..."

# Create SSL directory
mkdir -p /etc/nginx/ssl

# Check if certificates exist, if not generate self-signed
if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
    echo "⚠️ Generating self-signed certificate (use Let's Encrypt in production)"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || true
fi

echo "✅ SSL setup complete"
exec docker-entrypoint.sh nginx -g 'daemon off;'