const { Chat, User, Book, Notification } = require('../models');

// List the current user's chats (GET /chats)
const getUserChats = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email userType')
      .populate('book', 'title author price images seller sellerName')
      .sort({ lastUpdated: -1 })
      .lean();

    // Map through chats to add a dynamic unreadCount field
    const chatsWithUnread = chats.map(chat => {
      const unreadCount = chat.messages.filter(msg => 
        String(msg.sender) !== String(userId) && !msg.read
      ).length;
      return {
        ...chat,
        unreadCount
      };
    });

    res.json(chatsWithUnread);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create or get a chat between participants (optionally tied to a book) - Legacy Support
const getOrCreateChat = async (req, res) => {
  try {
    const { participantIds, bookId } = req.body; // participantIds: [userId1, userId2]

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return res.status(400).json({ message: 'participantIds array of at least two user IDs required' });
    }

    // Try to find an existing chat with the same participants and book
    let chat = await Chat.findOne({
      participants: { $all: participantIds, $size: participantIds.length },
      book: bookId || null
    }).populate('participants', 'name email');

    if (!chat) {
      chat = new Chat({ participants: participantIds, book: bookId || null });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Start or retrieve a private chat (POST /chats/start)
const startChat = async (req, res) => {
  try {
    let { bookId, sellerId, sellerEmail } = req.body;
    const buyerId = req.user && req.user._id;

    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' });
    }

    // Resolve sellerId if not provided but sellerEmail is provided (highly helpful for mock books)
    if (!sellerId && sellerEmail) {
      let sellerUser = await User.findOne({ email: sellerEmail.toLowerCase().trim() });
      if (!sellerUser) {
        // If testing with a mock book and the seller doesn't exist, create a dummy seller!
        sellerUser = new User({
          name: sellerEmail.split('@')[0],
          email: sellerEmail.toLowerCase().trim(),
          password: 'password123',
          userType: 'seller',
          isSellerApproved: true,
          sellerRequestStatus: 'approved'
        });
        await sellerUser.save();
      }
      sellerId = sellerUser._id;
    }

    if (!sellerId) {
      return res.status(400).json({ message: 'sellerId or sellerEmail is required' });
    }

    if (String(buyerId) === String(sellerId)) {
      return res.status(400).json({ message: 'You cannot start a chat with yourself' });
    }

    // Find or create chat room between buyer and seller for this book
    let chat = await Chat.findOne({
      participants: { $all: [buyerId, sellerId], $size: 2 },
      book: bookId
    });

    if (!chat) {
      chat = new Chat({
        participants: [buyerId, sellerId],
        book: bookId,
        messages: []
      });
      await chat.save();
    }

    chat = await Chat.findById(chat._id)
      .populate('participants', 'name email userType')
      .populate('book', 'title author price images seller sellerName');

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Send a message in a chat - Legacy Support (POST /api/chat/:id/message)
const sendMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const { text } = req.body;
    const senderId = req.user && req.user._id;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Message text required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Ensure sender is participant
    if (!chat.participants.map(String).includes(String(senderId))) {
      return res.status(403).json({ message: 'Not a participant of this chat' });
    }

    const message = { sender: senderId, text, read: false, createdAt: new Date() };
    chat.messages.push(message);
    chat.lastUpdated = new Date();
    await chat.save();

    // Create notification for other participant(s)
    const otherParticipants = chat.participants.filter(p => String(p) !== String(senderId));
    for (const uid of otherParticipants) {
      const notif = new Notification({
        user: uid,
        type: 'message',
        payload: { chatId: chat._id, text, from: senderId }
      });
      await notif.save();
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Send a message in a chat (POST /chats/:chatId/messages)
const postMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const senderId = req.user && req.user._id;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure sender is participant
    if (!chat.participants.map(String).includes(String(senderId))) {
      return res.status(403).json({ message: 'Access denied: You are not a participant of this chat' });
    }

    const message = {
      sender: senderId,
      text: text.trim(),
      read: false,
      createdAt: new Date()
    };

    chat.messages.push(message);
    chat.lastUpdated = new Date();
    await chat.save();

    // Create notification for other participant(s)
    const otherParticipants = chat.participants.filter(p => String(p) !== String(senderId));
    for (const uid of otherParticipants) {
      const notif = new Notification({
        user: uid,
        type: 'message',
        payload: { chatId: chat._id, text: message.text, from: senderId }
      });
      await notif.save();
    }

    const savedMessage = chat.messages[chat.messages.length - 1];
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get chat by id (with messages) - Legacy Support (GET /api/chat/:id)
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email userType')
      .populate('book', 'title author price images seller sellerName')
      .lean();
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Ensure requester is a participant
    const userId = req.user && req.user._id;
    if (!chat.participants.map(p => String(p._id)).includes(String(userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get chat messages (GET /chats/:chatId/messages)
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user && req.user._id;

    const chat = await Chat.findById(chatId).lean();
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure requester is a participant
    if (!chat.participants.map(String).includes(String(userId))) {
      return res.status(403).json({ message: 'Access denied: You are not a participant of this chat' });
    }

    res.json(chat.messages || []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mark a chat's messages as read (PATCH /chats/:chatId/read)
const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user && req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure user is participant
    if (!chat.participants.map(String).includes(String(userId))) {
      return res.status(403).json({ message: 'Access denied: You are not a participant of this chat' });
    }

    // Mark messages sent by others as read
    let updated = false;
    chat.messages.forEach(msg => {
      if (String(msg.sender) !== String(userId) && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    // Also mark related notifications as read
    await Notification.updateMany(
      { user: userId, type: 'message', 'payload.chatId': chatId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUserChats,
  getOrCreateChat,
  startChat,
  sendMessage,
  postMessage,
  getChatById,
  getMessages,
  markChatAsRead
};
