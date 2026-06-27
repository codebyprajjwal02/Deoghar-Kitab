const { Book, User } = require('../models');

// Get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: 'available' }).populate('seller', 'name email');
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get books by seller
const getBooksBySeller = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.params.sellerId });
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('seller', 'name email');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new book
const createBook = async (req, res) => {
  try {
    const { title, author, description, price, category, condition, images, sellerName, contactInfo } = req.body;
    // Use authenticated user as seller (route protected by requireApprovedSeller)
    const sellerId = req.user && req.user._id ? req.user._id : req.body.seller;
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    if (seller.userType !== 'seller' || !seller.isSellerApproved) {
      return res.status(403).json({ message: 'Seller not approved to list books' });
    }
    const book = new Book({
      title,
      author,
      description,
      price,
      category,
      condition,
      images: images || [],
      seller: sellerId,
      sellerName,
      contactInfo
    });

    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a book
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update book status (for admin or seller)
const updateBookStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'sold', 'pending'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllBooks,
  getBooksBySeller,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateBookStatus
};