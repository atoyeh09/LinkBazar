const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  createConversation,
  getMessages,
  markAsRead
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// All chat routes are protected
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.post('/conversations', createConversation);

// Message routes
router.get('/conversations/:id/messages', getMessages);
router.put('/conversations/:id/read', markAsRead);

module.exports = router;
