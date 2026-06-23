require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const app = express();
const pool = require('./config/database');
const superAdminRoutes = require('./routes/superAdmin/login'); // Importing the super admin routes
const contactMessageRoutes = require('./routes/contactMessage/contactmessages');
const trackingStatusRoutes = require('./routes/tracking/trackingStatus');
const customerTrackingDetailsRoutes = require('./routes/customerTrackingDetails/customerTrackingDetails');
const trackingRoutes = require('./routes/tracking/tracking');

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Super Admin Routes
app.use('/api/admin', superAdminRoutes);
app.use('/api', contactMessageRoutes);
app.use('/api', trackingRoutes);
app.use('/api', trackingStatusRoutes);
app.use('/api', customerTrackingDetailsRoutes);





    app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Root route (optional)
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

const PORT = 4501;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port 4501');
});
