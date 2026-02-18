const fs = require('fs').promises;
const path = require('path');

class ContactFile {
    constructor() {
        this.filePath = path.join(__dirname, '../storage/contacts.json');
        this.ensureFileExists();
    }

    async ensureFileExists() {
        try {
            await fs.access(this.filePath);
        } catch (error) {
            // File doesn't exist, create it
            await fs.writeFile(this.filePath, '[]', 'utf8');
        }
    }

    async readContacts() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading contacts file:', error);
            return [];
        }
    }

    async writeContacts(contacts) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(contacts, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error writing contacts file:', error);
            return false;
        }
    }

    async addContact(contactData) {
        const contacts = await this.readContacts();
        const newContact = {
            _id: this.generateId(),
            ...contactData,
            status: 'new',
            priority: 'medium',
            email_sent: false,
            auto_reply_sent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        contacts.push(newContact);
        await this.writeContacts(contacts);
        return newContact;
    }

    async getContacts(filters = {}) {
        let contacts = await this.readContacts();

        // Apply filters
        if (filters.status) {
            contacts = contacts.filter(c => c.status === filters.status);
        }

        if (filters.priority) {
            contacts = contacts.filter(c => c.priority === filters.priority);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            contacts = contacts.filter(c =>
                c.name.toLowerCase().includes(searchLower) ||
                c.email.toLowerCase().includes(searchLower) ||
                c.subject.toLowerCase().includes(searchLower) ||
                c.message.toLowerCase().includes(searchLower)
            );
        }

        // Sort by date (newest first)
        contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return {
            contacts: contacts.slice(startIndex, endIndex),
            total: contacts.length,
            page,
            limit,
            totalPages: Math.ceil(contacts.length / limit)
        };
    }

    async getContactById(id) {
        const contacts = await this.readContacts();
        return contacts.find(c => c._id === id);
    }

    async updateContact(id, updates) {
        const contacts = await this.readContacts();
        const index = contacts.findIndex(c => c._id === id);

        if (index === -1) {
            return null;
        }

        contacts[index] = {
            ...contacts[index],
            ...updates,
            updated_at: new Date().toISOString()
        };

        await this.writeContacts(contacts);
        return contacts[index];
    }

    async deleteContact(id) {
        const contacts = await this.readContacts();
        const filteredContacts = contacts.filter(c => c._id !== id);

        if (filteredContacts.length === contacts.length) {
            return false; // Contact not found
        }

        await this.writeContacts(filteredContacts);
        return true;
    }

    async getStats() {
        const contacts = await this.readContacts();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            total_submissions: contacts.length,
            unread_count: contacts.filter(c => c.status === 'new').length,
            today_count: contacts.filter(c => new Date(c.created_at) >= today).length,
            this_week: contacts.filter(c => new Date(c.created_at) >= weekAgo).length,
            this_month: contacts.filter(c => new Date(c.created_at) >= monthStart).length,
            by_status: this.groupBy(contacts, 'status'),
            by_priority: this.groupBy(contacts, 'priority'),
            recent_submissions: contacts
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
                .map(c => ({
                    _id: c._id,
                    name: c.name,
                    email: c.email,
                    subject: c.subject,
                    status: c.status,
                    created_at: c.created_at,
                    priority: c.priority
                }))
        };
    }

    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            const existing = result.find(r => r._id === group);
            if (existing) {
                existing.count++;
            } else {
                result.push({ _id: group, count: 1 });
            }
            return result;
        }, []);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

module.exports = new ContactFile();