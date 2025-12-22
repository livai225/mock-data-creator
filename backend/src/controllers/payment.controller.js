import { AppError } from '../middleware/errorHandler.js';
import Payment from '../models/Payment.js';
import Company from '../models/Company.js';

// @desc    Obtenir mes paiements
// @route   GET /api/payments/my
// @access  Private
export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findByUserId(req.user.id);
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques de paiements
// @route   GET /api/payments/stats
// @access  Private
export const getPaymentStats = async (req, res, next) => {
  try {
    const stats = await Payment.getUserStats(req.user.id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer un paiement pour une entreprise
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res, next) => {
  try {
    const { companyId, amount, description, paymentMethod } = req.body;

    // Vérifier que l'entreprise existe et appartient à l'utilisateur
    if (companyId) {
      const company = await Company.findById(companyId);
      if (!company) {
        return next(new AppError('Entreprise non trouvée', 404));
      }
      if (company.user_id !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Accès non autorisé', 403));
      }
    }

    const paymentId = await Payment.create({
      userId: req.user.id,
      companyId,
      amount,
      description: description || 'Frais de création d\'entreprise',
      paymentMethod: paymentMethod || 'pending'
    });

    const payment = await Payment.findById(paymentId);

    res.status(201).json({
      success: true,
      message: 'Paiement créé avec succès',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le statut d'un paiement
// @route   PUT /api/payments/:id/status
// @access  Private (Admin only pour compléter)
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentReference } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    // Seul l'admin peut marquer comme complété
    if (status === 'completed' && req.user.role !== 'admin') {
      return next(new AppError('Seul un administrateur peut valider un paiement', 403));
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    await Payment.updateStatus(id, status, paymentReference);

    // Si le paiement est complété, mettre à jour le statut de paiement de l'entreprise
    if (status === 'completed' && payment.company_id) {
      await Company.updatePayment(payment.company_id, {
        paymentStatus: 'paid',
        paymentReference,
        paymentDate: new Date()
      });
    }

    const updatedPayment = await Payment.findById(id);

    res.status(200).json({
      success: true,
      message: 'Statut de paiement mis à jour',
      data: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Télécharger le reçu de paiement
// @route   GET /api/payments/:id/receipt
// @access  Private
export const downloadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    if (payment.status !== 'completed') {
      return next(new AppError('Le reçu n\'est disponible que pour les paiements complétés', 400));
    }

    // TODO: Générer un vrai PDF de reçu
    // Pour l'instant, retourner un message
    res.status(200).json({
      success: true,
      message: 'Fonctionnalité de téléchargement de reçu en cours de développement',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir tous les paiements (Admin)
// @route   GET /api/payments
// @access  Private/Admin
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    
    const payments = await Payment.findAll({
      status,
      limit: limit || 50,
      offset: offset || 0
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

