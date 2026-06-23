const pool = require('../../config/database');

exports.getTrackingDetails = async (req, res) => {
    try {
        const { tracking_id } = req.params;

        if (!tracking_id) {
            return res.status(400).json({ error: 'Tracking ID is required' });
        }

        const query = `
            SELECT 
                t.name, 
                t.email, 
                u.location, 
                u.estimated_date, 
                u.estimated_time, 
                u.status as current_status
            FROM tracking_ids t
            LEFT JOIN tracking_updates u ON t.id = u.tracking_record_id 
            AND u.id = (
                SELECT MAX(id)
                FROM tracking_updates
                WHERE tracking_record_id = t.id
            )
            WHERE t.tracking_id = ?
        `;

        const [rows] = await pool.query(query, [tracking_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tracking ID not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching customer tracking details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
