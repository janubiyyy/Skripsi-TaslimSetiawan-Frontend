/**
 * api/index.js — Vercel Serverless Entry Point
 * Handles all /api/* requests on the same origin (no CORS issues).
 */

const app = require('./src/app');

module.exports = app;
