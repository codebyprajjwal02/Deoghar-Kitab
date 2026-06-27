const express = require('express');
const router = express.Router();
const { chatController } = require('../controllers');
const { protect } = require('../middleware');

// --- NEW REQUIRED APIS ---

// POST /chats/start (or /chat/start)
router.post('/start', protect, chatController.startChat);

// GET /chats (or /chat)
router.get('/', protect, chatController.getUserChats);

// GET /chats/:chatId/messages (or /chat/:chatId/messages)
router.get('/:chatId/messages', protect, chatController.getMessages);

// POST /chats/:chatId/messages (or /chat/:chatId/messages)
router.post('/:chatId/messages', protect, chatController.postMessage);

// PATCH /chats/:chatId/read (or /chat/:chatId/read)
router.patch('/:chatId/read', protect, chatController.markChatAsRead);

// --- LEGACY SKELETON APIS (Keep for backwards compatibility) ---

// POST /api/chat/create
router.post('/create', protect, chatController.getOrCreateChat);

// GET /api/chat/:id
router.get('/:id', protect, chatController.getChatById);

// POST /api/chat/:id/message
router.post('/:id/message', protect, chatController.sendMessage);

module.exports = router;
