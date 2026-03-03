/**
 * Script de génération du template DOCX des Statuts SARLU
 *
 * Utilise le package `docx` pour créer un template .docx avec le formatage
 * conforme au modèle officiel OHADA, avec des placeholders {xxx} pour docxtemplater.
 *
 * Usage: node backend/scripts/create-statuts-template.js
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, PageBreak, Header, Footer,
  PageNumber, NumberFormat, HeadingLevel, TableLayoutType,
  ShadingType, VerticalAlign, convertInchesToTwip,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// HELPERS
// ============================================================

const FONT = 'Times New Roman';
const FONT_SIZE = 24; // half-points (12pt = 24)
const FONT_SIZE_SMALL = 20; // 10pt
const FONT_SIZE_LARGE = 28; // 14pt
const FONT_SIZE_TITLE = 36; // 18pt
const FONT_SIZE_COVER = 48; // 24pt

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

/** Normal text run */
const text = (t, opts = {}) => new TextRun({
  text: t,
  font: FONT,
  size: opts.size || FONT_SIZE,
  bold: opts.bold || false,
  italics: opts.italics || false,
  underline: opts.underline ? {} : undefined,
  break: opts.break,
});

/** Bold text run */
const bold = (t, opts = {}) => text(t, { ...opts, bold: true });

/** Bold + underline text run */
const boldUnderline = (t, opts = {}) => text(t, { ...opts, bold: true, underline: true });

/** Justified paragraph */
const para = (children, opts = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  alignment: opts.alignment || AlignmentType.JUSTIFIED,
  spacing: opts.spacing || { after: 120 },
  indent: opts.indent,
});

/** Centered paragraph */
const centerPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.CENTER });

/** Left-aligned paragraph */
const leftPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.LEFT });

/** Empty paragraph (spacer) */
const emptyPara = (opts = {}) => new Paragraph({
  children: [new TextRun({ text: '', font: FONT, size: opts.size || FONT_SIZE })],
  spacing: opts.spacing || { after: 120 },
});

/** Article title (bold + underline, left-aligned) */
const articleTitle = (num, title) => new Paragraph({
  children: [boldUnderline(`ARTICLE ${num}- ${title}`)],
  alignment: AlignmentType.LEFT,
  spacing: { before: 240, after: 120 },
});

/** Article title with colon separator */
const articleTitleColon = (num, title) => new Paragraph({
  children: [boldUnderline(`ARTICLE ${num} : ${title}`)],
  alignment: AlignmentType.LEFT,
  spacing: { before: 240, after: 120 },
});

/** Section title (TITRE I, TITRE II - centered, bold) */
const sectionTitle = (t) => new Paragraph({
  children: [bold(t, { size: FONT_SIZE_LARGE })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 360, after: 240 },
});

// ============================================================
// PAGE DE GARDE
// ============================================================

const createCoverPage = () => [
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  emptyPara({ spacing: { after: 600 } }),
  // Titre principal
  centerPara([
    bold('LES STATUTS DE LA SOCIETE', { size: FONT_SIZE_COVER }),
  ], { spacing: { after: 200 } }),
  centerPara([
    bold('« {denomination_complete} »', { size: FONT_SIZE_COVER }),
  ], { spacing: { after: 200 } }),
  // Page break
  new Paragraph({
    children: [new PageBreak()],
  }),
];

// ============================================================
// PAGE D'INTRODUCTION (cadre OHADA + notes)
// ============================================================

