/**
 * Script de génération du template DOCX du Contrat de Bail - Entreprise Individuelle
 * Conforme au modèle de référence (2 pages, police Goudy Old Style 11pt)
 *
 * Usage: node backend/scripts/create-contrat-bail-ei-template.js
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT = 'Goudy Old Style';
const FONT_SIZE = 22; // 11pt
const FONT_SIZE_TITLE = 56; // 28pt

const TRIPLE_BORDER = {
  top: { style: BorderStyle.TRIPLE, size: 4, color: 'auto', space: 4 },
  bottom: { style: BorderStyle.TRIPLE, size: 4, color: 'auto', space: 1 },
  left: { style: BorderStyle.TRIPLE, size: 4, color: 'auto', space: 4 },
  right: { style: BorderStyle.TRIPLE, size: 4, color: 'auto', space: 4 },
};

const text = (t, opts = {}) => new TextRun({
  text: t,
  font: opts.font || FONT,
  size: opts.size || FONT_SIZE,
  bold: opts.bold || false,
  italics: opts.italics || false,
  underline: opts.underline ? {} : undefined,
  break: opts.break,
});

const bold = (t, opts = {}) => text(t, { ...opts, bold: true });
const boldUnderline = (t, opts = {}) => text(t, { ...opts, bold: true, underline: true });

const para = (children, opts = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  alignment: opts.alignment || AlignmentType.JUSTIFIED,
  spacing: opts.spacing || { after: 80 },
  indent: opts.indent,
  border: opts.border,
});

const centerPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.CENTER });
const leftPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.LEFT });

const emptyPara = (opts = {}) => new Paragraph({
  children: [new TextRun({ text: '', font: FONT, size: opts.size || FONT_SIZE })],
  spacing: opts.spacing || { after: 60 },
});

const articleTitle = (num, title) => new Paragraph({
  children: [
    boldUnderline(`Article ${num}`),
    boldUnderline(` : ${title}`),
  ],
  alignment: AlignmentType.LEFT,
  spacing: { before: 160, after: 80 },
  indent: { left: 360 },
});

// ============================================================
// DOCUMENT CONTENT
// ============================================================

const createContent = () => {
  const children = [];

  // Titre encadré
  children.push(new Paragraph({
    children: [text('   ', { size: FONT_SIZE_TITLE }), bold('CONTRAT DE BAIL', { size: FONT_SIZE_TITLE })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 0 },
    border: TRIPLE_BORDER,
  }));
  children.push(new Paragraph({
    children: [bold('COMMERCIAL', { size: FONT_SIZE_TITLE })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    border: TRIPLE_BORDER,
  }));

  // Parties
  children.push(leftPara([bold('Entre les soussignés :')], { spacing: { before: 120, after: 80 } }));

  // Bailleur
  children.push(para([
    bold('{bailleur_nom_complet}'),
    text(', Téléphone : '),
    text('{bailleur_telephone}'),
    text(' Propriétaire, ci-après dénommé  « le bailleur »'),
  ]));
  children.push(centerPara([bold('D\'une part')], { spacing: { after: 40 } }));
  children.push(centerPara([bold('Et ')], { spacing: { after: 40 } }));

  // Preneur EI
  children.push(para([
    text('L\'entreprise individuelle dénommée  '),
    bold('{preneur_ei_description}'),
    text(' locataire ci-après dénommé « le preneur »'),
  ]));
  children.push(centerPara([bold('D\'autre part.')], { spacing: { after: 80 } }));

  children.push(para([bold('Il a été dit et convenu ce qui suit :')], { spacing: { before: 120, after: 80 } }));

  children.push(para([
    text('Le bailleur loue et donne par les présentes au preneur, qui accepte, les locaux ci-après désignés sis à '),
    bold('{siege_social_complet}'),
    text(' en vue de l\'exploitation de l\'entreprise '),
    bold('{objet_exploitation_ei}'),
    text('.'),
  ]));

  // Article 1
  children.push(articleTitle('1', 'Désignation'));
  children.push(para([
    text('Il est précisé que l\'emplacement est livré nu, et que le preneur devra supporter le cout et les frais d\'eaux, d\'électricité, téléphone et en général, tous travaux d\'aménagements.'),
  ]));
  children.push(para([
    text('Tel au surplus que le cout se poursuit et se comporte sans plus ample description, le preneur déclarant avoir vu. Visite et parfaitement connaitre les locaux loués, qu\'il consent à occuper dans leur état actuel'),
  ]));

  // Article 2
  children.push(articleTitle('2', 'Durée'));
  children.push(para([
    text('Le présent bail est conclu pour une durée de '),
    bold('{duree_bail_lettres} ({duree_bail}) an(s)'),
    text(' allant du '),
    bold('{date_debut_bail}'),
    text(' au '),
    bold('{date_fin_bail}'),
    text(' à son expiration, le bail se renouvellera par tacite reconduction, sauf dénonciation par acte extra judiciaire, au plus tard TROIS (03) mois avant la date d\'expiration de la période triennale concernée.'),
  ]));

  // Article 3
  children.push(articleTitle('3', 'Renouvellement et cession'));
  children.push(para([
    text('- Le preneur qui a droit au renouvellement de son bail, doit demander le renouvellement de celui-ci au bailleur, par écrit, au plus tard deux (2) mois avant la date d\'expiration du bail.'),
  ]));
  children.push(para([
    text('- Le preneur qui n\'a pas formé sa demande de renouvellement dans ce délai est déchu du droit de renouvellement du bail.'),
  ]));
  children.push(para([
    text('Le BAILLEUR qui n\'a pas fait connaître sa réponse à la demande de renouvellement au plus tard UN (01) mois avant l\'expiration du bail est réputé avoir accepté le principe du renouvellement de ce bail.'),
  ]));
  children.push(para([
    text('La partie qui entend résilier le bail doit donner congés, par acte extra judiciaire au moins SIX (06) mois à l\'avance.'),
  ]));

  // Article 4
  children.push(articleTitle('4', 'Obligation du bailleur'));
  children.push(para([
    text('- Le bailleur fait procéder, à ses frais dans les locaux donnés à bail, à toutes les grosses réparations devenues nécessaires et urgentes.'),
  ]));
  children.push(para([text('Le bailleur délivre les locaux en bon état.')]));
  children.push(para([
    text('- Le bailleur autorise le preneur à apposer sur les façades extérieures des locaux les enseignes et plaques indicatrices relatives à son commerce.'),
  ]));

  // Article 5
  children.push(articleTitle('5', 'Obligation du preneur'));
  children.push(para([
    text('- Le preneur doit payer le loyer aux termes convenus, entre les mains du bailleur.'),
  ]));
  children.push(para([
    text('- Le preneur est tenu d\'exploiter les locaux donnés à bail, en bon père de famille, et conformément à la destination prévue au bail, à défaut de convention écrite, suivant celle présumée d\'après les circonstances.'),
  ]));
  children.push(para([
    text('-Le preneur est tenu des réparations d\'entretien ; il répond des dégradations ou des pertes dues à un défaut d\'entretien en cours de bail.'),
  ]));

  // Article 6
  children.push(articleTitle('6', 'Loyer'));
  children.push(para([
    text('La présente location est consentie et acceptée moyennant un loyer mensuel de {loyer_lettres} ({loyer_formatte}) francs CFA, payable à la fin du mois au plus tard le cinq (05) du mois suivant. De plus une garantie de '),
    bold('{garantie_lettres}'),
    text(' ({garantie_formatte} FCFA) dont  {caution_mois} ({caution_mois_chiffre}) mois de caution et {avance_mois} ({avance_mois_chiffre}) mois d\'avance.'),
  ]));
  children.push(para([
    text('Les parties conviennent que le prix fixé ci-dessus ne peut être révisé au cours du bail.'),
  ]));
  children.push(para([
    text('Dans le cas où il surviendrait une contestation sur le montant du loyer tel qu\'il est défini par le présent bail, le preneur devra aviser le bailleur qui s\'engage à s\'en remettre à une expertise amiable.'),
  ]));

  // Article 7
  children.push(articleTitle('7', 'Sous-location'));
  children.push(para([
    text('Sauf stipulation contraire du bail, toute sous-location totale ou partielle est interdite.'),
  ]));

  // Article 8
  children.push(articleTitle('8', 'Clause résolutoire.'));
  children.push(para([
    text('A défaut de paiement d\'un seul terme de loyer ou en cas d\'inexécution d\'une clause du bail, le bailleur pourra demander à la juridiction compétente la résiliation du bail et l\'expulsion du preneur, et de tous occupants de son chef, après avoir fait délivrer, par acte extrajudiciaire, une mise en demeure d\'avoir à respecter les clauses et conditions du bail.'),
  ]));

  // Article 9
  children.push(articleTitle('9', 'Election de domicile'));
  children.push(para([
    text('En cas de litige, si aucun accord amiable n\'est trouvé, le tribunal d\'{ville} sera seul compétent.'),
  ]));

  // Signature
  children.push(emptyPara({ spacing: { after: 80 } }));
  children.push(para([text('Fait en deux  exemplaires et de bonne foi.')]));
  children.push(leftPara([text('A  {ville}, le {date_signature}')]));
  children.push(emptyPara({ spacing: { after: 80 } }));

  // Bailleur / Preneur côte à côte
  children.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [leftPara([boldUnderline('Le Bailleur')])],
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            },
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [leftPara([boldUnderline('Le Preneur')])],
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            },
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  return children;
};

// ============================================================
// DOCUMENT
// ============================================================

const createDocument = () => {
  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE },
          paragraph: { spacing: { after: 80 }, alignment: AlignmentType.JUSTIFIED },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1418,
              right: 851,
            },
          },
        },
        children: createContent(),
      },
    ],
  });
};

// ============================================================
// MAIN
// ============================================================

const main = async () => {
  console.log('Création du template DOCX du Contrat de Bail EI...');

  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(__dirname, '../templates/contrat_bail_ei_template.docx');
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
