import Payment from '../models/Payment.js';
import Company from '../models/Company.js';
import { AppError } from '../utils/errorHandler.js';

// @desc    Initier un paiement
// @route   POST /api/payments/initiate
// @access  Private
export const initiatePayment = async (req, res, next) => {
  try {
    const { company_id, amount, payment_method = 'mobile_money' } = req.body;
    const userId = req.user.id;

    if (!company_id || !amount) {
      return next(new AppError('company_id et amount sont requis', 400));
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const company = await Company.findById(company_id);
    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    if (company.user_id !== userId) {
      return next(new AppError('Accès non autorisé', 403));
    }

    // Vérifier si un paiement valide existe déjà
    const hasValidPayment = await Payment.hasValidPayment(company_id);
    if (hasValidPayment) {
      return res.status(200).json({
        success: true,
        message: 'Paiement déjà effectué pour cette entreprise',
        data: {
          payment: await Payment.getLastValidPayment(company_id),
          already_paid: true
        }
      });
    }

    // Créer un nouveau paiement
    const paymentId = await Payment.create({
      user_id: userId,
      company_id,
      amount: parseFloat(amount),
      currency: 'FCFA',
      payment_method
    });

    const payment = await Payment.findById(paymentId);

    // TODO: Intégrer avec Flutterwave/Paystack ici
    // Pour l'instant, on retourne les infos de paiement
    // L'utilisateur devra confirmer manuellement ou via webhook

    res.status(201).json({
      success: true,
      message: 'Paiement initié avec succès',
      data: {
        payment,
        payment_url: null, // Sera rempli avec l'URL de paiement Flutterwave/Paystack
        instructions: {
          method: payment_method,
          amount: payment.amount,
          currency: payment.currency,
          reference: payment.payment_reference
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vérifier le statut d'un paiement
// @route   GET /api/payments/:id/status
// @access  Private
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    if (payment.user_id !== userId) {
      return next(new AppError('Accès non autorisé', 403));
    }

    res.json({
      success: true,
      data: {
        payment,
        is_paid: payment.status === 'completed'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vérifier si une entreprise a un paiement validé
// @route   GET /api/payments/company/:companyId/check
// @access  Private
export const checkCompanyPayment = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'entreprise appartient à l'utilisateur
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    if (company.user_id !== userId) {
      return next(new AppError('Accès non autorisé', 403));
    }

    const hasValidPayment = await Payment.hasValidPayment(companyId);
    const lastPayment = hasValidPayment ? await Payment.getLastValidPayment(companyId) : null;

    res.json({
      success: true,
      data: {
        has_payment: hasValidPayment,
        payment: lastPayment,
        can_download: hasValidPayment
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook pour confirmer un paiement (appelé par Flutterwave/Paystack)
// @route   POST /api/payments/webhook
// @access  Public (avec vérification de signature)
export const paymentWebhook = async (req, res, next) => {
  try {
    const { reference, transaction_id, status, amount, metadata } = req.body;

    // TODO: Vérifier la signature du webhook (Flutterwave/Paystack)
    // Pour l'instant, on fait confiance (à sécuriser en production)

    const payment = await Payment.findByReference(reference);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé' });
    }

    // Mettre à jour le statut du paiement
    let paymentStatus = 'pending';
    if (status === 'successful' || status === 'completed') {
      paymentStatus = 'completed';
    } else if (status === 'failed') {
      paymentStatus = 'failed';
    }

    await Payment.updateStatus(payment.id, paymentStatus, transaction_id, metadata);

    // Mettre à jour le statut de paiement de l'entreprise
    if (paymentStatus === 'completed' && payment.company_id) {
      await Company.updatePaymentStatus(payment.company_id, 'paid', payment.amount, payment.payment_reference);
    }

    res.json({
      success: true,
      message: 'Webhook traité avec succès'
    });
  } catch (error) {
    console.error('Erreur webhook paiement:', error);
    next(error);
  }
};

// @desc    Obtenir l'historique des paiements d'un utilisateur
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findByUserId(userId);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};
