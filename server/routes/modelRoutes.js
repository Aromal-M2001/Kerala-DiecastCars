const express = require('express');
const { getModels } = require('../controllers/modelController');

const router = express.Router();
router.get('/', getModels);

module.exports = router;