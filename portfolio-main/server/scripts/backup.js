const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STORAGE_DIR = path.join(__dirname, 'storage');
const BACKUP_DIR = path.join(__dirname, 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const backupFile = (filename) => {
    const src = path.join(STORAGE_DIR, filename);
    if (fs.existsSync(src)) {
        const dest = path.join(BACKUP_DIR, `${filename}.${TIMESTAMP}`);
        fs.copyFileSync(src, dest);
        console.log(`✓ Backed up ${filename}`);
        return true;
    }
    return false;
};

try {
    console.log('🔄 Starting backup...');
    const files = fs.readdirSync(STORAGE_DIR).filter(f => f.endsWith('.json'));
    let count = 0;
    files.forEach(file => { if (backupFile(file)) count++; });
    console.log(`✅ Backup complete: ${count} files backed up to ${BACKUP_DIR}`);
} catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
}