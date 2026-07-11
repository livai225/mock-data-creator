import Payment from '../models/Payment.js';
import Company from '../models/Company.js';
import AppError from '../utils/errorHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
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

    // Créer un nouveau paiement en base
    const paymentId = await Payment.create({
      user_id: userId,
      company_id,
      amount: parseFloat(amount),
      currency: 'XOF',
      payment_method: 'genius_pay'
    });

    const payment = await Payment.findById(paymentId);

    // Appel à l'API Genius Pay
    const frontendUrl = process.env.FRONTEND_URL || 'https://archexcellence.ci';
    const geniusRes = await fetch(`${process.env.GENIUS_PAY_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.GENIUS_PAY_API_KEY,
        'X-API-Secret': process.env.GENIUS_PAY_API_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        currency: 'XOF',
        description: `Création d'entreprise - ${company.company_name}`,
        customer: {
          name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email,
          email: req.user.email,
          country: 'CI'
        },
        metadata: {
          payment_reference: payment.payment_reference,
          company_id: String(company_id)
        },
        success_url: `${frontendUrl}/paiement-succes?ref=${payment.payment_reference}`,
        error_url: `${frontendUrl}/paiement-erreur?ref=${payment.payment_reference}`
      })
    });

    const geniusData = await geniusRes.json();

    if (!geniusData.success) {
      console.error('❌ Genius Pay error:', geniusData);
      return next(new AppError(geniusData.message || 'Erreur lors de la création du paiement Genius Pay', 502));
    }

    // Stocker la référence Genius Pay
    await Payment.updateStatus(payment.id, 'pending', geniusData.data.reference, {
      genius_pay_id: geniusData.data.id,
      genius_pay_reference: geniusData.data.reference
    });

    console.log(`✅ Paiement Genius Pay créé : ${geniusData.data.reference} → ${geniusData.data.checkout_url}`);

    res.status(201).json({
      success: true,
      message: 'Paiement initié avec succès',
      data: {
        payment_reference: payment.payment_reference,
        checkout_url: geniusData.data.checkout_url,
        amount: parseFloat(amount),
        currency: 'XOF'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vérifier activement un paiement auprès de Genius Pay (fallback webhook)
// @route   GET /api/payments/verify/:reference
// @access  Private
export const verifyPaymentByReference = async (req, res, next) => {
  try {
    const { reference } = req.params; // référence interne PAY-xxxx
    const userId = req.user.id;

    const payment = await Payment.findByReference(reference);
    if (!payment) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    if (payment.user_id !== userId && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    // Déjà confirmé en base : rien à faire
    if (payment.status === 'completed') {
      return res.json({
        success: true,
        data: { status: 'completed', is_paid: true, payment_reference: reference }
      });
    }

    // Pas de référence Genius Pay → impossible de vérifier
    if (!payment.transaction_reference) {
      return res.json({
        success: true,
        data: { status: payment.status, is_paid: false, payment_reference: reference }
      });
    }

    // Interroger l'API Genius Pay sur le vrai statut
    const geniusRes = await fetch(
      `${process.env.GENIUS_PAY_BASE_URL}/payments/${payment.transaction_reference}/status`,
      {
        headers: {
          'X-API-Key': process.env.GENIUS_PAY_API_KEY,
          'X-API-Secret': process.env.GENIUS_PAY_API_SECRET
        }
      }
    );
    const geniusData = await geniusRes.json();
    const remoteStatus = geniusData?.data?.status;

    if (remoteStatus === 'completed') {
      await Payment.updateStatus(payment.id, 'completed', payment.transaction_reference, geniusData.data);
      if (payment.company_id) {
        await Company.updatePaymentStatus(payment.company_id, 'paid', payment.amount, payment.payment_reference);
      }
      console.log(`✅ [Genius Pay] Paiement vérifié (fallback) : ${reference} → company_id=${payment.company_id}`);
      return res.json({
        success: true,
        data: { status: 'completed', is_paid: true, payment_reference: reference }
      });
    }

    res.json({
      success: true,
      data: { status: remoteStatus || payment.status, is_paid: false, payment_reference: reference }
    });
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
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

// @desc    Webhook Genius Pay — confirmation automatique de paiement
// @route   POST /api/payments/webhook
// @access  Public
export const paymentWebhook = async (req, res, next) => {
  try {
    const event     = req.headers['x-webhook-event'];
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    // Vérification de la signature HMAC-SHA256
    if (process.env.GENIUS_PAY_WEBHOOK_SECRET && signature && timestamp) {
      const payload   = JSON.stringify(req.body);
      const expected  = crypto
        .createHmac('sha256', process.env.GENIUS_PAY_WEBHOOK_SECRET)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

      if (signature !== expected) {
        console.warn('[Genius Pay Webhook] Signature invalide — requête rejetée');
        return res.status(401).json({ success: false, message: 'Signature invalide' });
      }
    }

    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, message: 'Payload manquant' });
    }

    console.log(`[Genius Pay Webhook] event=${event} reference=${data.reference} status=${data.status}`);

    // Retrouver le paiement via la référence interne stockée dans metadata
    const internalRef = data.metadata?.payment_reference;
    let payment = null;

    if (internalRef) {
      payment = await Payment.findByReference(internalRef);
    }
    // Fallback : chercher par la référence Genius Pay
    if (!payment && data.reference) {
      payment = await Payment.findByTransactionId(data.reference);
    }

    if (!payment) {
      console.warn(`[Genius Pay Webhook] Paiement introuvable pour ref=${internalRef || data.reference}`);
      return res.status(200).json({ success: true, message: 'Paiement non trouvé, ignoré' });
    }

    const paymentStatus = data.status === 'completed' ? 'completed' : 'failed';

    await Payment.updateStatus(payment.id, paymentStatus, data.reference, data);

    if (paymentStatus === 'completed' && payment.company_id) {
      await Company.updatePaymentStatus(payment.company_id, 'paid', payment.amount, data.reference);
      console.log(`✅ [Genius Pay] Paiement confirmé pour company_id=${payment.company_id}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur webhook Genius Pay:', error);
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
