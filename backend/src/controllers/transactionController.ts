// src/controllers/transactionController.ts

import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

// POST /transactions [cite: 49]
export const createTransaction = async (req: Request, res: Response) => {
  const { items } = req.body; // Expect: { items: [{ bookId: "uuid", quantity: 2 }, ...] }
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Items array is required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0; // Total Kuantitas 
      let totalPrice = 0; // Total Harga 
      const transactionItemsData = [];

      // 1. Validasi semua item dan kalkulasi total
      for (const item of items) {
        const { bookId, quantity } = item;

        if (!bookId || !quantity || quantity <= 0 || !Number.isInteger(quantity)) {
          throw { status: 400, message: 'Invalid bookId or quantity' };
        }

        const book = await tx.book.findUnique({
          where: { id: bookId },
        });

        if (!book) {
          throw { status: 404, message: `Book with id ${bookId} not found` };
        }

        if (book.stock < quantity) {
          throw {
            status: 400,
            message: `Insufficient stock for "${book.title}"`,
          };
        }

        // Update kalkulasi
        totalAmount += quantity;
        totalPrice += book.price * quantity;

        // Simpan data untuk createMany dan update stok
        transactionItemsData.push({
          bookId,
          quantity,
          price: book.price, // Simpan harga saat transaksi [cite: 12]
          bookStock: book.stock,
        });
      }

      // 2. Buat Transaction Master
      const createdTransaction = await tx.transaction.create({
        data: {
          userId,
          totalAmount,
          totalPrice,
        },
      });

      // 3. Buat TransactionItem (detail)
      await tx.transactionItem.createMany({
        data: transactionItemsData.map((item) => ({
          transactionId: createdTransaction.id,
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // 4. Update stok buku (setelah semua valid)
      for (const item of transactionItemsData) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: item.bookStock - item.quantity },
        });
      }

      return createdTransaction;
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: result,
    });
  } catch (error: any) {
    console.error(error);
    if (error.status) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /transactions [cite: 49]
export const getAllTransactions = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const {
    page = '1',
    limit = '10',
    search, // Search by ID [cite: 49]
    sortById, // Sort by ID [cite: 49]
    sortByAmount, // Sort by Amount [cite: 49]
    sortByPrice, // Sort by Price [cite: 49]
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  let where: any = {
    userId: userId, // Hanya tampilkan transaksi milik user ybs
  };

  // Fitur Search ID [cite: 49]
  if (search) {
    where.id = {
      contains: search as string,
      mode: 'insensitive',
    };
  }

  // Fitur Sort [cite: 49]
  let orderBy: any = {};
  if (sortById === 'asc' || sortById === 'desc') {
    orderBy.id = sortById;
  } else if (sortByAmount === 'asc' || sortByAmount === 'desc') {
    orderBy.totalAmount = sortByAmount;
  } else if (sortByPrice === 'asc' || sortByPrice === 'desc') {
    orderBy.totalPrice = sortByPrice;
  } else {
    orderBy.createdAt = 'desc'; // Default
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: where,
      skip: skip,
      take: limitNum,
      orderBy: orderBy,
      include: {
        // Include items 
        items: {
          include: {
            book: {
              select: { id: true, title: true, imageUrl: true },
            },
          },
        },
      },
    });

    const totalTransactions = await prisma.transaction.count({ where: where });
    const totalPages = Math.ceil(totalTransactions / limitNum);

    res.status(200).json({
      success: true,
      message: 'Get all user transactions successfully',
      data: transactions,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalItems: totalTransactions,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /transactions/:id [cite: 51]
export const getTransactionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: id, userId: userId }, // Pastikan user hanya bisa lihat transaksi dia
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: { // 
          include: {
            book: true, // Tampilkan detail buku lengkap
          },
        },
      },
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: 'Transaction not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Get transaction detail successfully',
      data: transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};