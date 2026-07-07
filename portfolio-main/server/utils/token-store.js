const Redis = require('ioredis');

let redis = null;
let fallbackStore = new Map();

// Initialize Redis connection
function initRedis() {
    if (process.env.REDIS_URL) {
        try {
            redis = new Redis(process.env.REDIS_URL);
            redis.on('error', (err) => {
                console.warn('Redis connection error, using in-memory store:', err.message);
                redis = null;
            });
            return true;
        } catch (e) {
            console.warn('Redis unavailable, using in-memory store');
            redis = null;
        }
    }
    return false;
}

// Store refresh token
async function storeRefreshToken(token, userId, expiresIn = 7 * 24 * 60 * 60) {
    const key = `refresh:${userId}:${token}`;
    const value = userId;
    
    if (redis) {
        await redis.set(key, value, 'EX', expiresIn);
    } else {
        fallbackStore.set(key, { userId, expires: Date.now() + expiresIn * 1000 });
    }
}

// Get refresh token
async function getRefreshToken(token, userId) {
    const key = `refresh:${userId}:${token}`;
    
    if (redis) {
        const result = await redis.get(key);
        return result ? { userId } : null;
    } else {
        const stored = fallbackStore.get(key);
        if (stored && stored.expires > Date.now()) {
            return stored;
        }
        fallbackStore.delete(key);
        return null;
    }
}

// Delete refresh token
async function deleteRefreshToken(token, userId) {
    const key = `refresh:${userId}:${token}`;
    
    if (redis) {
        await redis.del(key);
    } else {
        fallbackStore.delete(key);
    }
}

// Delete all user tokens (for logout all)
async function deleteAllUserTokens(userId) {
    if (redis) {
        const keys = await redis.keys(`refresh:${userId}:*`);
        if (keys.length) {
            await redis.del(...keys);
        }
    } else {
        for (const [key] of fallbackStore) {
            if (key.startsWith(`refresh:${userId}:`)) {
                fallbackStore.delete(key);
            }
        }
    }
}

module.exports = {
    initRedis,
    storeRefreshToken,
    getRefreshToken,
    deleteRefreshToken,
    deleteAllUserTokens
};