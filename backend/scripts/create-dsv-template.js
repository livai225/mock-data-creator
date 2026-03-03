/**
 * Script de génération du template DOCX de la DSV (Déclaration de Souscription et de Versement)
 * Conforme au modèle de référence : 4 pages (couverture + 3 pages numérotées)
 *
 * Usage: node backend/scripts/create-dsv-template.js
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, PageBreak, Footer,
  PageNumber, NumberFormat, convertInchesToTwip,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT = 'Times New Roman';
const FONT_SIZE = 24; // 12pt
const FONT_SIZE_LARGE = 28; // 14pt
const FONT_SIZE_TITLE = 36; // 18pt
const FONT_SIZE_COVER = 48; // 24pt
const FONT_SIZE_SMALL = 20; // 10pt

const FULL_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

const NO_BORDER = {
  top: { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
};

const text = (t, opts = {}) => new TextRun({
  text: t,
  font: FONT,
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
  spacing: opts.spacing || { after: 120 },
  indent: opts.indent,
});

const centerPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.CENTER });
const leftPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.LEFT });

const emptyPara = (opts = {}) => new Paragraph({
  children: [new TextRun({ text: '', font: FONT, size: opts.size || FONT_SIZE })],
  spacing: opts.spacing || { after: 120 },
});

// ============================================================
// PAGE DE GARDE
// ============================================================

const createCoverPage = () => [
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  centerPara([
    bold('DSV DE LA SOCIETE', { size: FONT_SIZE_COVER }),
  ], { spacing: { after: 200 } }),
  centerPara([
    bold('«{denomination_complete}»', { size: FONT_SIZE_COVER }),
  ], { spacing: { after: 200 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============================================================
// CONTENU PRINCIPAL
// ============================================================

const createContent = () => {
  const children = [];

  // Encadré titre DSV
  children.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              centerPara([
                bold('DECLARATION DE SOUSCRIPTION ET DE VERSEMENT', { size: FONT_SIZE_LARGE }),
              ], { spacing: { after: 120 } }),
              centerPara([
                bold('( cf Art 314 de l\' Acte uniforme révisé du 30 janvier 2014, Art 6 de l\'Ordonnance N° 2014- 161- du 02 avril 2014 relative à la formes des statuts et au capital social de la société à responsabilité limitée)', { size: FONT_SIZE_SMALL }),
              ], { spacing: { after: 60 } }),
            ],
            borders: FULL_BORDER,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  children.push(emptyPara({ spacing: { after: 120 } }));

  // Date
  children.push(leftPara([text('L\'An {annee_lettres},')]));
  children.push(emptyPara());
  children.push(leftPara([text('Le  {date_constitution}')]));
  children.push(leftPara([text('Le  soussigné,')]));
  children.push(emptyPara());

  // Identité associé
  children.push(para([
    text('M. '),
    bold('{associe_nom_complet}'),
    text(',  {associe_profession}, résident à {associe_ville_residence} de nationalité {associe_nationalite} née le {associe_date_naissance} à {associe_lieu_naissance} et titulaire de la {type_identite} {numero_identite} délivré le {date_delivrance_id} et valable {date_validite_id} par {lieu_delivrance_id}.'),
  ]));

  children.push(emptyPara({ spacing: { after: 200 } }));

  // I- EXPOSE PREALABLE
  children.push(centerPara([
    bold('I-  EXPOSE PREALABLE', { size: FONT_SIZE }),
  ], { spacing: { before: 240, after: 200 } }));

  children.push(para([
    text('   Par Acte sous seing Privé en date du {date_constitution},'),
  ]));
  children.push(para([
    bold('Ont établi, les statuts de la Société à Responsabilité Limitée'),
    text(' devant exister entre eux et tous propriétaires de parts sociales ultérieures, dont les principales caractéristiques sont les suivantes :'),
  ]));

  // 1- FORME
  children.push(leftPara([boldUnderline('1-FORME')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('La société constituée est une société à Responsabilité Limitée régie par les dispositions de l\'Acte uniforme révisé de l\'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d\'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et ses présents statuts.'),
  ]));

  // 2- DENOMINATION
  children.push(leftPara([boldUnderline('2- DENOMINATION')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('La société a pour dénomination : '),
    bold('{denomination_complete}'),
  ]));

  // 3- OBJET
  children.push(leftPara([boldUnderline('3- OBJET')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('La société a pour objet en  CÔTE-D\'IVOIRE :'),
  ]));
  children.push(para([bold('{objet_social}')]));
  children.push(para([
    text('Et généralement, toutes opérations industrielles, commerciales, financières, civiles, mobilières ou immobilières pouvant se rattacher directement ou indirectement à l\'objet social ou à tous objets similaires ou connexes ou susceptibles d\'en faciliter l\'extension ou le développement.'),
  ]));
  children.push(para([
    text('En outre, la Société peut également participer par tous moyens, directement ou indirectement, dans toutes opérations pouvant se rattacher à son objet.'),
  ]));
  children.push(para([
    text('- l\'acquisition, la location et la vente de tous biens meubles et immeubles.'),
  ]));
  children.push(para([
    text('- l\'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.'),
  ]));
  children.push(para([
    text('- la prise en location gérance de tous fonds de commerce.'),
  ]));
  children.push(para([
    text('- la prise de participation dans toute société existante ou devant être créée'),
  ]));
  children.push(para([
    text('- et généralement, toute opérations financières, commerciales, industrielles, mobilières et immobilière, se rapportant directement ou indirectement à l\'objet social ou pouvant en faciliter l\'extension ou le développement.'),
  ]));

  // 4- SIEGE SOCIAL
  children.push(leftPara([boldUnderline('4- SIEGE SOCIAL')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('Le siège social est fixé à : '),
    bold('{siege_social_complet}'),
  ]));

  // 5- DUREE
  children.push(leftPara([boldUnderline('5- DUREE')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('La durée de la société est de {duree_societe_lettres} ({duree_societe}) années, sauf dissolution anticipée ou prorogation.'),
  ]));

  // 6- CAPITAL SOCIAL
  children.push(leftPara([bold('6- CAPITAL SOCIAL')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('Le capital social est fixé à la somme de '),
    bold('{capital_lettres} Franc CFA'),
    text('  (F CFA {capital_formatte}) divisé en  {nombre_parts} parts sociales de F CFA {valeur_part_formatte}'),
  ]));

  children.push(emptyPara({ spacing: { after: 200 } }));

  // II- CONSTATATION DE LA LIBERATION...
  children.push(leftPara([
    boldUnderline('II- CONSTATATION DE LA LIBERATION ET DU DEPOT DES FONDS PROVENANT DES PARTS SOCIALES'),
  ], { spacing: { before: 240, after: 200 } }));

  children.push(para([
    text('   Les soussignées déclarent, que les souscriptions et les versements des fonds provenant de la libération des parts sociales ont été effectués comme suit :'),
  ]));

  children.push(emptyPara());

  // Tableau principal DSV - 5 colonnes
  children.push(new Table({
    rows: [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [leftPara([boldUnderline('Identité des associés et leur domicile')], { spacing: { after: 60 } })],
            borders: FULL_BORDER,
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [leftPara([boldUnderline('Nombre de parts Souscrites')], { spacing: { after: 60 } })],
            borders: FULL_BORDER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [leftPara([boldUnderline('Montant nominal')], { spacing: { after: 60 } })],
            borders: FULL_BORDER,
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [leftPara([boldUnderline('Montant total souscrit'), text(' F CFA', { underline: false })], { spacing: { after: 60 } })],
            borders: FULL_BORDER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [leftPara([boldUnderline('Versement effectué'), text(' F CFA', { underline: false })], { spacing: { after: 60 } })],
            borders: FULL_BORDER,
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      // Data row
      new TableRow({
        children: [
          new TableCell({
            children: [leftPara([text('M. {associe_nom_complet}')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([text('{nombre_parts} parts numérotés de 1 à {nombre_parts} inclus')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([text('{valeur_part_formatte}  FCFA')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([text('{capital_formatte} CFA')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([text('{capital_formatte} CFA')])],
            borders: FULL_BORDER,
          }),
        ],
      }),
      // TOTAL row
      new TableRow({
        children: [
          new TableCell({
            children: [leftPara([bold('TOTAL')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([bold('{nombre_parts} parts')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([bold('{valeur_part_formatte}  FCFA')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([bold('{capital_formatte} CFA')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([bold('{capital_formatte} CFA')])],
            borders: FULL_BORDER,
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  children.push(emptyPara({ spacing: { after: 200 } }));

  // Somme correspondante
  children.push(para([
    text('La somme correspondante à l\'ensemble des souscriptions et versements effectué à ce jour, de {capital_lettres_min} ({capital_formatte} FCFA)    a été déposée pour le compte de la société et conformément à la loi,  dans un compte  ouvert à  '),
    bold('{banque}'),
  ]));

  children.push(emptyPara());

  // En Foi de quoi
  children.push(para([
    bold('En Foi de quoi, ils ont dressé la présente, pour servir et valoir ce que de droit'),
  ]));

  // Signature — tout le bloc sur la même page (keepNext empêche la coupure)
  children.push(new Paragraph({
    children: [text('Fait  à  A {ville} le   {date_constitution}')],
    alignment: AlignmentType.RIGHT,
    spacing: { before: 200, after: 120 },
    indent: { left: 4000 },
    keepNext: true,
  }));
  children.push(new Paragraph({
    children: [text('En  Deux (2)  exemplaires originaux')],
    alignment: AlignmentType.RIGHT,
    spacing: { after: 240 },
    indent: { left: 4000 },
    keepNext: true,
  }));

  // Associé unique
  children.push(new Paragraph({
    children: [bold('L\'associé Unique')],
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    keepNext: true,
  }));

  children.push(new Paragraph({
    children: [bold('M. {associe_nom_complet}')],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
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
          paragraph: { spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED },
        },
      },
    },
    sections: [
      // Couverture (sans numéro de page)
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.79),
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.59),
              right: convertInchesToTwip(0.59),
            },
          },
        },
        children: createCoverPage(),
      },
      // Contenu principal (avec numéros de page)
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.79),
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.59),
              right: convertInchesToTwip(0.59),
            },
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT,
                    size: FONT_SIZE,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
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
  console.log('🔧 Création du template DOCX de la DSV SARLU...');

  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(__dirname, '../templates/dsv_sarlu_template.docx');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ Template généré: ${outputPath}`);
  console.log(`   Taille: ${(buffer.length / 1024).toFixed(1)} Ko`);
};

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
