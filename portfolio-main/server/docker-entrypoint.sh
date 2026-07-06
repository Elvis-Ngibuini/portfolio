#!/bin/sh
set -e

echo "🚀 Starting portfolio backend..."

# Ensure storage directory exists
mkdir -p /app/storage /app/uploads

# Wait for any dependent services (if needed)
# This can be extended for database readiness

exec npm start