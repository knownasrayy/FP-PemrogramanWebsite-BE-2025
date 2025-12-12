import express from 'express';
import 'dotenv/config';
import mainRouter from './router/indexRouter'; 
import cors from 'cors';

const app = express();

// Middleware untuk logging request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use(express.json());

// Simplified CORS - allow all for development
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.get('/health-check', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running well!',
    date: new Date().toISOString(),
  });
});

app.use('/', mainRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});