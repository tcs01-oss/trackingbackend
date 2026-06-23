const pool = require('../../config/database');

// Add a new status update
async function addStatusUpdate(req, res) {
  try {
    const { tracking_record_id, location, estimated_date, estimated_time, status } = req.body;

    if (!tracking_record_id || !status) {
      return res.status(400).json({ error: 'Tracking Record ID and Status are required' });
    }

    // Verify the tracking record exists
    const [exists] = await pool.query('SELECT id, tracking_id FROM tracking_ids WHERE id = ?', [tracking_record_id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }
    
    const tracking_id_string = exists[0].tracking_id;

    const [result] = await pool.query(
      'INSERT INTO tracking_updates (tracking_record_id, tracking_id, location, estimated_date, estimated_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [tracking_record_id, tracking_id_string, location, estimated_date, estimated_time, status]
    );

    res.status(201).json({
      message: 'Status updated successfully',
      data: {
        id: result.insertId,
        tracking_record_id,
        tracking_id: tracking_id_string,
        location,
        estimated_date,
        estimated_time,
        status,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error adding status update:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get status history for a tracking ID
async function getStatusHistory(req, res) {
  try {
    const { tracking_id } = req.params; // Expecting the string tracking_id (e.g., EMAIL12345ABCDE)

    const [rows] = await pool.query(
      `SELECT * FROM tracking_updates 
       WHERE tracking_id = ? 
       ORDER BY created_at DESC`,
      [tracking_id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching status history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Update an existing status entry
async function updateStatusUpdate(req, res) {
  try {
    const { id } = req.params;
    const { location, estimated_date, estimated_time, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Status Update ID is required' });
    }

    const [result] = await pool.query(
      'UPDATE tracking_updates SET location = ?, estimated_date = ?, estimated_time = ?, status = ? WHERE id = ?',
      [location, estimated_date, estimated_time, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Status update entry not found' });
    }

    res.status(200).json({ message: 'Status entry updated successfully' });
  } catch (error) {
    console.error('Error updating status entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  addStatusUpdate,
  getStatusHistory,
  updateStatusUpdate
};
