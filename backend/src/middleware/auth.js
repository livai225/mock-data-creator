import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { query } from '../config/database.js';

// Vérifier le token JWT
export const protect = async (req, res, next) => {
  try {
    let token;

    // Récupérer le token depuis le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Non autorisé - Token manquant', 401));
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la base de données
    const users = await query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    const user = users[0];

    if (!user.is_active) {
      return next(new AppError('Compte désactivé', 403));
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Non autorisé - Token invalide', 401));
  }
};

// Vérifier le rôle admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new AppError('Accès refusé - Administrateur uniquement', 403));
  }
};

// Vérifier si l'utilisateur est propriétaire ou admin
export const ownerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next();
    } else {
      next(new AppError('Accès refusé', 403));
    }
  };
};
