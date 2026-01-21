import Company from '../models/Company.js';
import Document from '../models/Document.js';
import { AppError } from '../middleware/errorHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Créer une nouvelle entreprise
// @route   POST /api/companies
// @access  Private
export const createCompany = async (req, res, next) => {
  try {
    const {
      companyType,
      companyName,
      activity,
      capital,
      address,
      city,
      gerant,
      associates,
      managers,
      chiffreAffairesPrev,
      paymentAmount,
      declarant,
      projections,
      // Champs de localisation
      commune,
      quartier,
      lot,
      ilot,
      nomImmeuble,
      numeroEtage,
      numeroPorte,
      section,
      parcelle,
      tfNumero,
      fax,
      adressePostale,
      telephone,
      email
    } = req.body;

    const companyData = {
      userId: req.user.id,
      companyType,
      companyName,
      activity,
      capital,
      address,
      city: city || 'Abidjan',
      gerant,
      chiffreAffairesPrev,
      managers: managers || [],
      paymentAmount,
      declarant: declarant || {},
      projections: projections || {},
      // Champs de localisation
      commune,
      quartier,
      lot,
      ilot,
      nomImmeuble,
      numeroEtage,
      numeroPorte,
      section,
      parcelle,
      tfNumero,
      fax,
      adressePostale,
      telephone,
      email
    };

    const companyId = await Company.create(companyData, associates || []);

    const company = await Company.findById(companyId);

    res.status(201).json({
      success: true,
      message: 'Entreprise créée avec succès',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les entreprises de l'utilisateur
// @route   GET /api/companies
// @access  Private
export const getMyCompanies = async (req, res, next) => {
  try {
    const { status, limit = 20 } = req.query;

    const filters = {
      status,
      limit: parseInt(limit)
    };

    const companies = await Company.findByUserId(req.user.id, filters);
    const total = await Company.count({ userId: req.user.id, status });

    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        total,
        count: companies.length,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une entreprise par ID
// @route   GET /api/companies/:id
// @access  Private
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (company.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une entreprise
// @route   PUT /api/companies/:id
// @access  Private
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    // Vérifier que l'utilisateur est propriétaire
    if (company.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    // Ne peut pas modifier si déjà en traitement ou complété
    if (company.status !== 'draft' && req.user.role !== 'admin') {
      return next(new AppError('Impossible de modifier une entreprise en cours de traitement', 400));
    }

    const updated = await Company.update(req.params.id, req.body);

    if (!updated) {
      return next(new AppError('Erreur lors de la mise à jour', 400));
    }

    const updatedCompany = await Company.findById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Entreprise mise à jour avec succès',
      data: updatedCompany
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soumettre une entreprise pour traitement
// @route   POST /api/companies/:id/submit
// @access  Private
export const submitCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    if (company.user_id !== req.user.id) {
      return next(new AppError('Accès non autorisé', 403));
    }

    if (company.status !== 'draft') {
      return next(new AppError('Cette entreprise a déjà été soumise', 400));
    }

    // Vérifier le paiement
    if (company.payment_status !== 'paid') {
      return next(new AppError('Le paiement doit être effectué avant la soumission', 400));
    }

    await Company.updateStatus(req.params.id, 'pending');

    res.status(200).json({
      success: true,
      message: 'Entreprise soumise avec succès. Vous recevrez une notification une fois le traitement terminé.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une entreprise
// @route   DELETE /api/companies/:id
// @access  Private
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    if (company.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    // Permettre la suppression même pour les entreprises non-draft si c'est l'utilisateur lui-même
    // (utile pour supprimer les entreprises de test)
    if (company.status !== 'draft' && req.user.role !== 'admin' && company.user_id === req.user.id) {
      // Autoriser la suppression par le propriétaire même si ce n'est pas un draft
    } else if (company.status !== 'draft' && req.user.role !== 'admin') {
      return next(new AppError('Impossible de supprimer une entreprise en cours de traitement', 400));
    }

    // 1. Récupérer tous les documents associés à l'entreprise
    const documents = await Document.findByCompanyId(req.params.id);

    // 2. Supprimer les fichiers physiques
    const GENERATED_DIR = path.join(__dirname, '../../generated');
    for (const doc of documents) {
      if (doc.file_path && fs.existsSync(doc.file_path)) {
        try {
          fs.unlinkSync(doc.file_path);
        } catch (fileError) {
          console.error(`Erreur suppression fichier ${doc.file_path}:`, fileError);
          // Continuer même si la suppression du fichier échoue
        }
      }
    }

    // 3. Supprimer les documents de la base de données
    await Document.deleteByCompanyId(req.params.id);

    // 4. Supprimer les associés (cascade devrait le faire, mais on le fait explicitement)
    const { query } = await import('../config/database.js');
    await query('DELETE FROM associates WHERE company_id = ?', [req.params.id]);
    await query('DELETE FROM managers WHERE company_id = ?', [req.params.id]);

    // 5. Supprimer l'entreprise
    await Company.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Entreprise et documents associés supprimés avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques de l'utilisateur
// @route   GET /api/companies/stats/me
// @access  Private
export const getMyStats = async (req, res, next) => {
  try {
    const total = await Company.count({ userId: req.user.id });
    const completed = await Company.count({ userId: req.user.id, status: 'completed' });
    const pending = await Company.count({ userId: req.user.id, status: 'pending' });
    const draft = await Company.count({ userId: req.user.id, status: 'draft' });

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        draft
      }
    });
  } catch (error) {
    next(error);
  }
};