const createIntroPage = () => {
  // Encadré OHADA - utilisation d'un tableau avec bordures
  const ohadaTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              centerPara([
                bold('Modèle Type utilisable et adaptable, conforme aux dispositions en vigueur de l\'Acte uniforme révisé de l\'OHADA du 30 janvier 2014 relatif au Droit des Sociétés commerciales et du Groupement d\'Intérêt Economique', { size: FONT_SIZE }),
              ], { spacing: { after: 120 } }),
              centerPara([
                bold('STATUT TYPE SOUS SEING PRIVE', { size: FONT_SIZE }),
              ], { spacing: { after: 120 } }),
              centerPara([
                bold('Cas d\'une Société à Responsabilité Limitée comportant un seul associé et constituée exclusivement par apports en numéraire', { size: FONT_SIZE }),
              ], { spacing: { after: 60 } }),
            ],
            borders: FULL_BORDER,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  return [
    emptyPara({ spacing: { after: 200 } }),
    ohadaTable,
    emptyPara({ spacing: { after: 200 } }),
    // N.B : Indications d'utilisation
    leftPara([
      boldUnderline('N.B : Indications d\'utilisation', { size: FONT_SIZE }),
    ]),
    para([
      text('Ce cas de figure courant a été conçu pour faciliter et encadrer le processus de création d\'entreprise pour une meilleure sécurisation des opérateurs économiques.'),
    ]),
    emptyPara(),
    para([
      text('1. les espaces en pointillé sont des champs à remplir et à adapter à partir des informations décrites dans les parenthèses qui suivent ;'),
    ], { indent: { left: 360 } }),
    emptyPara(),
    para([
      text('2. établir les statuts en nombre suffisant pour la remise d\'un exemplaire original à chaque associé, le dépôt d\'un exemplaire au siège social, et l\'accomplissement des formalités de constitution.'),
    ], { indent: { left: 360 } }),
    emptyPara({ spacing: { after: 600 } }),
    // Titre centré
    centerPara([
      bold('SARL unipersonnelle constituée exclusivement', { size: FONT_SIZE_LARGE }),
    ], { spacing: { after: 60 } }),
    centerPara([
      bold('par apports en numéraire', { size: FONT_SIZE_LARGE }),
    ], { spacing: { after: 200 } }),
    // Page break
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
};

// ============================================================
// EN-TÊTE ENCADRÉ (page 2)
// ============================================================

const createHeaderBox = () => {
  const headerTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              centerPara([
                bold('STATUTS DE LA SOCIETE A RESPONSABILITE LIMITEE DENOMMEE', { size: FONT_SIZE }),
              ], { spacing: { after: 60 } }),
              centerPara([
                bold('«{denomination_complete}', { size: FONT_SIZE }),
              ], { spacing: { after: 120 } }),
              centerPara([
                bold('AYANT SON SIEGE SOCIAL A {ville}', { size: FONT_SIZE }),
              ], { spacing: { after: 60 } }),
              centerPara([
                bold('{siege_social_complet}', { size: FONT_SIZE }),
              ], { spacing: { after: 60 } }),
            ],
            borders: FULL_BORDER,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  return [
    headerTable,
    emptyPara({ spacing: { after: 200 } }),
    // Date
    leftPara([text('L\'An {annee_lettres},')]),
    emptyPara(),
    leftPara([text('Le {date_constitution}')]),
    emptyPara(),
    // Identité associé
    para([
      text('M. '),
      bold('{associe_nom_complet}'),
      text(', {associe_profession}, résident à {associe_ville_residence} de nationalité {associe_nationalite} née le {associe_date_naissance} à {associe_lieu_naissance} et titulaire de la {type_identite} {numero_identite} délivré le {date_delivrance_id} et valable {date_validite_id} par {lieu_delivrance_id}.'),
    ]),
    emptyPara({ spacing: { after: 200 } }),
    // Préambule
    leftPara([text('Le soussigné,')]),
    para([
      bold('A établi par les présentes, les statuts de la Société à Responsabilité Limitée dont la teneur suit :'),
    ]),
    emptyPara(),
  ];
};

// ============================================================
// ARTICLES
// ============================================================

