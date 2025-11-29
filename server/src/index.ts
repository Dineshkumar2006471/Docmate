```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import serverless from 'serverless-http';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug: Check if env vars are loaded
console.log("Loading .env from:", path.resolve(__dirname, '../.env'));
console.log("GEMINI_API_KEY Loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");

import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', aiRoutes);

app.get('/', (req, res) => {
    res.send('DocMate API is running...');
});

// Export for Netlify Functions
export const handler = serverless(app);

// Start Server (Local Development Only)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${ PORT } `);
    });
}
```
