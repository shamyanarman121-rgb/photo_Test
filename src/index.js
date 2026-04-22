const express = require('express');
const cors = require('cors');
const path = require('path');
const dataRoutes = require('./routes/dataRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
