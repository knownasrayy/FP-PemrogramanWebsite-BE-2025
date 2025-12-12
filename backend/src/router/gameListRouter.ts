import { Router } from 'express';
import hangmanRouter from '../api/game/game-list/hangman/hangmanRouter';

const router = Router();

router.use('/hangman', hangmanRouter);

export default router;
