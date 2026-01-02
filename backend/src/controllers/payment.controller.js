import Payment from '../models/Payment.js';
import Company from '../models/Company.js';
import AppError from '../utils/errorHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Multer pour l'upload des captures de paiement
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/payment-proofs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `payment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mime);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Seules les images (JPG, PNG, GIF) et PDF sont autorisés'));
  }
});

export const uploadPaymentProof = upload.single('payment_proof');

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

// @desc    Soumettre une preuve de paiement
// @route   POST /api/payments/submit-proof
// @access  Private
export const submitPaymentProof = async (req, res, next) => {
  try {
    const { companyId, phoneNumber, transactionReference } = req.body;
    const userId = req.user.id;

    if (!companyId) {
      return next(new AppError('Company ID requis', 400));
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    if (company.user_id !== userId) {
      return next(new AppError('Accès non autorisé', 403));
    }

    // Gérer l'upload de la preuve (capture d'écran)
    let proofImagePath = null;
    if (req.file) {
      proofImagePath = `/uploads/payments/${req.file.filename}`;
    }

    // Créer la demande de paiement
    const paymentId = await Payment.create({
      companyId,
      userId,
      amount: company.payment_amount || 0,
      phoneNumber,
      transactionReference,
      proofImagePath
    });

    const payment = await Payment.findById(paymentId);

    res.status(201).json({
      success: true,
      message: 'Preuve de paiement soumise avec succès. Un administrateur va la vérifier.',
      data: payment
    });
  } catch (error) {
    console.error('Erreur soumission preuve paiement:', error);
    next(error);
  }
};

// @desc    Obtenir tous les paiements (Admin)
// @route   GET /api/payments/admin/all
// @access  Private (Admin)
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    
    const payments = await Payment.getAll({
      status,
      limit: limit || 100
    });

    const stats = await Payment.getStats();

    res.json({
      success: true,
      data: {
        payments,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Valider/Rejeter un paiement (Admin)
// @route   PUT /api/payments/admin/:id/verify
// @access  Private (Admin)
export const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!['verified', 'rejected'].includes(status)) {
      return next(new AppError('Status invalide. Utilisez "verified" ou "rejected"', 400));
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    await Payment.verify(id, adminId, status, adminNotes);

    const updatedPayment = await Payment.findById(id);

    res.json({
      success: true,
      message: status === 'verified' ? 'Paiement vérifié avec succès' : 'Paiement rejeté',
      data: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir le statut de paiement d'une entreprise
// @route   GET /api/payments/company/:companyId/status
// @access  Private
export const getCompanyPaymentStatus = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'entreprise appartient à l'utilisateur (sauf si admin)
    if (req.user.role !== 'admin') {
      const company = await Company.findById(companyId);
      if (!company || company.user_id !== userId) {
        return next(new AppError('Accès non autorisé', 403));
      }
    }

    const payments = await Payment.findByCompanyId(companyId);
    const company = await Company.findById(companyId);

    res.json({
      success: true,
      data: {
        paymentStatus: company.payment_status,
        payments,
        canDownload: company.payment_status === 'paid'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soumettre un paiement manuel avec preuve
// @route   POST /api/payments/submit-manual
// @access  Private
export const submitManualPayment = async (req, res, next) => {
  try {
    const { company_id, amount, transaction_reference } = req.body;
    const userId = req.user.id;
    const paymentProof = req.file;

    if (!company_id || !amount) {
      return next(new AppError('company_id et amount sont requis', 400));
    }

    if (!paymentProof) {
      return next(new AppError('La preuve de paiement est requise', 400));
    }

    if (!transaction_reference) {
      return next(new AppError('La référence de transaction est requise', 400));
    }

    // Vérifier que l'entreprise appartient à l'utilisateur
    const company = await Company.findById(company_id);
    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    if (company.user_id !== userId) {
      return next(new AppError('Accès non autorisé', 403));
    }

    // Vérifier si un paiement en attente ou validé existe déjà
    const existingPayment = await Payment.getLastValidPayment(company_id);
    if (existingPayment && (existingPayment.status === 'completed' || existingPayment.status === 'pending')) {
      return res.status(200).json({
        success: true,
        message: existingPayment.status === 'completed' 
          ? 'Un paiement a déjà été validé pour cette entreprise'
          : 'Un paiement est déjà en attente de validation',
        data: { payment: existingPayment }
      });
    }

    // Créer un nouveau paiement avec statut "pending"
    const paymentId = await Payment.create({
      user_id: userId,
      company_id,
      amount: parseFloat(amount),
      currency: 'FCFA',
      payment_method: 'manual_transfer',
      status: 'pending',
      transaction_reference,
      payment_proof_path: paymentProof.path,
      metadata: {
        original_filename: paymentProof.originalname,
        file_size: paymentProof.size,
        mime_type: paymentProof.mimetype,
        submitted_at: new Date().toISOString()
      }
    });

    const payment = await Payment.findById(paymentId);

    // Mettre à jour le statut de l'entreprise en "pending"
    await Company.updatePaymentStatus(company_id, 'pending', amount, payment.payment_reference);

    res.status(201).json({
      success: true,
      message: 'Preuve de paiement soumise avec succès. En attente de validation par l\'administrateur.',
      data: {
        payment: {
          id: payment.id,
          payment_reference: payment.payment_reference,
          amount: payment.amount,
          status: payment.status,
          submitted_at: payment.created_at
        }
      }
    });
  } catch (error) {
    console.error('Erreur soumission paiement manuel:', error);
    next(error);
  }
};

// @desc    Valider un paiement manuel (Admin)
// @route   PUT /api/payments/:id/validate
// @access  Private (Admin only)
export const validateManualPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    if (payment.status !== 'pending') {
      return next(new AppError('Ce paiement ne peut pas être validé (statut actuel: ' + payment.status + ')', 400));
    }

    // Valider le paiement
    const updated = await Payment.validatePayment(id, adminId, notes);
    
    if (!updated) {
      return next(new AppError('Erreur lors de la validation du paiement', 500));
    }

    // Mettre à jour le statut de l'entreprise en "paid"
    await Company.updatePaymentStatus(
      payment.company_id, 
      'paid', 
      payment.amount, 
      payment.payment_reference
    );

    // Récupérer le paiement mis à jour
    const updatedPayment = await Payment.findById(id);

    res.json({
      success: true,
      message: 'Paiement validé avec succès',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Erreur validation paiement:', error);
    next(error);
  }
};

// @desc    Rejeter un paiement manuel (Admin)
// @route   PUT /api/payments/:id/reject
// @access  Private (Admin only)
export const rejectManualPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return next(new AppError('La raison du rejet est requise', 400));
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    if (payment.status !== 'pending') {
      return next(new AppError('Ce paiement ne peut pas être rejeté (statut actuel: ' + payment.status + ')', 400));
    }

    // Rejeter le paiement
    const updated = await Payment.rejectPayment(id, adminId, reason);
    
    if (!updated) {
      return next(new AppError('Erreur lors du rejet du paiement', 500));
    }

    // Mettre à jour le statut de l'entreprise en "unpaid"
    await Company.updatePaymentStatus(payment.company_id, 'unpaid');

    // Récupérer le paiement mis à jour
    const updatedPayment = await Payment.findById(id);

    res.json({
      success: true,
      message: 'Paiement rejeté',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Erreur rejet paiement:', error);
    next(error);
  }
};

// @desc    Obtenir les paiements en attente (Admin)
// @route   GET /api/payments/pending
// @access  Private (Admin only)
export const getPendingPayments = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const payments = await Payment.getPendingPayments(limit);

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Erreur récupération paiements en attente:', error);
    next(error);
  }
};
