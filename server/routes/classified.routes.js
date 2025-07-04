const express = require('express');
const router = express.Router();
const { 
  createClassified, 
  getClassifieds, 
  getClassified, 
  updateClassified, 
  deleteClassified 
} = require('../controllers/classified.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getClassifieds);
router.get('/:id', getClassified);

// Protected routes
router.post('/', protect, createClassified);
router.put('/:id', protect, updateClassified);
router.delete('/:id', protect, deleteClassified);

module.exports = router;
