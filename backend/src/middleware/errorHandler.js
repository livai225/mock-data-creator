// Gestionnaire d'erreurs global
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: err.errors
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }

  // Erreur MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Cette entrée existe déjà'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide'
    });
  }

  // Erreur de fichier trop volumineux
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Fichier trop volumineux'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? message : 'Une erreur est survenue',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Classe d'erreur personnalisée
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
