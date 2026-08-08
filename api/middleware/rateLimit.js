const rateLimit = require('express-rate-limit');

// Strict rate limiter for sensitive auth operations (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 file uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Upload limit reached for this hour. Please try again later.' }
});

// Rate limiter for AI Ask endpoint
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Max 50 AI questions per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI question limit reached. Please wait an hour before asking more.' }
});

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  aiLimiter
};
