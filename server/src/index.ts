import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../.env');
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

console.log("Server Starting...");
console.log("GEMINI_API_KEY Loaded:", process.env.GEMINI_API_KEY ? "YES (Length: " + process.env.GEMINI_API_KEY.length + ")" : "NO");


import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Routes
app.use('/api', aiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
