/**
 * api/index.js — Vercel Serverless Entry Point
 *
 * Frontend & Backend run on the SAME domain (skripsi-taslim-setiawan-frontend.vercel.app)
 * so there is ZERO CORS issue — all requests to /api/* are handled here.
 */

require('dotenv').config();

const app = require('./src/app');

// Vercel requires module.exports to be the Express app
module.exports = app;
