import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';

const router = express.Router();

// Validation pour l'inscription
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('phone').optional().isMobilePhone('any').withMessage('Numéro de téléphone invalide')
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
];

// Validation pour la mise à jour du profil
const profileValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('phone').optional().isMobilePhone('any').withMessage('Numéro de téléphone invalide')
];

// Validation pour le changement de mot de passe
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
];

// Routes publiques
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

// Routes protégées
router.get('/me', protect, getMe);
router.put('/profile', protect, profileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

export default router;
