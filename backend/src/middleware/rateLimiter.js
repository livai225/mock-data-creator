import rateLimit from 'express-rate-limit';

// Rate limiter général
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour l'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
  },
  skipSuccessfulRequests: true,
});

// Rate limiter pour la création de documents
export const documentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 générations de documents par heure
  message: {
    success: false,
    message: 'Limite de génération de documents atteinte, veuillez réessayer plus tard.'
  },
});
