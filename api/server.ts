// api/server.ts - Main Express Server Setup

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { getCountries, getCountryById, getVisaPaths, getVisaPathById, getChangelog } from './public';
import { Pool } from 'pg';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Verify critical environment variables
if (!process.env.DATABASE_URL) {
    console.error("CRITICAL ERROR: DATABASE_URL is missing in .env.local");
    process.exit(1);
}

// Global PostgreSQL Pool (Used by all workers and API files)
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ----------------------------------------------------
// Public API Endpoints
// ----------------------------------------------------
app.get('/public/countries', getCountries);
app.get('/public/countries/:id', getCountryById);
app.get('/public/visa-paths', getVisaPaths);
app.get('/public/visa-paths/:id', getVisaPathById);
app.get('/public/changelog', getChangelog);

// ----------------------------------------------------
// Cron Job Endpoints (Protected)
// ----------------------------------------------------
import { verifyCronAuth, handleFreshnessScan, handleLinkCheck, handleIndexRefresh } from './jobs';

app.post('/jobs/freshness-scan', verifyCronAuth, handleFreshnessScan);
app.post('/jobs/link-check', verifyCronAuth, handleLinkCheck);
app.post('/jobs/index-refresh', verifyCronAuth, handleIndexRefresh);

// Health Check Route
app.get('/', (req: Request, res: Response) => {
    res.send(`Passagr API is running on port ${PORT}. Status: Safety Pivot Active.`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Passagr server running at http://localhost:${PORT}`);
    console.log(`Database connection status: ${process.env.DATABASE_URL ? 'OK' : 'FAIL'}`);
});