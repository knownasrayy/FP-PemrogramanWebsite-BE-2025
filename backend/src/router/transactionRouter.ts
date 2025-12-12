// src/router/transactionRouter.ts

import { Router } from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  // getTransactionStatistics, // opsional
} from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Semua route di-protect 
router.post('/', protect, createTransaction); 
router.get('/', protect, getAllTransactions); 
router.get('/:id', protect, getTransactionById); 
// router.get('/statistics', protect, getTransactionStatistics); // Kalo masih mau pake

export default router;