import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow all client requests for hackathon runnability
  credentials: true
}));

app.use(express.json());

// Main REST API Prefix
app.use('/api', apiRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'BizBrain AI Backend',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 BizBrain AI Express server running on port ${PORT}`);
  console.log(`📁 Database SQLite provider active`);
  console.log(`====================================================`);
});
