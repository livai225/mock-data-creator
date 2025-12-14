import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { AppError } from '../middleware/errorHandler.js';
import Document from '../models/Document.js';

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

const generateSimplePdf = async ({ title, subtitle }) => {
  ensureGeneratedDir();

  const fileName = `${safeFilePart(title)}_${Date.now()}.pdf`;
  const filePath = path.join(GENERATED_DIR, fileName);

  await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown();
      if (subtitle) {
        doc.fontSize(12).font('Helvetica').text(subtitle, { align: 'center' });
        doc.moveDown(2);
      }

      doc.fontSize(11).font('Helvetica').text(
        "Document généré par ARCH EXCELLENCE.\n\nCe fichier est un modèle généré automatiquement.\nVérifie son contenu avant utilisation.",
        { align: 'left' }
      );

      doc.end();

      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (e) {
      reject(e);
    }
  });

  return { fileName, filePath };
};

// @desc    Générer et enregistrer les documents (PDF)
// @route   POST /api/documents/generate
// @access  Private
export const generateDocuments = async (req, res, next) => {
  try {
    const { companyTypeName, docs } = req.body;

    if (!Array.isArray(docs) || docs.length === 0) {
      return next(new AppError('Liste de documents invalide', 400));
    }

    const created = [];

    for (const docName of docs) {
      const pdf = await generateSimplePdf({
        title: docName,
        subtitle: companyTypeName ? `Entreprise: ${companyTypeName}` : undefined,
      });

      const docType = safeFilePart(docName) || 'document';

      const id = await Document.create({
        userId: req.user.id,
        companyId: null,
        docType,
        docName,
        fileName: pdf.fileName,
        filePath: pdf.filePath,
        mimeType: 'application/pdf'
      });

      created.push({
        id,
        docType,
        docName,
        fileName: pdf.fileName,
        createdAt: new Date().toISOString(),
      });
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
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
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
