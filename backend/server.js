import express from 'express';
import cors from 'cors';
import "dotenv/config";
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import { connectToDatabase } from './configs/db.js';

const app = express();
const PORT = 3010;

const whitelist = ['http://localhost:3000'];

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

// Kết nối đến cơ sở dữ liệu
connectToDatabase();

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Router
app.use('/role', router);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});