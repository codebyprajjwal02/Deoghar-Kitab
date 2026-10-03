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
    // Everyone is a seller now, no approval checks needed
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

// Distance calculator helper (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Nearby Books Search with Geolocation sorting
const getNearbyBooks = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      query,
      shopType,
      sortBy = 'distance',
      category,
      condition
    } = req.query;

    const filter = { status: 'available' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (condition && condition !== 'all') {
      filter.condition = condition;
    }
    if (shopType && shopType !== 'all') {
      filter.shopType = shopType;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ];
    }

    const books = await Book.find(filter).populate('seller', 'name email');

    // Log query in demand analytics SearchLog
    if (query) {
      const SearchLog = require('../models/SearchLog');
      const log = new SearchLog({
        query: query.trim(),
        location: 'Deoghar',
        category: category || 'general',
        isAvailable: books.length > 0,
        user: req.user ? req.user._id : null
      });
      await log.save().catch(err => console.error('Error logging search:', err));
    }

    // Map and assign distances
    let results = books.map(book => {
      const bookObj = book.toObject();
      if (latitude && longitude && book.latitude && book.longitude) {
        bookObj.distance = getDistance(
          Number(latitude),
          Number(longitude),
          book.latitude,
          book.longitude
        );
      } else {
        bookObj.distance = 0;
      }
      return bookObj;
    });

    // Sorting options
    if (sortBy === 'distance' && latitude && longitude) {
      results.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'availability') {
      results.sort((a, b) => b.stock - a.stock);
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Bulk Inventory Upload
const bulkUploadBooks = async (req, res) => {
  try {
    const { books } = req.body;
    const sellerId = req.user._id;
    const sellerName = req.user.name;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: 'Books array is required' });
    }

    const savedBooks = [];
    for (const b of books) {
      const newBook = new Book({
        title: b.title,
        author: b.author,
        description: b.description || 'No description provided.',
        price: b.price,
        category: b.category || 'Reference',
        condition: b.condition || 'Good',
        images: b.images || [],
        seller: sellerId,
        sellerName: sellerName,
        stock: b.stock || 1,
        barcode: b.barcode || '',
        latitude: b.latitude || 24.4822,
        longitude: b.longitude || 86.7003,
        locationName: b.locationName || 'Deoghar College Road',
        shopType: b.shopType || 'student',
        contactInfo: b.contactInfo || { email: req.user.email }
      });
      const saved = await newBook.save();
      savedBooks.push(saved);
    }

    res.status(201).json({ message: 'Bulk upload completed successfully', books: savedBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get book details by Barcode
const getBookByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const book = await Book.findOne({ barcode });
    if (!book) {
      return res.status(404).json({ message: 'Book with this barcode not found' });
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
  updateBookStatus,
  getNearbyBooks,
  bulkUploadBooks,
  getBookByBarcode
};