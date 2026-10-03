const { BookRequest, User, Notification } = require('../models');

// Create a new out-of-stock book request
const createBookRequest = async (req, res) => {
  try {
    const { bookTitle, author, category, location } = req.body;
    const studentId = req.user._id;
    const studentName = req.user.name;

    if (!bookTitle) {
      return res.status(400).json({ message: 'Book title is required' });
    }

    const newRequest = new BookRequest({
      bookTitle,
      author: author || '',
      category: category || '',
      student: studentId,
      studentName,
      location: location || 'Deoghar',
      status: 'pending'
    });

    const savedRequest = await newRequest.save();

    // Find all sellers/merchants in Deoghar (except the requesting student)
    const sellers = await User.find({
      userType: 'seller',
      _id: { $ne: studentId }
    });

    // Notify all sellers about the new student request
    for (const seller of sellers) {
      await Notification.create({
        user: seller._id,
        type: 'request_received',
        payload: {
          message: `A student requested "${bookTitle}". Open requests to respond.`,
          requestId: savedRequest._id
        }
      });
    }

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all requests (public or filtered by student)
const getBookRequests = async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = studentId ? { student: studentId } : {};

    const requests = await BookRequest.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Shopkeeper responds to a request
const replyToBookRequest = async (req, res) => {
  try {
    const { requestId, reply, price } = req.body;
    const shopId = req.user._id;
    const shopName = req.user.name;

    const bookReq = await BookRequest.findById(requestId);
    if (!bookReq) {
      return res.status(404).json({ message: 'Book request not found' });
    }

    // Add response
    bookReq.responses.push({
      shop: shopId,
      shopName,
      reply,
      price: price || 0,
      repliedAt: new Date()
    });

    bookReq.status = 'replied';
    await bookReq.save();

    // Notify Student
    await Notification.create({
      user: bookReq.student,
      type: 'request_replied',
      payload: {
        message: `Shopkeeper "${shopName}" responded to your request for "${bookReq.bookTitle}": ${reply}.`,
        requestId: bookReq._id,
        reply,
        price
      }
    });

    res.json({ message: 'Reply sent successfully', request: bookReq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createBookRequest,
  getBookRequests,
  replyToBookRequest
};
