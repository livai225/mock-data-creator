/**
 * Script de génération du template DOCX de la DSV (SARL Pluripersonnelle)
 * Conforme au modèle de référence : DSV CARGO SARL
 *
 * Usage: node backend/scripts/create-dsv-pluri-template.js
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
const FONT_SIZE_COVER = 48; // 24pt
const FONT_SIZE_SMALL = 20; // 10pt

const FULL_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
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

const createCoverPage = () => [
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  centerPara([bold('DSV DE LA SOCIETE', { size: FONT_SIZE_COVER })], { spacing: { after: 200 } }),
  centerPara([bold('«{denomination_complete}»', { size: FONT_SIZE_COVER })], { spacing: { after: 200 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

const createContent = () => {
  const children = [];

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
                text('(cf Art 314 de l\'Acte uniforme révisé du 30 janvier 2014, Art 6 de l\'Ordonnance N° 2014-161 du 02 avril 2014 relative à la formes des statuts et au capital social de la société à responsabilité limitée)', { size: FONT_SIZE_SMALL }),
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
  children.push(leftPara([text('L\'An {annee_lettres},')]));
  children.push(emptyPara());
  children.push(leftPara([text('Le {date_constitution},')]));
  children.push(emptyPara());
  children.push(leftPara([text('Les soussignés,')]));
  children.push(emptyPara());

  children.push(para([text('{associes_identites_dsv}')]));

  children.push(emptyPara({ spacing: { after: 200 } }));

  children.push(centerPara([boldUnderline('1- EXPOSE PREALABLE')], { spacing: { before: 240, after: 200 } }));
  children.push(para([text('Par Acte sous seing Privé en date du {date_constitution},')]));
  children.push(para([
    bold('Ont établi, les statuts de la Société à Responsabilité Limitée'),
    text(' devant exister entre eux et tous propriétaires de parts sociales ultérieures, dont les principales caractéristiques sont les suivantes :'),
  ]));

  children.push(leftPara([boldUnderline('1-FORME')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('La société constituée est une société à Responsabilité Limitée régie par les dispositions de l\'Acte uniforme révisé de l\'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d\'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et ses présents statuts.'),
  ]));

  children.push(leftPara([boldUnderline('2- DENOMINATION')], { spacing: { before: 200, after: 120 } }));
  children.push(para([text('La société a pour dénomination : '), bold('{denomination_complete}')]));

  children.push(leftPara([boldUnderline('3- OBJET')], { spacing: { before: 200, after: 120 } }));
  children.push(para([text('La société a pour objet en CÔTE-D\'IVOIRE :')]));
  children.push(para([bold('{objet_social}')]));
  children.push(para([text('Et généralement, toutes opérations industrielles, commerciales, financières, civiles, mobilières ou immobilières pouvant se rattacher directement ou indirectement à l\'objet social ou à tous objets similaires ou connexes ou susceptibles d\'en faciliter l\'extension ou le développement.') ]));
  children.push(para([text('En outre, la Société peut également participer par tous moyens, directement ou indirectement, dans toutes opérations pouvant se rattacher à son objet.') ]));
  children.push(para([text('- l\'acquisition, la location et la vente de tous biens meubles et immeubles.') ]));
  children.push(para([text('- l\'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.') ]));
  children.push(para([text('- la prise en location gérance de tous fonds de commerce.') ]));
  children.push(para([text('- la prise de participation dans toute société existante ou devant être créée') ]));
  children.push(para([text('- et généralement, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, se rapportant directement ou indirectement à l\'objet social ou pouvant en faciliter l\'extension ou le développement.') ]));

  children.push(leftPara([boldUnderline('4- SIEGE SOCIAL')], { spacing: { before: 200, after: 120 } }));
  children.push(para([text('Le siège social est fixé à : '), bold('{siege_social_complet}')]));

  children.push(leftPara([boldUnderline('5- DUREE')], { spacing: { before: 200, after: 120 } }));
  children.push(para([text('La durée de la société est de {duree_societe_lettres} ({duree_societe}) années, sauf dissolution anticipée ou prorogation.')]));

  children.push(leftPara([boldUnderline('6- CAPITAL SOCIAL')], { spacing: { before: 200, after: 120 } }));
  children.push(para([
    text('Le capital social est fixé à la somme de '),
    bold('{capital_lettres_min} Franc CFA'),
    text(' (F CFA {capital_formatte}) divisé en {nombre_parts} parts sociales de F CFA {valeur_part_formatte}'),
  ]));

  children.push(emptyPara({ spacing: { after: 200 } }));

  children.push(leftPara([
    boldUnderline('II- CONSTATATION DE LA LIBERATION ET DU DEPOT DES FONDS PROVENANT DES PARTS SOCIALES'),
  ], { spacing: { before: 240, after: 200 } }));

  children.push(para([
    text('Les soussignées déclarent, que les souscriptions et les versements des fonds provenant de la libération des parts sociales ont été effectués comme suit :'),
  ]));

  children.push(emptyPara());

  children.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [leftPara([boldUnderline('Identité des associés et leur domicile')], { spacing: { after: 60 } })], borders: FULL_BORDER, width: { size: 32, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [leftPara([boldUnderline('Nombre de parts Souscrites')], { spacing: { after: 60 } })], borders: FULL_BORDER, width: { size: 22, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [leftPara([boldUnderline('Montant nominal')], { spacing: { after: 60 } })], borders: FULL_BORDER, width: { size: 14, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [leftPara([boldUnderline('Montant total souscrit'), text(' F CFA')], { spacing: { after: 60 } })], borders: FULL_BORDER, width: { size: 16, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [leftPara([boldUnderline('Versement effectué'), text(' F CFA')], { spacing: { after: 60 } })], borders: FULL_BORDER, width: { size: 16, type: WidthType.PERCENTAGE } }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [leftPara([text('{tableau_dsv_identites}')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('{tableau_dsv_parts}')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('{tableau_dsv_nominal}')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('{tableau_dsv_total_souscrit}')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('{tableau_dsv_versement}')])], borders: FULL_BORDER }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [leftPara([bold('TOTAL')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([bold('{tableau_dsv_total_parts} parts')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([bold('{valeur_part_formatte} FCFA')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([bold('{capital_formatte} CFA')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([bold('{capital_formatte} CFA')])], borders: FULL_BORDER }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  children.push(emptyPara({ spacing: { after: 200 } }));

  children.push(para([
    text('La somme correspondante à l\'ensemble des souscriptions et versements effectué à ce jour, de {capital_lettres_min} ({capital_formatte} FCFA) a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à '),
    bold('{banque}'),
  ]));

  children.push(emptyPara());
  children.push(para([text('En Foi de quoi, ils ont dressé la présente, pour servir et valoir ce que de droit', { bold: true, italics: true })]));
  children.push(emptyPara({ spacing: { after: 300 } }));

  children.push(new Paragraph({
    children: [text('Fait à {ville}, le {date_constitution}')],
    alignment: AlignmentType.RIGHT,
    spacing: { after: 120 },
  }));
  children.push(new Paragraph({
    children: [text('En deux (2) exemplaires originaux')],
    alignment: AlignmentType.LEFT,
    spacing: { after: 180 },
  }));

  children.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [centerPara([bold('NOMS DES ASSOCIES')])], borders: FULL_BORDER, width: { size: 60, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [centerPara([bold('SIGNATURES')])], borders: FULL_BORDER, width: { size: 40, type: WidthType.PERCENTAGE } }),
        ],
      }),
      new TableRow({
        height: { value: 1200, rule: 'atLeast' },
        children: [
          new TableCell({ children: [leftPara([text('{tableau_signatures_noms}')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('')])], borders: FULL_BORDER }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  return children;
};

const createDocument = () => new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: FONT_SIZE },
        paragraph: { spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED },
      },
    },
  },
  sections: [
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
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.79),
            bottom: convertInchesToTwip(0.79),
            left: convertInchesToTwip(0.59),
            right: convertInchesToTwip(0.59),
          },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: FONT_SIZE })],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      },
      children: createContent(),
    },
  ],
});

const main = async () => {
  console.log('Création du template DOCX de la DSV SARL Pluripersonnelle...');

  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(__dirname, '../templates/dsv_sarl_pluri_template.docx');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Template généré: ${outputPath}`);
  console.log(`Taille: ${(buffer.length / 1024).toFixed(1)} Ko`);
};

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
