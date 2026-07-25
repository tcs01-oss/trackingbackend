const { db, admin } = require('../../config/database');

function generateTrackingId(name, email) {
  const base = (email || name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (base.slice(0, 5) || '').padEnd(5, 'X');
  const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
  const letters = Array.from({ length: 5 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return `${prefix}${numbers}${letters}`;
}

async function createTracking(req, res) {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check if email already exists
    if (email) {
      const existing = await db.collection('tracking_ids').where('email', '==', email).limit(1).get();
      if (!existing.empty) {
        return res.status(400).json({ error: 'This email is already registered with a tracking ID.' });
      }
    }

    let trackingId;
    let attempts = 0;
    let isUnique = false;

    // Generate and verify a unique Tracking ID
    while (attempts < 3 && !isUnique) {
      trackingId = generateTrackingId(name, email);
      const checkId = await db.collection('tracking_ids').where('tracking_id', '==', trackingId).limit(1).get();
      if (checkId.empty) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Could not generate unique tracking ID' });
    }

    // Insert into Firestore
    const newRecord = {
      name,
      phone,
      email: email || null,
      tracking_id: trackingId,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const result = await db.collection('tracking_ids').add(newRecord);

    return res.status(201).json({
      message: 'Tracking ID created successfully',
      tracking_id: trackingId,
      data: {
        id: result.id,
        name,
        phone,
        email: email || null,
        tracking_id: trackingId
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
}

async function getTrackings(req, res) {
  try {
    // 1. Fetch all tracking IDs, ordered by creation date
    const trackingSnapshot = await db.collection('tracking_ids').orderBy('created_at', 'desc').get();
    const results = [];

    // 2. Map over each document to fetch its corresponding latest update
    await Promise.all(trackingSnapshot.docs.map(async (doc) => {
      const tData = doc.data();
      const tId = doc.id;

      const updatesSnapshot = await db.collection('tracking_updates')
        .where('tracking_record_id', '==', tId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      let latestUpdate = {};
      if (!updatesSnapshot.empty) {
        latestUpdate = updatesSnapshot.docs[0].data();
      }

      results.push({
        id: tId,
        name: tData.name,
        phone: tData.phone,
        email: tData.email,
        tracking_id: tData.tracking_id,
        created_at: tData.created_at ? tData.created_at.toDate() : null, 
        location: latestUpdate.location || null,
        estimated_date: latestUpdate.estimated_date || null,
        estimated_time: latestUpdate.estimated_time || null,
        status: latestUpdate.status || null
      });
    }));

    // Re-sort results in memory just in case parallel fetching caused slight misordering
    results.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
}

async function deleteTracking(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    // Initialize a Firestore Batch (NoSQL equivalent of a Transaction)
    const batch = db.batch();

    // 1. Queue deletion of the parent tracking document
    const trackingRef = db.collection('tracking_ids').doc(id);
    const trackingDoc = await trackingRef.get();
    
    if (!trackingDoc.exists) {
      return res.status(404).json({ error: 'Tracking record not found' });
    }
    batch.delete(trackingRef);

    // 2. Find and queue deletion of all child updates
    const updatesSnapshot = await db.collection('tracking_updates').where('tracking_record_id', '==', id).get();
    updatesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Commit the batch
    await batch.commit();

    res.status(200).json({ message: 'Tracking record and related updates deleted successfully' });
  } catch (e) {
    console.error('Error deleting tracking:', e);
    res.status(500).json({ error: 'Internal Server Error', details: e.message });
  } 
}

module.exports = { createTracking, getTrackings, deleteTracking };
