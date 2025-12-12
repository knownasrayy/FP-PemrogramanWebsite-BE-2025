// src/router/bookRouter.ts

import { Router } from 'express';
import {
  createBook,
  getAllBooks,
  getBookById,
  // getBooksByGenre, // Ini nggak ada di soal, bisa di-keep atau di-remove
  updateBook,
  deleteBook,
} from '../controllers/bookController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Semua route di-protect 
router.post('/', protect, createBook);
router.get('/', protect, getAllBooks);
router.get('/:id', protect, getBookById);
router.put('/:id', protect, updateBook);
router.patch('/:id', protect, updateBook);  // Support both PUT and PATCH
router.delete('/:id', protect, deleteBook);
// router.get('/genre/:id', protect, getBooksByGenre); // Kalo masih mau pake

export default router;