FROM nginx:alpine

# Install certbot for Let's Encrypt
RUN apk add --no-cache certbot openssl

COPY nginx-entrypoint.sh /docker-entrypoint.d/10-certbot.sh
RUN chmod +x /docker-entrypoint.d/10-certbot.sh

# Default certificate locations
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]