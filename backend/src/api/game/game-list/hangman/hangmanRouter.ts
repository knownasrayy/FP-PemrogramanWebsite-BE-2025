import { Router } from 'express';
import { getHangman, listHangman } from './hangmanController';

const router = Router();

// GET / -> list of games (in this module)
router.get('/', listHangman);

// GET /detail -> single game detail
router.get('/detail', getHangman);

export default router;
