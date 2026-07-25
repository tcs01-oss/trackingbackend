const { db } = require('../../config/database');

exports.getTrackingDetails = async (req, res) => {
  try {
    const { tracking_id } = req.params;

    if (!tracking_id) {
      return res.status(400).json({ error: 'Tracking ID is required' });
    }

    // 1. Query the 'tracking_ids' collection for the matching tracking_id
    const trackingRef = db.collection('tracking_ids');
    const trackingSnapshot = await trackingRef.where('tracking_id', '==', tracking_id).limit(1).get();

    if (trackingSnapshot.empty) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    const trackingDoc = trackingSnapshot.docs[0];
    const trackingData = trackingDoc.data();

    // 2. Query the latest entry from 'tracking_updates' matching this record ID
    const updatesRef = db.collection('tracking_updates');
    const updatesSnapshot = await updatesRef
      .where('tracking_record_id', '==', trackingDoc.id)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    let latestUpdate = {};
    if (!updatesSnapshot.empty) {
      latestUpdate = updatesSnapshot.docs[0].data();
    }

    // 3. Construct and return the payload matching your original SQL response
    return res.status(200).json({
      name: trackingData.name,
      email: trackingData.email,
      location: latestUpdate.location || null,
      estimated_date: latestUpdate.estimated_date || null,
      estimated_time: latestUpdate.estimated_time || null,
      current_status: latestUpdate.status || null
    });

  } catch (error) {
    console.error('Error fetching customer tracking details:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
