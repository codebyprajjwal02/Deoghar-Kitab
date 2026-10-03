const express = require('express');
const router = express.Router();
const { bookController } = require('../controllers');
const { protect, requireAdmin, requireApprovedSeller } = require('../middleware');

// GET /api/books - Get all available books (PUBLIC)
router.get('/', bookController.getAllBooks);

// GET /api/books/nearby - Nearby book search with location detection (PUBLIC)
router.get('/nearby', bookController.getNearbyBooks);

// POST /api/books/bulk - Bulk upload books (PROTECTED + approved seller only)
router.post('/bulk', protect, requireApprovedSeller, bookController.bulkUploadBooks);

// GET /api/books/barcode/:barcode - Get book details by barcode (PUBLIC)
router.get('/barcode/:barcode', bookController.getBookByBarcode);

// GET /api/books/seller/:sellerId - Get books by seller (PUBLIC)
router.get('/seller/:sellerId', bookController.getBooksBySeller);

// GET /api/books/:id - Get book by ID (PUBLIC)
router.get('/:id', bookController.getBookById);

// POST /api/books - Create a new book (PROTECTED + approved seller only)
router.post('/', protect, requireApprovedSeller, bookController.createBook);

// PUT /api/books/:id - Update a book (PROTECTED)
router.put('/:id', protect, bookController.updateBook);

// PUT /api/books/:id/status - Update book status (PROTECTED + ADMIN only)
router.put('/:id/status', protect, requireAdmin, bookController.updateBookStatus);

// DELETE /api/books/:id - Delete a book (PROTECTED + ADMIN only)
router.delete('/:id', protect, requireAdmin, bookController.deleteBook);

module.exports = router;