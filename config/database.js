require('dotenv').config();
const admin = require('firebase-admin');

// 1. Build the credentials object from Render environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The replace() function ensures Render parses the private key line breaks correctly
  privateKey: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined
};

// 2. Initialize the Firebase Admin App
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

// 3. Export the Firestore database instance
const db = admin.firestore();

module.exports = { admin, db };
