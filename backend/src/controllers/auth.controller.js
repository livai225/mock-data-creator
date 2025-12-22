import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('Cet email est déjà utilisé', 400));
    }

    // Créer l'utilisateur
    const userId = await User.create({
      email,
      password
    });

    // Récupérer l'utilisateur créé
    const user = await User.findById(userId);

    // Générer le token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return next(new AppError('Votre compte a été désactivé', 403));
    }

    // Vérifier le mot de passe
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }

    // Mettre à jour la dernière connexion
    await User.updateLastLogin(user.id);

    // Générer le token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updated = await User.update(req.user.id, {
      firstName,
      lastName,
      phone
    });

    if (!updated) {
      return next(new AppError('Erreur lors de la mise à jour du profil', 400));
    }

    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findByEmail(req.user.email);

    // Vérifier le mot de passe actuel
    const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Mot de passe actuel incorrect', 401));
    }

    // Mettre à jour le mot de passe
    await User.update(req.user.id, { password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour les préférences utilisateur
// @route   PUT /api/auth/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const { emailNotifications, smsNotifications, documentUpdates, paymentReminders } = req.body;

    // Pour l'instant, on log les préférences (à implémenter avec une vraie table de préférences)
    console.log(`📋 Mise à jour préférences utilisateur ${req.user.id}:`, {
      emailNotifications,
      smsNotifications,
      documentUpdates,
      paymentReminders
    });

    // TODO: Sauvegarder dans une table user_preferences
    // Pour l'instant, on retourne simplement un succès

    res.status(200).json({
      success: true,
      message: 'Préférences mises à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};