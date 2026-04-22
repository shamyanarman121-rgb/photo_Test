const express = require('express');
const { processData } = require('../controllers/dataController');

const router = express.Router();

router.post('/data', processData);

module.exports = router;
