require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
// Route Imports
const authRoutes = require('./Routes/ClientAuthRoutes');
const freelancerAuthRoutes = require('./Routes/FreelancerAuthRoutes');
const freelancerRoutes = require('./Routes/freelancerRoutes');
const uploadRoutes = require('./Routes/uploadRoutes');
const authMiddleware = require('./Middleware/ClientAuthMiddleware');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/freelancePlatform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Static Files
app.use('/uploads', express.static(uploadDir));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/freelancer', freelancerAuthRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/upload', uploadRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Freelance Platform Backend is Running');
});

// Protected Route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: req.user 
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});