const express = require('express');
const { processData } = require('../controllers/dataController');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.post('/data', processData);

// Optional: Route to retrieve uploaded images
router.get('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../../uploads', filename);
    
    // Security: Prevent directory traversal attacks
    if (!filepath.startsWith(path.join(__dirname, '../../uploads'))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving image', message: error.message });
  }
});

module.exports = router;
