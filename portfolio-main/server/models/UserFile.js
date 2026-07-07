const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeUsers(users) {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function findUser(filter) {
    const users = readUsers();
    return users.find(u => {
        for (const key in filter) {
            if (u[key] !== filter[key]) return false;
        }
        return true;
    });
}

async function findOneAndUpdate(filter, update) {
    const users = readUsers();
    const index = users.findIndex(u => {
        for (const key in filter) {
            if (u[key] !== filter[key]) return false;
        }
        return true;
    });
    
    if (index >= 0) {
        users[index] = { ...users[index], ...update, updatedAt: new Date().toISOString() };
        writeUsers(users);
        return users[index];
    }
    return null;
}

async function findByIdAndUpdate(id, update) {
    const users = readUsers();
    const index = users.findIndex(u => u._id === id);
    
    if (index >= 0) {
        users[index] = { ...users[index], ...update, updatedAt: new Date().toISOString() };
        writeUsers(users);
        return users[index];
    }
    return null;
}

module.exports = {
    findUser,
    findOneAndUpdate,
    findByIdAndUpdate,
    readUsers,
    writeUsers
};