const express = require('express');
const router = express.Router();
const { aiChat } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/chat', protect, aiChat);

module.exports = router;