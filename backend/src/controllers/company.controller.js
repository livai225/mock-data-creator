import Company from '../models/Company.js';
import { AppError } from '../middleware/errorHandler.js';

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
      paymentAmount
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
      paymentAmount
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

    // Ne peut supprimer que les brouillons
    if (company.status !== 'draft' && req.user.role !== 'admin') {
      return next(new AppError('Impossible de supprimer une entreprise en cours de traitement', 400));
    }

    await Company.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Entreprise supprimée avec succès'
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
