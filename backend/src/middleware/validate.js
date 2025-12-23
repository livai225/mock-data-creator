import { validationResult } from 'express-validator';

// Middleware de validation
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Créer un message d'erreur lisible avec tous les détails
    const errorMessages = errors.array().map(err => err.msg);
    const combinedMessage = errorMessages.join('. ');
    
    return res.status(400).json({
      success: false,
      message: combinedMessage || 'Erreur de validation',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};
