import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../middleware/errorHandler.js';
import Document from '../models/Document.js';
import Company from '../models/Company.js';
import { generateDocument, generateMultipleDocuments } from '../utils/documentGenerator.js';
import { generateDocumentFromModel, generateMultipleDocumentsFromModels } from '../utils/modelBasedGenerator.js';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

// Ajoute un filigrane diagonal "APERÇU" sur chaque page d'un PDF
const addWatermarkToPdf = async (pdfBuffer) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      // Filigrane diagonal principal "APERÇU"
      page.drawText('APERÇU', {
        x: width / 2 - 130,
        y: height / 2 - 20,
        size: 90,
        font,
        color: rgb(0.82, 0.82, 0.82),
        opacity: 0.45,
        rotate: degrees(45),
      });

      // Sous-texte "PAIEMENT REQUIS"
      page.drawText('PAIEMENT REQUIS', {
        x: width / 2 - 145,
        y: height / 2 - 90,
        size: 32,
        font,
        color: rgb(0.82, 0.82, 0.82),
        opacity: 0.45,
        rotate: degrees(45),
      });
    }

    return Buffer.from(await pdfDoc.save());
  } catch (err) {
    console.warn('⚠️ Impossible d\'ajouter le filigrane:', err.message);
    return pdfBuffer; // Retourner le PDF original en cas d'erreur
  }
};

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

    const { companyId, docs, formats = ['pdf', 'docx'], regenerate = false } = req.body;

    console.log(`🔍 Paramètres extraits: companyId=${companyId}, docs=${docs?.length || 0}, formats=${formats.join(',')}, regenerate=${regenerate}`);

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

      // Si regenerate est true, supprimer les anciens documents de l'entreprise
      if (regenerate) {
        console.log(`🔄 Mode régénération: suppression des anciens documents...`);
        const existingDocs = await Document.findByCompanyId(companyId);
        console.log(`   📋 ${existingDocs.length} documents existants trouvés`);
        
        // Supprimer les fichiers physiques
        for (const doc of existingDocs) {
          if (doc.file_path && fs.existsSync(doc.file_path)) {
            try {
              fs.unlinkSync(doc.file_path);
              console.log(`   🗑️  Fichier supprimé: ${doc.file_path}`);
            } catch (fileError) {
              console.error(`   ⚠️  Erreur suppression fichier ${doc.file_path}:`, fileError);
            }
          }
        }
        
        // Supprimer les documents de la base de données
        const deleted = await Document.deleteByCompanyId(companyId);
        console.log(`   ✅ ${deleted ? existingDocs.length : 0} documents supprimés de la base de données`);
      }

      associates = company.associates || [];
      managers = company.managers || [];
      console.log(`📊 Données récupérées: ${associates.length} associés, ${managers.length} gérants`);
    } else {
      // Si pas de companyId, utiliser les données fournies dans le body
      console.log('⚠️ Pas de companyId fourni, utilisation des données du body');
      company = req.body.company || {};
      associates = req.body.associates || [];
      // Normaliser les managers : mapper camelCase vers snake_case
      managers = (req.body.managers || []).map(m => {
        const normalized = {
          civilite: m.civilite || 'M.',
          nom: m.nom || m.name || '',
          prenoms: m.prenoms || m.firstName || '',
          date_naissance: m.date_naissance || m.dateNaissance || null,
          lieu_naissance: m.lieu_naissance || m.lieuNaissance || '',
          nationalite: m.nationalite || m.nationality || '',
          adresse: m.adresse || m.address || '',
          profession: m.profession || '',
          ville_residence: m.ville_residence || m.villeResidence || '',
          type_identite: m.type_identite || m.typeIdentite || 'CNI',
          numero_identite: m.numero_identite || m.numeroIdentite || '',
          date_delivrance_id: m.date_delivrance_id || m.dateDelivranceId || null,
          date_validite_id: m.date_validite_id || m.dateValiditeId || null,
          lieu_delivrance_id: m.lieu_delivrance_id || m.lieuDelivranceId || '',
          pere_nom: m.pere_nom || m.pereNom || null,
          mere_nom: m.mere_nom || m.mereNom || null,
          duree_mandat: m.duree_mandat || m.dureeMandat || null,
          duree_mandat_annees: m.duree_mandat_annees || m.dureeMandatAnnees || null
        };
        
        // Log pour debug si champs manquants
        const missingFields = [];
        if (!normalized.profession) missingFields.push('profession');
        if (!normalized.nationalite) missingFields.push('nationalite');
        if (!normalized.lieu_naissance) missingFields.push('lieu_naissance');
        if (!normalized.adresse) missingFields.push('adresse');
        if (!normalized.date_validite_id) missingFields.push('date_validite_id');
        
        if (missingFields.length > 0 && m) {
          console.warn(`⚠️ Champs manquants pour manager dans generateDocuments:`, {
            nom: normalized.nom,
            prenoms: normalized.prenoms,
            champsManquants: missingFields,
            rawManager: m
          });
        }
        
        return normalized;
      });
      console.log(`📊 Managers normalisés: ${managers.length} gérants`);
    }

    if (!company || !company.company_name) {
      console.error('❌ Données d\'entreprise manquantes:', company);
      return next(new AppError('Données d\'entreprise manquantes', 400));
    }

    const created = [];

    console.log(`🚀 Début génération de ${docs.length} documents...`);
    
    // Construire les données additionnelles (bailleur, etc.)
    const additionalData = req.body.additionalData || {};
    
    // Si bailleur est fourni dans le body, le convertir au format attendu par les templates
    if (req.body.bailleur) {
      const b = req.body.bailleur;
      additionalData.bailleur_nom = b.nom && b.prenom 
        ? `${b.nom} ${b.prenom}`.trim() 
        : b.nom || '[NOM DU BAILLEUR]';
      additionalData.bailleur_telephone = b.telephone || b.contact || '[TELEPHONE]';
      additionalData.bailleur_contact = b.telephone || b.contact || '[TELEPHONE]';
      additionalData.loyer_mensuel = b.loyerMensuel || 0;
      additionalData.caution_mois = b.cautionMois || 2;
      additionalData.avance_mois = b.avanceMois || 2;
      additionalData.duree_bail = b.dureeBailAnnees || 1;
      additionalData.bailleur_adresse = b.adresse || '[ADRESSE BAILLEUR]';
      
      // Calculer la date de fin du bail si date de début fournie
      if (b.dateDebutBail) {
        additionalData.date_debut = b.dateDebutBail;
        const dateDebut = new Date(b.dateDebutBail);
        const dateFin = new Date(dateDebut);
        dateFin.setFullYear(dateFin.getFullYear() + (b.dureeBailAnnees || 1));
        additionalData.date_fin = dateFin.toISOString().split('T')[0];
      } else if (b.dateFinBail) {
        additionalData.date_fin = b.dateFinBail;
      }
    }
    
    // Ajouter les détails de l'adresse si fournis
    if (req.body.banque) {
      additionalData.banque = req.body.banque;
      company.banque = req.body.banque;
    }
    if (req.body.commune) {
      additionalData.commune = req.body.commune;
      company.commune = req.body.commune;
    }
    if (req.body.quartier) {
      additionalData.quartier = req.body.quartier;
      company.quartier = req.body.quartier;
    }
    if (req.body.lot) {
      additionalData.lot = req.body.lot;
      company.lot = req.body.lot;
    }
    if (req.body.ilot) {
      additionalData.ilot = req.body.ilot;
      company.ilot = req.body.ilot;
    }
    if (req.body.nomImmeuble) {
      additionalData.nomImmeuble = req.body.nomImmeuble;
      company.nomImmeuble = req.body.nomImmeuble;
    }
    if (req.body.numeroEtage) {
      additionalData.numeroEtage = req.body.numeroEtage;
      company.numeroEtage = req.body.numeroEtage;
    }
    if (req.body.numeroPorte) {
      additionalData.numeroPorte = req.body.numeroPorte;
      company.numeroPorte = req.body.numeroPorte;
    }
    if (req.body.section) {
      additionalData.section = req.body.section;
      company.section = req.body.section;
    }
    if (req.body.parcelle) {
      additionalData.parcelle = req.body.parcelle;
      company.parcelle = req.body.parcelle;
    }
    if (req.body.tfNumero) {
      additionalData.tfNumero = req.body.tfNumero;
      company.tfNumero = req.body.tfNumero;
    }
    if (req.body.telephone) {
      additionalData.telephone = req.body.telephone;
      company.telephone = req.body.telephone;
    }
    if (req.body.fax) {
      additionalData.fax = req.body.fax;
      company.fax = req.body.fax;
    }
    if (req.body.adressePostale) {
      additionalData.adressePostale = req.body.adressePostale;
      company.adressePostale = req.body.adressePostale;
    }
    if (req.body.email) {
      additionalData.email = req.body.email;
      company.email = req.body.email;
    }
    if (additionalData.banque && !company.banque) {
      company.banque = additionalData.banque;
    }
    if (additionalData.lot && !company.lot) {
      company.lot = additionalData.lot;
    }
    if (additionalData.ilot && !company.ilot) {
      company.ilot = additionalData.ilot;
    }
    
    // Ajouter les données du déclarant si fournies
    if (req.body.declarant) {
      additionalData.declarant = req.body.declarant;
      console.log(`📋 Déclarant reçu:`, JSON.stringify(req.body.declarant, null, 2));
    }
    
    // Ajouter les projections sur 3 ans si fournies
    if (req.body.projections) {
      additionalData.projections = req.body.projections;
      console.log(`📋 Projections reçues:`, JSON.stringify(req.body.projections, null, 2));
    }
    
    console.log(`📋 Données additionnelles:`, JSON.stringify(additionalData, null, 2));
    
    // Générer tous les documents
    console.log(`🚀 Début génération de ${docs.length} documents avec modèles DOCX...`);
    
    // Utiliser le nouveau système basé sur les modèles
    const results = await generateMultipleDocumentsFromModels(
      docs,
      company,
      associates,
      managers,
      additionalData,
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

    // Mettre à jour le statut de l'entreprise à "completed" si des documents ont été générés
    if (companyId && created.length > 0) {
      try {
        await Company.updateStatus(companyId, 'completed');
        console.log(`✅ Statut de l'entreprise ${companyId} mis à jour: completed`);
      } catch (statusError) {
        console.error(`⚠️ Erreur mise à jour statut entreprise:`, statusError);
        // On continue même si la mise à jour du statut échoue
      }
    }

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

// @desc    Supprimer les documents d'une entreprise
// @route   DELETE /api/documents/company/:companyId
// @access  Private
export const deleteCompanyDocuments = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Vérifier que l'entreprise existe et appartient à l'utilisateur
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new AppError('Entreprise non trouvée', 404));
    }

    if (company.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Accès non autorisé', 403));
    }

    // Récupérer tous les documents de l'entreprise
    const documents = await Document.findByCompanyId(companyId);
    console.log(`🗑️  Suppression de ${documents.length} documents pour l'entreprise ${companyId}`);

    // Supprimer les fichiers physiques
    let deletedFiles = 0;
    for (const doc of documents) {
      if (doc.file_path && fs.existsSync(doc.file_path)) {
        try {
          fs.unlinkSync(doc.file_path);
          deletedFiles++;
          console.log(`   ✅ Fichier supprimé: ${doc.file_path}`);
        } catch (fileError) {
          console.error(`   ⚠️  Erreur suppression fichier ${doc.file_path}:`, fileError);
        }
      }
    }

    // Supprimer les documents de la base de données
    const deleted = await Document.deleteByCompanyId(companyId);

    res.status(200).json({
      success: true,
      message: `${deleted ? documents.length : 0} documents supprimés avec succès`,
      data: {
        deletedCount: deleted ? documents.length : 0,
        deletedFiles
      }
    });
  } catch (error) {
    console.error('❌ Erreur suppression documents:', error);
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
    const { company, associates = [], managers: rawManagers = [], docs, formats = ['pdf'] } = req.body;

    if (!company || !company.company_name) {
      return next(new AppError('Données d\'entreprise manquantes', 400));
    }

    if (!Array.isArray(docs) || docs.length === 0) {
      return next(new AppError('Liste de documents invalide', 400));
    }

    // Normaliser les managers : mapper camelCase vers snake_case
    const managers = (rawManagers || []).map(m => {
      const normalized = {
        civilite: m.civilite || 'M.',
        nom: m.nom || m.name || '',
        prenoms: m.prenoms || m.firstName || m.prenoms || '',
        date_naissance: m.date_naissance || m.dateNaissance || null,
        lieu_naissance: m.lieu_naissance || m.lieuNaissance || '',
        nationalite: m.nationalite || m.nationality || '',
        adresse: m.adresse || m.address || '',
        profession: m.profession || '', // La profession doit être présente
        type_identite: m.type_identite || m.typeIdentite || 'CNI',
        numero_identite: m.numero_identite || m.numeroIdentite || '',
        date_delivrance_id: m.date_delivrance_id || m.dateDelivranceId || null,
        date_validite_id: m.date_validite_id || m.dateValiditeId || null,
        lieu_delivrance_id: m.lieu_delivrance_id || m.lieuDelivranceId || '',
        pere_nom: m.pere_nom || m.pereNom || null,
        mere_nom: m.mere_nom || m.mereNom || null,
        duree_mandat: m.duree_mandat || m.dureeMandat || null,
        duree_mandat_annees: m.duree_mandat_annees || m.dureeMandatAnnees || null
      };
      
      // Log pour debug si champs manquants
      const missingFields = [];
      if (!normalized.profession) missingFields.push('profession');
      if (!normalized.nationalite) missingFields.push('nationalite');
      if (!normalized.lieu_naissance) missingFields.push('lieu_naissance');
      if (!normalized.adresse) missingFields.push('adresse');
      
      if (missingFields.length > 0 && m) {
        console.warn(`⚠️ Champs manquants pour manager:`, {
          nom: normalized.nom,
          prenoms: normalized.prenoms,
          champsManquants: missingFields,
          rawManager: m
        });
      }
      
      return normalized;
    });

    console.log(`🔍 Prévisualisation: ${docs.length} documents pour "${company.company_name}"`);
    console.log(`📋 Managers reçus (raw):`, JSON.stringify(rawManagers, null, 2));
    console.log(`📋 Managers normalisés:`, JSON.stringify(managers, null, 2));
    console.log(`📋 additionalData reçu:`, JSON.stringify(req.body.additionalData || {}, null, 2));

    // Générer les documents temporairement (sans sauvegarder en DB)
    // Utiliser le même générateur que la génération finale (modèles DOCX)
    const results = await generateMultipleDocumentsFromModels(
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

      // Lire le fichier PDF, ajouter le filigrane, puis convertir en base64
      if (result.pdf && result.pdf.filePath && fs.existsSync(result.pdf.filePath)) {
        const rawBuffer = fs.readFileSync(result.pdf.filePath);
        const watermarkedBuffer = await addWatermarkToPdf(rawBuffer);
        const pdfBase64 = watermarkedBuffer.toString('base64');

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
