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

    // Mode TEST : Simuler un paiement réussi après 3 secondes
    // En production, cela sera remplacé par l'intégration Flutterwave/Paystack
    const isTestMode = process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_PAYMENT === 'true';
    
    if (isTestMode) {
      // Simuler le paiement après 3 secondes
      setTimeout(async () => {
        try {
          await Payment.updateStatus(payment.id, 'completed', `TEST-${payment.payment_reference}`, {
            test_mode: true,
            simulated_at: new Date().toISOString()
          });
          
          // Mettre à jour le statut de paiement de l'entreprise
          await Company.updatePaymentStatus(company_id, 'paid', payment.amount, payment.payment_reference);
          
          console.log(`✅ [TEST] Paiement simulé réussi pour ${payment.payment_reference}`);
        } catch (error) {
          console.error('❌ [TEST] Erreur simulation paiement:', error);
        }
      }, 3000);
    }

    res.status(201).json({
      success: true,
      message: isTestMode 
        ? 'Paiement initié en mode TEST (sera confirmé automatiquement dans 3 secondes)'
        : 'Paiement initié avec succès',
      data: {
        payment,
        payment_url: null, // Sera rempli avec l'URL de paiement Flutterwave/Paystack
        test_mode: isTestMode,
        instructions: {
          method: payment_method,
          amount: payment.amount,
          currency: payment.currency,
          reference: payment.payment_reference,
          ...(isTestMode && {
            test_note: 'Mode TEST activé - Le paiement sera confirmé automatiquement'
          })
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

// @desc    Simuler un paiement réussi (MODE TEST uniquement)
// @route   POST /api/payments/:id/simulate
// @access  Private
export const simulatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que le mode test est activé
    const isTestMode = process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_PAYMENT === 'true';
    if (!isTestMode) {
      return next(new AppError('Mode test désactivé en production', 403));
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    if (payment.user_id !== userId) {
      return next(new AppError('Accès non autorisé', 403));
    }

    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: 'Paiement déjà confirmé',
        data: { payment }
      });
    }

    // Simuler le paiement réussi
    await Payment.updateStatus(payment.id, 'completed', `TEST-SIM-${payment.payment_reference}`, {
      test_mode: true,
      simulated_at: new Date().toISOString(),
      simulated_by: userId
    });

    // Mettre à jour le statut de paiement de l'entreprise
    if (payment.company_id) {
      await Company.updatePaymentStatus(payment.company_id, 'paid', payment.amount, payment.payment_reference);
    }

    const updatedPayment = await Payment.findById(payment.id);

    res.json({
      success: true,
      message: 'Paiement simulé avec succès (MODE TEST)',
      data: {
        payment: updatedPayment,
        is_paid: true
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
