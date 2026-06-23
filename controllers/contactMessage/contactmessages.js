const pool = require('../../config/database');

// Create a new contact message
exports.createContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required fields' });
        }

        const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [name, email, message]);

        res.status(201).json({
            message: 'Contact message sent successfully',
            data: {
                id: result.insertId,
                name,
                email,
                message
            }
        });
    } catch (error) {
        console.error('Error creating contact message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a contact message
exports.deleteContactMessage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Message ID is required' });
        }

        const query = 'DELETE FROM contact_messages WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact message not found' });
        }

        res.status(200).json({ message: 'Contact message deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all contact messages
exports.getContactMessages = async (req, res) => {
    try {
        const query = 'SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC';
        const [rows] = await pool.query(query);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
