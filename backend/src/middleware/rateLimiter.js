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
  max: 20, // 20 tentatives de connexion/inscription
  message: {
    success: false,
    message: 'Trop de tentatives, veuillez réessayer dans 15 minutes.'
  },
  skipSuccessfulRequests: true,
});

// Rate limiter pour la création d'entreprises
export const companyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 30, // 30 créations d'entreprise par heure
  message: {
    success: false,
    message: 'Limite de création d\'entreprises atteinte, veuillez réessayer plus tard.'
  },
});

// Rate limiter pour la génération de documents (final)
export const documentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 30, // 30 générations de documents par heure
  message: {
    success: false,
    message: 'Limite de génération de documents atteinte, veuillez réessayer plus tard.'
  },
});

// Rate limiter pour la prévisualisation (plus permissif)
export const previewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // 50 prévisualisations par heure
  message: {
    success: false,
    message: 'Limite de prévisualisation atteinte, veuillez réessayer plus tard.'
  },
});
