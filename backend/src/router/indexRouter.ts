import { Router } from 'express';
import authRouter from './authRouter';
import genreRouter from './genreRouter';
import bookRouter from './bookRouter';
import transactionRouter from './transactionRouter';
import gameListRouter from './gameListRouter';

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/genre', genreRouter);
mainRouter.use('/books', bookRouter);
mainRouter.use('/transactions', transactionRouter);
mainRouter.use('/game-list', gameListRouter);

export default mainRouter;