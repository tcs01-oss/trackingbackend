const { db, admin } = require('../../config/database');

// Add a new status update
async function addStatusUpdate(req, res) {
  try {
    const { tracking_record_id, location, estimated_date, estimated_time, status } = req.body;

    if (!tracking_record_id || !status) {
      return res.status(400).json({ error: 'Tracking Record ID and Status are required' });
    }

    // Verify the tracking record exists in the tracking_ids collection
    const trackingRef = db.collection('tracking_ids').doc(tracking_record_id);
    const trackingDoc = await trackingRef.get();

    if (!trackingDoc.exists) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }
    
    // Extract the human-readable tracking_id string
    const trackingData = trackingDoc.data();
    const tracking_id_string = trackingData.tracking_id;

    // Build the new update document
    const newUpdate = {
      tracking_record_id,
      tracking_id: tracking_id_string,
      location: location || '',
      estimated_date: estimated_date || '',
      estimated_time: estimated_time || '',
      status,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Insert into tracking_updates collection
    const result = await db.collection('tracking_updates').add(newUpdate);

    res.status(201).json({
      message: 'Status updated successfully',
      data: {
        id: result.id,
        tracking_record_id,
        tracking_id: tracking_id_string,
        location,
        estimated_date,
        estimated_time,
        status,
        created_at: new Date() // Sending current time back for the frontend payload
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
    const { tracking_id } = req.params; 

    // Query Firestore for all updates matching the string ID
    const snapshot = await db.collection('tracking_updates')
      .where('tracking_id', '==', tracking_id)
      .orderBy('timestamp', 'desc')
      .get();

    const rows = [];
    snapshot.forEach(doc => {
      rows.push({ id: doc.id, ...doc.data() });
    });

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

    const updateRef = db.collection('tracking_updates').doc(id);
    const docSnap = await updateRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Status update entry not found' });
    }

    // Update the specific document fields
    await updateRef.update({
      location: location !== undefined ? location : '',
      estimated_date: estimated_date !== undefined ? estimated_date : '',
      estimated_time: estimated_time !== undefined ? estimated_time : '',
      status: status !== undefined ? status : ''
    });

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
