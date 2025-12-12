import { Request, Response } from 'express';
import { HangmanGame } from '../../../../common/interface/games/hangman';

const sampleGame: HangmanGame = {
  slug: 'hangman',
  name: 'Hangman',
  description: 'Classic word guessing game. Guess letters before running out of lives.',
  logo: 'mdi-hangman',
  config: {
    maxLives: 6,
    allowHints: true,
  },
  metadata: {
    author: 'Team',
  },
};

export const getHangman = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get hangman game detail successfully',
      data: sampleGame,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const listHangman = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get game list successfully',
      data: [sampleGame],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
