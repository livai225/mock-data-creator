/**
 * Script de génération du template DOCX de la Déclaration sur l'honneur - Entreprise Individuelle
 * Article 47 OHADA - adaptée pour les exploitants individuels (sans "société")
 *
 * Usage: node backend/scripts/create-declaration-honneur-ei-template.js
 */

import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT = 'Times New Roman';
const FS = 24; // 12pt

const t = (txt, opts = {}) => new TextRun({
  text: txt,
  font: FONT,
  size: FS,
  bold: opts.bold || false,
  underline: opts.underline ? {} : undefined,
});
const b = (txt, opts = {}) => t(txt, { ...opts, bold: true });
const bu = (txt) => t(txt, { bold: true, underline: true });

const para = (children, opts = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  alignment: opts.alignment || AlignmentType.JUSTIFIED,
  spacing: opts.spacing || { after: 120 },
  border: opts.border,
});
const center = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.CENTER });
const left = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.LEFT });
const empty = () => new Paragraph({ children: [new TextRun({ text: '', font: FONT, size: FS })], spacing: { after: 80 } });

const createContent = () => {
  const children = [];

  // Titre
  children.push(center([bu('DECLARATION SUR L\'HONNEUR')], { spacing: { before: 200, after: 60 } }));
  children.push(center([
    t('(Article 47 de l\'Acte Uniforme relatif au Droit commercial général adopté le 15 décembre 2010)')
  ], { spacing: { after: 240 } }));

  // Identité
  children.push(left([b('NOM : '), t('{associe_nom}')], { spacing: { after: 80 } }));
  children.push(left([b('PRENOMS : '), t('{associe_prenoms}')], { spacing: { after: 80 } }));
  children.push(left([b('DE : '), t('{pere_nom}')], { spacing: { after: 80 } }));
  children.push(left([b('Et DE : '), t('{mere_nom}')], { spacing: { after: 80 } }));
  children.push(left([b('DATE DE NAISSANCE : '), t('{associe_date_naissance}')], { spacing: { after: 80 } }));
  children.push(left([b('NATIONALITE : '), t('{associe_nationalite}')], { spacing: { after: 80 } }));
  children.push(left([b('DOMICILE : '), t('{associe_domicile}')], { spacing: { after: 80 } }));
  children.push(left([b('QUALITE : '), t('{qualite}')], { spacing: { after: 200 } }));

  // Corps de la déclaration
  children.push(para([
    t('Déclare, conformément à l\'article 47 de l\'Acte Uniforme relatif au Droit Commercial Général adopté le 15 décembre 2010, au titre du Registre de commerce et du Crédit Mobilier,'),
  ], { spacing: { after: 120 } }));

  // Phrase clé - EI : pas de "société" mentionnée
  children.push(para([
    t('N\'avoir fait l\'objet d\'aucune condamnation pénale, ni de sanction professionnelle ou administrative de nature à m\'interdire '),
    b('l\'exercice d\'une activité commerciale.'),
  ], { spacing: { after: 120 } }));

  children.push(para([
    t('M\'engage dans un délai de 75 jours à compter de l\'immatriculation à fournir mon casier judiciaire ou tout autre document en tenant lieu.'),
  ], { spacing: { after: 120 } }));

  children.push(para([
    t('Je prends acte de ce qu\'à défaut de produire l\'extrait du casier judiciaire ou tout document en tenant lieu dans le délai de soixante-quinze (75) jours, il sera procédé au retrait de mon immatriculation et à ma radiation.'),
  ], { spacing: { after: 200 } }));

  // Lieu et date
  children.push(left([t('Fait à '), t('{ville}'), t(' le : '), t('{date_signature}')], { spacing: { after: 200 } }));

  // Mention lu et approuvé
  children.push(center([t('(Lu et approuvé suivi de la signature)')], { spacing: { after: 60 } }));

  return children;
};

const createDocument = () => {
  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FS },
          paragraph: { spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1418, right: 1134 },
          },
        },
        children: createContent(),
      },
    ],
  });
};

const main = async () => {
  console.log('Création du template DOCX Déclaration sur l\'honneur EI...');

  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(__dirname, '../templates/declaration_honneur_ei_template.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Template créé : ${outputPath}`);

  // Vérification des placeholders
  const { execSync } = await import('child_process');
  try {
    const result = execSync(`python3 -c "
import zipfile, re
with zipfile.ZipFile('${outputPath}', 'r') as z:
    xml = z.read('word/document.xml').decode('utf-8')
placeholders = re.findall(r'\\{[a-z_]+\\}', xml)
print('Placeholders:', sorted(set(placeholders)))
"`, { encoding: 'utf8' });
    console.log(result);
  } catch (e) {
    console.log('(vérification python3 non disponible)');
  }
};

main().catch(console.error);
