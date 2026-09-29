import rateLimit from 'express-rate-limit';

// Rate limiter for user authentication endpoints (generous in development for switching roles)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts, please try again later.'
  }
});

// Rate limiter for public/unauthenticated write endpoints (max 20 requests per hour per IP)
export const publicSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.'
  }
});
