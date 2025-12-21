import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../middleware/errorHandler.js';
import Document from '../models/Document.js';
import Company from '../models/Company.js';
import { generateDocument, generateMultipleDocuments } from '../utils/documentGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '../../generated');

const ensureGeneratedDir = () => {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
};

const safeFilePart = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
};

// @desc    Générer et enregistrer les documents (PDF et Word) - AUTOMATIQUE avec données entreprise
// @route   POST /api/documents/generate
// @access  Private
export const generateDocuments = async (req, res, next) => {
  try {
    console.log('📥 Requête de génération reçue:', {
      userId: req.user.id,
      body: JSON.stringify(req.body, null, 2)
    });

    const { companyId, docs, formats = ['pdf', 'docx'] } = req.body;

    console.log(`🔍 Paramètres extraits: companyId=${companyId}, docs=${docs?.length || 0}, formats=${formats.join(',')}`);

    if (!Array.isArray(docs) || docs.length === 0) {
      console.error('❌ Liste de documents invalide:', docs);
      return next(new AppError('Liste de documents invalide', 400));
    }

    // Récupérer les données de l'entreprise si companyId fourni
    let company = null;
    let associates = [];
    let managers = [];

    if (companyId) {
      console.log(`🔍 Recherche entreprise ID: ${companyId}`);
      company = await Company.findById(companyId);
      if (!company) {
        console.error(`❌ Entreprise ${companyId} non trouvée`);
        return next(new AppError('Entreprise non trouvée', 404));
      }
      console.log(`✅ Entreprise trouvée: ${company.company_name} (user_id: ${company.user_id})`);
      
      // Vérifier que l'utilisateur est propriétaire
      if (company.user_id !== req.user.id && req.user.role !== 'admin') {
        console.error(`❌ Accès non autorisé: user ${req.user.id} != company.user_id ${company.user_id}`);
        return next(new AppError('Accès non autorisé', 403));
      }
      associates = company.associates || [];
      managers = company.managers || [];
      console.log(`📊 Données récupérées: ${associates.length} associés, ${managers.length} gérants`);
    } else {
      // Si pas de companyId, utiliser les données fournies dans le body
      console.log('⚠️ Pas de companyId fourni, utilisation des données du body');
      company = req.body.company || {};
      associates = req.body.associates || [];
      managers = req.body.managers || [];
    }

    if (!company || !company.company_name) {
      console.error('❌ Données d\'entreprise manquantes:', company);
      return next(new AppError('Données d\'entreprise manquantes', 400));
    }

    const created = [];

    console.log(`🚀 Début génération de ${docs.length} documents...`);
    
    // Générer tous les documents
    const results = await generateMultipleDocuments(
      docs,
      company,
      associates,
      managers,
      req.body.additionalData || {},
      { formats }
    );

    console.log(`📦 Résultats génération: ${results.length} résultats obtenus`);

    // Enregistrer chaque document généré
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(`\n📄 Traitement résultat ${i + 1}/${results.length}:`, {
        docName: result.docName,
        hasError: !!result.error,
        hasPdf: !!result.pdf,
        hasDocx: !!result.docx
      });

      if (result.error) {
        console.error(`❌ Erreur génération ${result.docName}:`, result.error);
        console.error('   Stack:', result.error.stack);
        continue;
      }

      const docType = safeFilePart(result.docName) || 'document';
      console.log(`   Type document: ${docType}`);

      // Enregistrer PDF si généré
      if (result.pdf) {
        console.log(`   📄 Enregistrement PDF: ${result.pdf.fileName}`);
        console.log(`   📁 Chemin: ${result.pdf.filePath}`);
        console.log(`   👤 UserID: ${req.user.id}, CompanyID: ${companyId || 'null'}`);
        
        try {
          const pdfId = await Document.create({
            userId: req.user.id,
            companyId: companyId || null,
            docType: `${docType}_pdf`,
            docName: result.docName,
            fileName: result.pdf.fileName,
            filePath: result.pdf.filePath,
            mimeType: result.pdf.mimeType
          });

          console.log(`   ✅ Document PDF créé en DB: ID=${pdfId}`);

          created.push({
            id: pdfId,
            docType: `${docType}_pdf`,
            docName: result.docName,
            fileName: result.pdf.fileName,
            format: 'pdf',
            createdAt: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error(`   ❌ Erreur DB lors création PDF:`, dbError);
          console.error('   Stack:', dbError.stack);
        }
      } else {
        console.log(`   ⚠️ Pas de PDF généré pour ${result.docName}`);
      }

      // Enregistrer Word si généré
      if (result.docx) {
        console.log(`   📄 Enregistrement DOCX: ${result.docx.fileName}`);
        console.log(`   📁 Chemin: ${result.docx.filePath}`);
        
        try {
          const docxId = await Document.create({
            userId: req.user.id,
            companyId: companyId || null,
            docType: `${docType}_docx`,
            docName: result.docName,
            fileName: result.docx.fileName,
            filePath: result.docx.filePath,
            mimeType: result.docx.mimeType
          });

          console.log(`   ✅ Document DOCX créé en DB: ID=${docxId}`);

          created.push({
            id: docxId,
            docType: `${docType}_docx`,
            docName: result.docName,
            fileName: result.docx.fileName,
            format: 'docx',
            createdAt: new Date().toISOString(),
          });
        } catch (dbError) {
          console.error(`   ❌ Erreur DB lors création DOCX:`, dbError);
          console.error('   Stack:', dbError.stack);
        }
      } else {
        console.log(`   ⚠️ Pas de DOCX généré pour ${result.docName}`);
      }
    }
    
    console.log(`\n📦 Résumé: ${created.length} documents créés en DB pour entreprise ${companyId || 'sans entreprise'}`);
    console.log(`   IDs créés:`, created.map(c => `${c.docName} (${c.format}) ID=${c.id}`));

    res.status(201).json({
      success: true,
      message: 'Documents générés et enregistrés',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lister mes documents
// @route   GET /api/documents/my
// @access  Private
export const getMyDocuments = async (req, res, next) => {
  try {
    const docs = await Document.findByUserId(req.user.id);
    console.log(`📋 Documents récupérés pour utilisateur ${req.user.id}: ${docs.length} documents`);
    if (docs.length > 0) {
      console.log(`   Détails:`, docs.map(d => ({ id: d.id, name: d.doc_name, company_id: d.company_id })));
    }
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error('❌ Erreur récupération documents:', error);
    next(error);
  }
};

// @desc    Télécharger un document
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return next(new AppError('Document non trouvé', 404));
    }

    if (doc.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    if (!doc.file_path || !fs.existsSync(doc.file_path)) {
      return next(new AppError('Fichier introuvable sur le serveur', 404));
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);

    const stream = fs.createReadStream(doc.file_path);
    stream.on('error', (e) => next(e));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Prévisualiser un document (inline)
// @route   GET /api/documents/:id/view
// @access  Private
export const viewDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return next(new AppError('Document non trouvé', 404));
    }

    if (doc.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    if (!doc.file_path || !fs.existsSync(doc.file_path)) {
      return next(new AppError('Fichier introuvable sur le serveur', 404));
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);

    const stream = fs.createReadStream(doc.file_path);
    stream.on('error', (e) => next(e));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Générer un document manuellement avec formulaire personnalisable
// @route   POST /api/documents/generate-manual
// @access  Private
export const generateDocumentManual = async (req, res, next) => {
  try {
    const { templateId, values, formats = ['pdf', 'docx'] } = req.body;

    if (!templateId || !values) {
      return next(new AppError('Template ID et valeurs requises', 400));
    }

    // Mapper templateId vers docName
    const templateMap = {
      'contrat-bail': 'Contrat de bail commercial',
      'formulaire-cepici': 'Formulaire unique CEPICI',
      'liste-gerant': 'Liste de Gérant',
      'declaration-honneur': 'Déclaration sur l\'honneur',
      'statuts-sarl': 'Statuts SARL',
      'dsv': 'Déclaration de Souscription et Versement (DSV)'
    };

    const docName = templateMap[templateId] || templateId;

    // Créer un objet company minimal à partir des valeurs
    const company = {
      company_name: values.societe_nom || values.denomination_sociale || '[NOM SOCIÉTÉ]',
      capital: parseFloat(values.capital_social) || 0,
      address: values.adresse_complete || values.adresse_siege || values.siege_social || '[ADRESSE]',
      city: values.ville || values.lieu_signature || 'Abidjan',
      activity: values.activite_principale || values.objet_social || '[ACTIVITÉ]',
      gerant: values.gerant_nom || values.dirigeant_nom || '[NOM GÉRANT]',
      duree_societe: parseInt(values.duree_societe) || 99,
      chiffre_affaires_prev: parseFloat(values.chiffre_affaires) || null
    };

    // Extraire associés si présents
    const associates = [];
    if (values.associe1_nom) {
      associates.push({
        name: values.associe1_nom,
        parts: parseInt(values.associe1_parts) || 100,
        percentage: 100
      });
    }

    // Extraire managers si présents
    const managers = [];
    if (values.gerant_nom || values.dirigeant_nom) {
      managers.push({
        nom: (values.gerant_nom || values.dirigeant_nom || '').split(' ')[0] || '',
        prenoms: (values.gerant_nom || values.dirigeant_nom || '').split(' ').slice(1).join(' ') || '',
        date_naissance: values.gerant_date_naissance || values.dirigeant_date_naissance || null,
        lieu_naissance: values.gerant_lieu_naissance || values.dirigeant_lieu_naissance || null,
        nationalite: values.gerant_nationalite || values.dirigeant_nationalite || null,
        adresse: values.gerant_residence || values.dirigeant_adresse || null,
        profession: values.gerant_profession || null,
        type_identite: values.piece_identite_type || null,
        numero_identite: values.piece_identite_numero || null,
        date_delivrance_id: values.piece_identite_date || null,
        date_validite_id: values.piece_identite_validite || null,
        lieu_delivrance_id: values.piece_identite_emetteur || null,
        duree_mandat: parseInt(values.duree_mandat) || 4
      });
    }

    // Générer le document
    const result = await generateDocument(
      docName,
      company,
      associates,
      managers,
      values, // additionalData pour bail, etc.
      { formats }
    );

    const created = [];

    // Enregistrer PDF si généré
    if (result.pdf) {
      const docType = safeFilePart(docName) || 'document';
      const pdfId = await Document.create({
        userId: req.user.id,
        companyId: null,
        docType: `${docType}_pdf`,
        docName: docName,
        fileName: result.pdf.fileName,
        filePath: result.pdf.filePath,
        mimeType: result.pdf.mimeType
      });

      created.push({
        id: pdfId,
        docType: `${docType}_pdf`,
        docName: docName,
        fileName: result.pdf.fileName,
        format: 'pdf',
        createdAt: new Date().toISOString(),
      });
    }

    // Enregistrer Word si généré
    if (result.docx) {
      const docType = safeFilePart(docName) || 'document';
      const docxId = await Document.create({
        userId: req.user.id,
        companyId: null,
        docType: `${docType}_docx`,
        docName: docName,
        fileName: result.docx.fileName,
        filePath: result.docx.filePath,
        mimeType: result.docx.mimeType
      });

      created.push({
        id: docxId,
        docType: `${docType}_docx`,
        docName: docName,
        fileName: result.docx.fileName,
        format: 'docx',
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Document généré et enregistré',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Prévisualiser des documents (génération temporaire sans sauvegarde en DB)
// @route   POST /api/documents/preview
// @access  Public (pas besoin d'authentification pour prévisualiser)
export const previewDocuments = async (req, res, next) => {
  try {
    const { company, associates = [], managers = [], docs, formats = ['pdf'] } = req.body;

    if (!company || !company.company_name) {
      return next(new AppError('Données d\'entreprise manquantes', 400));
    }

    if (!Array.isArray(docs) || docs.length === 0) {
      return next(new AppError('Liste de documents invalide', 400));
    }

    console.log(`🔍 Prévisualisation: ${docs.length} documents pour "${company.company_name}"`);

    // Générer les documents temporairement (sans sauvegarder en DB)
    const results = await generateMultipleDocuments(
      docs,
      company,
      associates,
      managers,
      req.body.additionalData || {},
      { formats }
    );

    // Retourner les fichiers directement en base64 ou en stream
    const previews = [];
    for (const result of results) {
      if (result.error) {
        console.error(`❌ Erreur génération ${result.docName}:`, result.error);
        previews.push({
          docName: result.docName,
          error: result.error
        });
        continue;
      }

      // Lire le fichier PDF et le convertir en base64
      if (result.pdf && result.pdf.filePath && fs.existsSync(result.pdf.filePath)) {
        const pdfBuffer = fs.readFileSync(result.pdf.filePath);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        previews.push({
          docName: result.docName,
          pdf: {
            data: pdfBase64,
            mimeType: 'application/pdf',
            fileName: result.pdf.fileName
          }
        });

        // Nettoyer le fichier temporaire après lecture
        try {
          fs.unlinkSync(result.pdf.filePath);
        } catch (cleanupError) {
          console.warn(`⚠️ Impossible de supprimer ${result.pdf.filePath}:`, cleanupError);
        }
      }

      // Nettoyer aussi le fichier DOCX s'il existe
      if (result.docx && result.docx.filePath && fs.existsSync(result.docx.filePath)) {
        try {
          fs.unlinkSync(result.docx.filePath);
        } catch (cleanupError) {
          console.warn(`⚠️ Impossible de supprimer ${result.docx.filePath}:`, cleanupError);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Documents générés pour prévisualisation',
      data: previews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir la liste des templates disponibles
// @route   GET /api/documents/templates
// @access  Public
export const getTemplates = async (req, res, next) => {
  try {
    const templates = [
      {
        id: 'statuts-sarl',
        name: 'Statuts SARL',
        description: 'Statuts constitutifs pour une Société à Responsabilité Limitée.',
        category: 'juridique',
        requiredFields: ['societe_nom', 'capital_social', 'activity']
      },
      {
        id: 'contrat-bail',
        name: 'Contrat de Bail Commercial',
        description: 'Contrat de location pour locaux commerciaux avec toutes les clauses légales nécessaires.',
        category: 'commercial',
        requiredFields: ['bailleur_nom', 'societe_nom', 'adresse_complete', 'loyer_mensuel']
      },
      {
        id: 'formulaire-cepici',
        name: 'Formulaire CEPICI',
        description: 'Formulaire unique d\'immatriculation des entreprises (personnes morales) pour le CEPICI.',
        category: 'administratif',
        requiredFields: ['denomination_sociale', 'capital_social', 'activite_principale']
      },
      {
        id: 'liste-gerant',
        name: 'Liste de Gérant',
        description: 'Document de nomination du gérant pour une société SARL.',
        category: 'juridique',
        requiredFields: ['societe_nom', 'gerant_nom']
      },
      {
        id: 'declaration-honneur',
        name: 'Déclaration sur l\'Honneur',
        description: 'Déclaration sur l\'honneur pour le greffe du tribunal de commerce.',
        category: 'juridique',
        requiredFields: ['declarant_nom', 'societe_nom']
      },
      {
        id: 'dsv',
        name: 'Déclaration Souscription/Versement (DSV)',
        description: 'Déclaration de souscription et de versement du capital social.',
        category: 'juridique',
        requiredFields: ['societe_nom', 'capital_social']
      }
    ];

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    next(error);
  }
};
