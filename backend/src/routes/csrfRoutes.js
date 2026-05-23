const express = require('express');
const router = express.Router();
const { generarCSRFToken } = require('../controllers/csrfController');

// Endpoint público para obtener token CSRF
router.get('/csrf-token', generarCSRFToken);

module.exports = router;
