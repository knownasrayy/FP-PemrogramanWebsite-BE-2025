export interface HangmanGame {
  slug: string;
  name: string;
  description: string;
  logo?: string;
  // game-specific configuration schema (free-form)
  config?: Record<string, any>;
  // additional fields returned by API
  metadata?: Record<string, any>;
}

export default HangmanGame;
