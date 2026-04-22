const express = require('express');
const cors = require('cors');
const path = require('path');
const dataRoutes = require('./routes/dataRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Increase payload limit to handle base64 encoded images
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files (like CSS if you had any)
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api', dataRoutes);

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
