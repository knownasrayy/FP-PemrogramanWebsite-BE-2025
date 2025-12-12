// src/controllers/bookController.ts

import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// POST /books [cite: 44]
export const createBook = async (req: Request, res: Response) => {
  // Sesuaikan field-names dengan schema.prisma (camelCase) [cite: 3]
  const {
    title,
    writer,
    publisher,
    price,
    stock,
    genreId,
    // Field opsional [cite: 5, 6, 7, 8]
    isbn,
    description,
    publicationYear,
    condition,
    imageUrl,
  } = req.body;

  // Validasi field required
  if (
    !title ||
    !writer ||
    !publisher ||
    price === undefined ||
    stock === undefined ||
    !genreId
  ) {
    return res.status(400).json({
      success: false,
      message:
        'Title, writer, publisher, price, stock, and genreId are required',
    });
  }

  // Validasi tipe data
  const priceNum = parseFloat(price as any);
  const stockNum = Number(stock); // Fix: Changed from stock_key to stock
  const pubYearNum = publicationYear
    ? parseInt(publicationYear as any, 10)
    : null;

  // --- Error Checking Sesuai Permintaan ---
  if (isNaN(priceNum) || isNaN(stockNum)) {
    return res
      .status(400)
      .json({ success: false, message: 'Price and stock must be numeric' });
  }
  if (priceNum < 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Price cannot be negative' });
  }
  if (!Number.isInteger(stockNum)) {
    return res
      .status(400)
      .json({ success: false, message: 'Stock must be an integer (no float)' });
  }
  if (stockNum < 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Stock cannot be negative' });
  }
  if (pubYearNum && (isNaN(pubYearNum) || pubYearNum > 2025)) {
    return res.status(400).json({
      success: false,
      message:
        'Publication year must be a valid number and cannot be greater than 2025',
    });
  }
  // --- End Error Checking ---

  try {
    // Cek apakah genre exists
    const genre = await prisma.genre.findUnique({
      where: { id: genreId },
    });

    if (!genre) {
      return res.status(400).json({
        success: false,
        message: 'Genre not found',
      });
    }

    const book = await prisma.book.create({
      data: {
        title,
        writer,
        publisher,
        price: priceNum,
        stock: stockNum, // Disesuaikan
        genreId: genreId, // Disesuaikan
        // Opsional
        isbn,
        description,
        publicationYear: pubYearNum,
        condition,
        imageUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return res
        .status(400)
        .json({ success: false, message: 'Book title already exists' });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// GET /books 
export const getAllBooks = async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '10',
    search,
    filterCondition, // Requirement soal 
    orderByTitle, // Requirement soal 
    orderByPublishDate, // Requirement soal 
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  let where: any = {};

  // Fitur Search 
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { writer: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Fitur Filter by condition 
  if (filterCondition) {
    where.condition = filterCondition as string;
  }

  // Fitur Sort 
  let orderBy: any = {};
  if (orderByTitle === 'asc' || orderByTitle === 'desc') {
    orderBy.title = orderByTitle;
  } else if (orderByPublishDate === 'asc' || orderByPublishDate === 'desc') {
    orderBy.publicationYear = orderByPublishDate;
  } else {
    orderBy.createdAt = 'desc'; // Default sort
  }

  try {
    const books = await prisma.book.findMany({
      skip: skip,
      take: limitNum,
      where: where,
      orderBy: orderBy,
      include: {
        genre: true, // Include genre info
      },
    });

    const totalBooks = await prisma.book.count({ where: where });
    const totalPages = Math.ceil(totalBooks / limitNum);

    res.status(200).json({
      success: true,
      message: 'Get all book successfully',
      data: books,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalItems: totalBooks,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// GET /books/:id [cite: 43]
export const getBookById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({
      where: { id: id },
      include: {
        genre: true,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Get book detail successfully',
      data: book,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// PATCH /books/:id
export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  console.log('=== UPDATE BOOK REQUEST ===');
  console.log('Book ID:', id);
  console.log('Request method:', req.method);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('===========================');
  
  // Ambil semua field yang mungkin di-update
  const {
    title,
    writer,
    publisher,
    price,
    stock,
    genreId,
    isbn,
    description,
    publicationYear,
    condition,
    imageUrl,
  } = req.body;

  const updateData: any = {};

  // Validasi dan siapkan data update
  if (title !== undefined) updateData.title = title;
  if (writer !== undefined) updateData.writer = writer;
  if (publisher !== undefined) updateData.publisher = publisher;
  if (genreId !== undefined) updateData.genreId = genreId;
  if (isbn !== undefined) updateData.isbn = isbn;
  if (description !== undefined) updateData.description = description;
  if (condition !== undefined) updateData.condition = condition;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

  if (price !== undefined) {
    const priceNum = parseFloat(price as any);
    if (isNaN(priceNum) || priceNum < 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or negative price' });
    }
    updateData.price = priceNum;
  }

  if (stock !== undefined) {
    const stockNum = Number(stock as any);
    if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid, float, or negative stock',
      });
    }
    updateData.stock = stockNum;
  }

  if (publicationYear !== undefined) {
    const pubYearNum = parseInt(publicationYear as any, 10);
    if (isNaN(pubYearNum) || pubYearNum > 2025) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid publication year' });
    }
    updateData.publicationYear = pubYearNum;
  }

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: 'No valid fields provided for update' });
  }

  try {
    const updatedBook = await prisma.book.update({
      where: { id: id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ success: false, message: 'Book title already exists' });
      }
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// DELETE /books/:id [cite: 46]
export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Ganti jadi HARD DELETE
    await prisma.book.delete({
      where: { id: id },
    });

    res.status(200).json({
      success: true,
      message: 'Book removed successfully',
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};