const createArticles = () => {
  const articles = [];

  // TITRE I : DISPOSITIONS GENERALES
  articles.push(sectionTitle('TITRE I : DISPOSITIONS GENERALES'));

  // ARTICLE 1 - FORME
  articles.push(articleTitle('1', 'FORME'));
  articles.push(para([
    text('Il est constitué par le soussigné, une Société à Responsabilité Limitée devant exister entre lui et tous propriétaires de parts sociales ultérieures, qui sera régie par l\'Acte Uniforme révisé de l\'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d\'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et les présents statuts.'),
  ]));

  // ARTICLE 2 - DENOMINATION
  articles.push(articleTitle('2', 'DENOMINATION'));
  articles.push(para([
    text('La société a pour dénomination : '),
    bold('{denomination_complete}'),
  ]));
  articles.push(para([
    text('La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses.'),
  ]));
  articles.push(para([
    text('Elle doit être précédée ou suivie immédiatement en caractère lisible de l\'indication Société à Responsabilité Limitée ou SARL, du montant de son capital social, de l\'adresse de son siège social et de la mention de son immatriculation au registre du commerce et du Crédit Mobilier.'),
  ]));

  // ARTICLE 3 - OBJET
  articles.push(articleTitle('3', 'OBJET'));
  articles.push(para([
    text('La société a pour objet en COTE D\'IVOIRE :'),
  ]));
  articles.push(para([
    bold('{objet_social}'),
  ]));
  articles.push(para([
    text('Et généralement, toutes opérations industrielles, commerciales, financières, civiles, mobilières ou immobilières pouvant se rattacher directement ou indirectement à l\'objet social ou à tous objets similaires ou connexes ou susceptibles d\'en faciliter l\'extension ou le développement.'),
  ]));
  articles.push(para([
    text('En outre, la Société peut également participer par tous moyens, directement ou indirectement, dans toutes opérations pouvant se rattacher à son objet.'),
  ]));
  articles.push(para([
    text('- l\'acquisition, la location et la vente de tous biens meubles et immeubles.'),
  ]));
  articles.push(para([
    text('- l\'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.'),
  ]));
  articles.push(para([
    text('- la prise en location gérance de tous fonds de commerce.'),
  ]));
  articles.push(para([
    text('- la prise de participation en toute société existante ou devant être créée'),
  ]));
  articles.push(para([
    text('- et généralement, toute opérations financières, commerciales, industrielles, mobilières et immobilière, se rapportant directement ou indirectement à l\'objet social ou pouvant en faciliter l\'extension ou le développement.'),
  ]));

  // ARTICLE 4 - SIEGE SOCIAL
  articles.push(articleTitle('4', 'SIEGE SOCIAL'));
  articles.push(para([
    text('Le siège social est fixé à : '),
    bold('{siege_social_complet}'),
  ]));
  articles.push(para([
    text('Il peut être transféré dans les limites du territoire de la République de COTE D\'IVOIRE par décision de la gérance qui modifie en conséquence les statuts, sous réserve de la ratification de cette décision par la plus prochaine Assemblée Générale Ordinaire.'),
  ]));

  // ARTICLE 5 - DUREE
  articles.push(articleTitle('5', 'DUREE'));
  articles.push(para([
    text('La durée de la société est de {duree_societe_lettres} ({duree_societe}) années, sauf dissolution anticipée ou prorogation.'),
  ]));

  // ARTICLE 6 - EXERCICE SOCIAL
  articles.push(articleTitle('6', 'EXERCICE SOCIAL'));
  articles.push(para([
    text('L\'exercice social commence le premier janvier et se termine le trente et-un décembre de chaque année.'),
  ]));
  articles.push(para([
    text('Par exception, le premier exercice sera clos le trente et un décembre de l\'année suivante si la société commence ses activités au-delà des six premiers mois de l\'année en cours.'),
  ]));

  // ARTICLE 7 - APPORTS
  articles.push(articleTitle('7', 'APPORTS'));
  articles.push(leftPara([bold('Apports en numéraires')]));
  articles.push(para([
    text('Lors de la constitution, le soussigné a fait apport à la société, à savoir :'),
  ]));

  // Tableau des apports
  articles.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [leftPara([bold('IDENTITE DES APPORTEURS')])],
            borders: FULL_BORDER,
            width: { size: 60, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [leftPara([bold('MONTANT APPORT EN NUMERAIRE')])],
            borders: FULL_BORDER,
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              emptyPara(),
              leftPara([bold('M. {associe_nom_complet}')]),
              emptyPara(),
            ],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [
              emptyPara(),
              leftPara([text('{capital_formatte} F CFA')]),
              emptyPara(),
            ],
            borders: FULL_BORDER,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [leftPara([bold('Total des apports en numéraire : {capital_formatte} de francs CFA,')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [leftPara([text('{capital_formatte} FCFA')])],
            borders: FULL_BORDER,
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  articles.push(emptyPara());
  articles.push(para([
    text('Les apports en numéraire de '),
    bold('{capital_lettres}'),
    text(' de francs CFA ({capital_formatte}) F CFA correspondent à {nombre_parts} parts sociales de {valeur_part_formatte} FCFA entièrement souscrites et libérée intégralement, La somme correspondante a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à '),
    bold('{banque}'),
  ]));

  // ARTICLE 8 - CAPITAL SOCIAL (saut de page avant pour éviter que le tableau soit coupé)
  articles.push(new Paragraph({
    children: [boldUnderline('ARTICLE 8- CAPITAL SOCIAL')],
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120 },
    pageBreakBefore: true,
  }));
  articles.push(para([
    text('Le capital social est fixé à la somme de F CFA {capital_formatte} divisé en {nombre_parts} parts sociales de F CFA {valeur_part_formatte}, entièrement souscrites et libérées intégralement, numérotées de 1 à {nombre_parts}, attribuées à l\'associé unique, à savoir :'),
  ]));

  // Tableau du capital social
  articles.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [leftPara([bold('IDENTITE DES ASSOCIES')])],
            borders: FULL_BORDER,
            width: { size: 60, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [leftPara([bold('CONCURRENCE DES PARTS')])],
            borders: FULL_BORDER,
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              leftPara([bold('M. {associe_nom_complet}')]),
              emptyPara(),
              para([text('{nombre_parts} parts sociales numérotées de 1 à {nombre_parts} inclus, en rémunération de son apport exclusif en numéraire ci-dessus')]),
            ],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [
              emptyPara(),
              leftPara([bold('{nombre_parts} PARTS')]),
            ],
            borders: FULL_BORDER,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [para([text('TOTAL EGAL au nombre de parts composant le capital social, soit {nombre_parts} parts sociales, ci-contre')])],
            borders: FULL_BORDER,
          }),
          new TableCell({
            children: [
              emptyPara(),
              leftPara([bold('{nombre_parts} PARTS')]),
            ],
            borders: FULL_BORDER,
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  // ARTICLE 9 - MODIFICATION DU CAPITAL
  articles.push(articleTitle('9', 'MODIFICATION DU CAPITAL'));
  articles.push(para([
    text('1. Le capital social peut être augmenté, par décision extraordinaire de l\'associé unique, soit par émission de parts nouvelles, soit par majoration du nominal des parts existantes.'),
  ]));
  articles.push(para([
    text('Les parts nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices, soit par apport en nature.'),
  ]));
  articles.push(para([
    text('Le capital social peut être réduit, soit par la diminution de la valeur nominale des parts, soit par diminution du nombre de parts.'),
  ]));
  articles.push(para([
    text('La réduction du capital est autorisée ou décidée par l\'associé unique qui peut déléguer à la gérance les pouvoirs nécessaires pour la réaliser.'),
  ]));

  // ARTICLE 10 - DROITS DES PARTS
  articles.push(articleTitleColon('10', 'DROITS DES PARTS'));
  articles.push(para([
    text('1. Chaque part sociale confère à son propriétaire un droit égal dans les bénéfices de la société et dans tout l\'actif social.'),
  ]));

  // ARTICLE 11 - NANTISSEMENT DES PARTS SOCIALES
  articles.push(articleTitleColon('11', 'NANTISSEMENT DES PARTS SOCIALES'));
  articles.push(para([
    text('Le nantissement des parts est constaté par acte notarié ou sous seing-privé enregistré et signifié à la société ou accepté par elle dans un acte authentique.'),
  ]));

  // TITRE II : FONCTIONNEMENT-DISSOLUTION
  articles.push(sectionTitle('TITRE II : FONCTIONNEMENT-DISSOLUTION'));

  // ARTICLE 12 - COMPTES COURANTS
  articles.push(articleTitleColon('12', 'COMPTES COURANTS'));
  articles.push(para([
    text('L\'associé unique peut laisser ou mettre à disposition de la société toutes sommes dont celle-ci peut avoir besoin. Les conditions de retrait ou de remboursement de ces sommes, ainsi que leur rémunération, sont déterminées soit par décision de l\'associé unique, Soit par accords entre la gérance et l\'intéressé. Dans le cas où l\'avance est faite par l\'associé unique gérant, ces conditions sont fixées par décision de ce dernier.'),
  ]));

  // ARTICLE 13 - GERANCE
  articles.push(articleTitleColon('13', 'GERANCE'));
  articles.push(para([
    text('1. La société est gérée par une ou plusieurs personnes physiques. L\'associé unique peut être le gérant de la société. Le gérant est nommé pour une durée de '),
    bold('{duree_mandat_lettres} ({duree_mandat}) ans'),
    text('. La nomination du gérant au cours de la vie sociale est décidée par l\'associé unique.'),
  ]));
  articles.push(para([
    text('Est nommé gérant de la société pour une durée de '),
    bold('{duree_mandat_lettres} ({duree_mandat}) ans'),
    text(':'),
  ]));
  articles.push(para([
    text('M. '),
    bold('{associe_nom_complet}, {associe_profession}, résident à {associe_ville_residence} de nationalité {associe_nationalite} née le {associe_date_naissance} à {associe_lieu_naissance} et titulaire de la {type_identite} {numero_identite} délivré le {date_delivrance_id} et valable {date_validite_id} par {lieu_delivrance_id}'),
    text(' qui accepte.'),
  ]));
  articles.push(para([
    text('Le gérant est nommé par décision de l\'associe unique.'),
  ]));
  articles.push(para([
    text('Le gérant peut démissionner de son mandat, mais seulement en prévenant l\'associé unique au moins 3 mois à l\'avance, par lettre recommandé avec demande d\'avis de réception ou lettre au porteur contre récépissé.'),
  ]));
  articles.push(para([
    text('Le gérant est révocable par décision de l\'associé unique.'),
  ]));
  articles.push(para([
    text('La rémunération du gérant est fixée par la décision qui le nomme.'),
  ]));

  // ARTICLE 14 - POUVOIRS DU GERANT
  articles.push(articleTitleColon('14', 'POUVOIRS DU GERANT'));
  articles.push(para([
    text('Le gérant peut faire tous les actes de gestion dans l\'intérêt de la société.'),
  ]));
  articles.push(para([
    text('Dans les rapports avec les tiers, le gérant est investi des pouvoirs les plus étendus pour agir en toute circonstance, au nom de la société, sous réserve des pouvoirs expressément attribués à l\'associé unique par la loi.'),
  ]));
  articles.push(para([
    text('La société est engagée, même par les actes du gérant qui ne relèvent pas de l\'objet social, à moins qu\'elle ne prouve que le tiers savait qu\'il dépassait cet objet ou qu\'il ne pouvait l\'ignorer compte tenu des circonstances, étant exclu que la seule publication des statuts suffise constituer cette preuve.'),
  ]));

  // ARTICLE 15 - RESPONSABILITE DU GERANT
  articles.push(articleTitleColon('15', 'RESPONSABILITE DU GERANT'));
  articles.push(para([
    text('Le gérant est responsable, envers la société ou envers les tiers, soit des infractions aux dispositions législatives ou réglementaires applicables aux sociétés à responsabilité limitée, soit des violations des statuts, soit des fautes commises dans sa gestion. Si plusieurs gérants ont coopéré aux mêmes faits, le tribunal chargé des affaires commerciales détermine la part contributive de chacun dans la réparation du dommage.'),
  ]));
  articles.push(para([
    text('Aucune décision de l\'associé unique ne peut avoir pour effet d\'éteindre une action en responsabilité contre les gérants pour faute commise dans l\'accomplissement de leur mandat.'),
  ]));

  // ARTICLE 16 - DECISIONS DE L'ASSOCIE UNIQUE
  articles.push(articleTitleColon('16', 'DECISIONS DE L\'ASSOCIE UNIQUE'));
  articles.push(para([
    text('L\'associé unique exerce les pouvoirs dévolus par l\'Acte Uniforme relatif au droit des sociétés commerciales et du GIE.'),
  ]));
  articles.push(para([
    text('L\'associé unique ne peut déléguer ses pouvoirs. Ses décisions sont consignées dans un procès-verbal versé dans les archives de la société.'),
  ]));

  // ARTICLE 17 - COMPTES SOCIAUX
  articles.push(articleTitleColon('17', 'COMPTES SOCIAUX'));
  articles.push(para([
    text('A la clôture de chaque exercice, le gérant établit et arrête les états financiers de synthèse conformément aux dispositions de l\'Acte Uniforme portant organisation et harmonisation des comptabilités.'),
  ]));
  articles.push(para([
    text('Le gérant établit un rapport de gestion dans lequel il expose la situation de la société durant l\'exercice écoulé, son évolution prévisible et, en particulier les perspectives de continuation de l\'activité, l\'évolution de la situation de trésorerie et le plan de financement.'),
  ]));
  articles.push(para([
    text('Ces documents ainsi que les textes des résolutions proposées et, le cas échéant, les rapports du commissaire aux comptes sont communiqués à l\'associé unique dans les conditions et délais prévus par les dispositions légales et réglementaires.'),
  ]));
  articles.push(para([
    text('A compter de cette communication, l\'associé unique a la possibilité de poser par écrit des questions auxquelles le gérant sera tenu de répondre.'),
  ]));
  articles.push(para([
    text('L\'associé unique est tenu de statuer sur les comptes de l\'exercice écoulé dans les six mois de la clôture de l\'exercice ou, en cas de prolongation, dans le délai fixé par décision de justice.'),
  ]));

  // ARTICLE 18 - AFFECTATION DES RESULTATS
  articles.push(articleTitleColon('18', 'AFFECTATION DES RESULTATS'));
  articles.push(para([
    text('Après approbation des comptes et constatations de l\'existence d\'un bénéfice distribuable, l\'associé unique détermine la part attribuée sous forme de dividende.'),
  ]));
  articles.push(para([
    text('Il est pratiqué sur le bénéfice de l\'exercice diminué, le cas échéant, des pertes antérieures, une dotation égale à un dixième au moins affecté à la formation d\'un fonds de réserve dit "réserve légale". Cette dotation cesse d\'être obligatoire lorsque la réserve atteint le cinquième du montant du capital social.'),
  ]));
  articles.push(para([
    text('L\'associé unique a la faculté de constituer tous postes de réserves.'),
  ]));
  articles.push(para([
    text('Il peut procéder à la distribution de tout ou partie des réserves à la condition qu\'il ne s\'agisse pas de réserves déclarées indisponibles par la loi ou par les statuts. Dans ce cas, il indique expressément les postes de réserve sur lesquels les prélèvements sont effectués. La société est tenue de déposer au Registre du Commerce et du Crédit Mobilier, du lieu du siège social dans le mois qui suit leur approbation par les organes compétents, les états financiers de synthèse, à savoir le bilan, le compte de résultat, le tableau des ressources et des emplois et l\'état annexé de l\'exercice écoulé.'),
  ]));

  // ARTICLE 19 - VARIATION DES CAPITAUX PROPRES
  articles.push(articleTitleColon('19', 'VARIATION DES CAPITAUX PROPRES'));
  articles.push(para([
    text('Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le gérant ou, le cas échéant, le commissaire aux comptes doit dans les quatre mois qui suivent l\'approbation des comptes ayant fait apparaître cette perte, consulter l\'associé unique sur l\'opportunité de prononcer la dissolution anticipée de la société.'),
  ]));
  articles.push(para([
    text('Si la dissolution est écartée, la société est tenue, dans les deux ans qui suivent la date de clôture de l\'exercice déficitaire, de reconstituer ses capitaux propres jusqu\'à ce que ceux-ci soient à la hauteur de la moitié au moins du capital social.'),
  ]));
  articles.push(para([
    text('A défaut, elle doit réduire son capital d\'un montant au moins égal à celui des pertes qui n\'ont pu être imputées sur les réserves, à la condition que cette réduction du capital n\'ait pas pour effet de réduire le capital à un montant inférieur à celui du capital minimum légal.'),
  ]));
  articles.push(para([
    text('A défaut par le gérant ou le commissaire aux comptes de provoquer cette décision, ou si l\'associé unique n\'a pu prendre de décision valablement, tout intéressé peut demander à la juridiction compétente de prononcer la dissolution de la société. '),
    text('Il en est de même si la reconstitution des capitaux propres n\'est pas intervenue dans les délais prescrits.', { italics: true }),
  ]));

  // ARTICLE 20 - CONTROLE DES COMPTES
  articles.push(articleTitleColon('20', 'CONTROLE DES COMPTES'));
  articles.push(para([
    text('Un ou plusieurs commissaires aux comptes titulaires et suppléants seront désignés lorsque qu\'à la clôture d\'un exercice social, la société remplit deux des conditions suivantes :'),
  ]));
  articles.push(para([
    text('-  total du bilan supérieur à cent vingt- cinq millions (125 000 000) de francs CFA ;'),
  ], { indent: { left: 720 } }));
  articles.push(para([
    text('-  chiffre d\'affaire annuel supérieur à deux cent cinquante millions (250 000 000) de francs CFA ;'),
  ], { indent: { left: 720 } }));
  articles.push(para([
    text('-  effectif permanent supérieur à cinquante (50) personnes ;'),
  ], { indent: { left: 720 } }));
  articles.push(para([
    text('Le commissaire aux comptes est nommé pour trois (3) exercices par un ou plusieurs associés représentant plus de la moitié du capital.'),
  ]));
  articles.push(para([
    text('La société n\'est plus tenue de désigner un commissaire aux comptes dès lors qu\'elle n\'a pas rempli deux (2) des conditions fixées ci-dessus pendant les (2) exercices précédant l\'expiration du mandat du commissaire aux comptes.'),
  ]));

  // ARTICLE 21 - DISSOLUTION
  articles.push(articleTitleColon('21', 'DISSOLUTION'));
  articles.push(para([
    text('La société à responsabilité limitée est dissoute pour les causes communes à toutes les sociétés. La dissolution de la société n\'entraîne pas sa mise en liquidation.'),
  ]));

  // ARTICLE 22 - ENGAGEMENTS POUR LE COMPTE DE LA SOCIETE
  articles.push(articleTitleColon('22', 'ENGAGEMENTS POUR LE COMPTE DE LA SOCIETE'));
  articles.push(para([
    text('1. Un état des actes accomplis par l\'associé unique pour le compte de la société en formation, avec l\'indication, de l\'engagement qui en résulterait pour la société, est annexé aux présents statuts.'),
  ]));
  articles.push(para([
    text('2. En outre, le soussigné se réserve le droit de prendre les engagements suivants au nom et pour le compte de la société : '),
    bold('{denomination_complete}'),
  ]));

  // ARTICLE 23 - FRAIS
  articles.push(articleTitleColon('23', 'FRAIS'));
  articles.push(para([
    text('Les frais, droits et honoraires des présents statuts sont à la charge de la société.'),
  ]));

  // ARTICLE 24 - ELECTION DE DOMICILE
  articles.push(articleTitleColon('24', 'ELECTION DE DOMICILE'));
  articles.push(para([
    text('Pour l\'exécution des présentes et de leurs suites, le soussigné déclare faire élection de domicile au siège social.'),
  ]));

  // ARTICLE 25 - POUVOIRS
  articles.push(articleTitleColon('25', 'POUVOIRS'));
  articles.push(para([
    text('L\'associé donnent tous pouvoirs à '),
    bold('M. {associe_nom_complet}, {associe_profession}, résident à {associe_ville_residence} de nationalité {associe_nationalite} née le {associe_date_naissance} à {associe_lieu_naissance} et titulaire de la {type_identite} {numero_identite} délivré le {date_delivrance_id} et valable {date_validite_id} par {lieu_delivrance_id}'),
    text(' de procéder à l\'enregistrement des présents statuts, accomplir les formalités d\'immatriculation au Registre du Commerce et du Crédit Mobilier, et pour les besoins de formalités, de signer tout acte et en donner bonne et valable décharge.'),
  ]));

  return articles;
};

// ============================================================
// BLOC SIGNATURE
// ============================================================

const createSignatureBlock = () => [
  emptyPara({ spacing: { after: 400 } }),
  leftPara([text('Fait à A {ville} le  {date_constitution}')]),
  emptyPara(),
  leftPara([text('EN DEUX (2)  EXEMPLAIRES ORIGINAUX')]),
  emptyPara({ spacing: { after: 400 } }),
  centerPara([bold('M. {associe_nom_complet}')]),
  emptyPara({ spacing: { after: 400 } }),
  centerPara([boldUnderline('Associé unique')]),
];

// ============================================================
// DOCUMENT PRINCIPAL
// ============================================================

const createDocument = () => {
  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: FONT_SIZE,
          },
          paragraph: {
            spacing: { after: 120 },
            alignment: AlignmentType.JUSTIFIED,
          },
        },
      },
    },
    sections: [
      // Section 1: Page de garde (sans numéro de page)
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.79), // ~20mm
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.59), // ~15mm
              right: convertInchesToTwip(0.59),
            },
          },
        },
        children: createCoverPage(),
      },
      // Section 2: Contenu principal (avec numéros de page)
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
        children: [
          ...createIntroPage(),
          ...createHeaderBox(),
          ...createArticles(),
          ...createSignatureBlock(),
        ],
      },
    ],
  });
};

// ============================================================
// MAIN
// ============================================================

const main = async () => {
  console.log('🔧 Création du template DOCX des Statuts SARLU...');

  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(__dirname, '../templates/statuts_sarlu_template.docx');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ Template généré: ${outputPath}`);
  console.log(`   Taille: ${(buffer.length / 1024).toFixed(1)} Ko`);
};

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
