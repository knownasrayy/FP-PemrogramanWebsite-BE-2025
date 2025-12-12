// src/controllers/genreController.ts

import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// POST /genre
export const createGenre = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  try {
    const genre = await prisma.genre.create({
      data: { name },
    });

    res
      .status(201)
      .json({ success: true, message: 'Genre created successfully', data: genre });
  } catch (error) {
    // Handle duplicate name
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return res
        .status(400)
        .json({ success: false, message: 'Genre name already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /genre
export const getAllGenres = async (req: Request, res: Response) => {
  // Nggak ada pagination atau filter di soal, tapi gue tambahin simpel
  const { search } = req.query;

  let where: any = {};

  if (search) {
    where.name = {
      contains: search as string,
      mode: 'insensitive',
    };
  }

  try {
    const genres = await prisma.genre.findMany({
      where: where,
      orderBy: { name: 'asc' }, // Biar urut buat dropdown
    });

    res.status(200).json({
      success: true,
      message: 'Get all genre successfully',
      data: genres,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /genre/:id
export const getGenreById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const genre = await prisma.genre.findUnique({
      where: { id: id },
    });

    if (!genre) {
      return res.status(404).json({ success: false, message: 'Genre not found' });
    }

    res
      .status(200)
      .json({ success: true, message: 'Get genre detail successfully', data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /genre/:id
export const updateGenre = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  try {
    const updatedGenre = await prisma.genre.update({
      where: { id },
      data: { name },
    });

    return res.status(200).json({
      success: true,
      message: 'Genre updated successfully',
      data: updatedGenre,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ success: false, message: 'Genre name already exists' });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Genre not found' });
      }
    }
    console.error('Error updating genre:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /genre/:id
export const deleteGenre = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.genre.delete({
      where: { id: id },
    });

    res.status(200).json({ success: true, message: 'Genre removed successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Genre not found' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};