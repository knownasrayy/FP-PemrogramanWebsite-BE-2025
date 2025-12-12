import { Router } from 'express';
import {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
} from '../controllers/genreController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Soal  cuma minta GET, tapi kita protect CUD-nya
router.post('/', protect, createGenre);
router.patch('/:id', protect, updateGenre);
router.delete('/:id', protect, deleteGenre);

// GET ini public, sesuai requirement soal  buat dropdown
router.get('/', getAllGenres);
router.get('/:id', getGenreById);

export default router;