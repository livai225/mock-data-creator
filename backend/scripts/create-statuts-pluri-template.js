/**
 * Script de génération du template DOCX des Statuts SARL Pluripersonnelle
 * Conforme au modèle de référence (GUHAN FORAGE / NEW VOLTA FORAGE)
 *
 * Le template utilise des placeholders {xxx} pour docxtemplater.
 * Les associés sont gérés via des boucles docxtemplater {#associes_list}...{/associes_list}
 *
 * Usage: node backend/scripts/create-statuts-pluri-template.js
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, PageBreak, Footer,
  PageNumber, NumberFormat, convertInchesToTwip, HeightRule, VerticalAlign,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Police et tailles conformes au modèle de référence (GUHAN FORAGE)
const FONT = 'Comic Sans MS';
const FONT_SIZE = 22;       // 11pt - taille standard du modèle
const FONT_SIZE_LARGE = 24; // 12pt - titres de section
const FONT_SIZE_TITLE = 32; // 16pt - TITRE I / TITRE II (centré bold)
const FONT_SIZE_COVER = 44; // 22pt - couverture
const FONT_SIZE_COVER_BIG = 52; // 26pt - nom société couverture

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
  spacing: opts.spacing,
  indent: opts.indent,
  numbering: opts.numbering,
  keepNext: opts.keepNext,
});

const centerPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.CENTER });
const leftPara = (children, opts = {}) => para(children, { ...opts, alignment: AlignmentType.LEFT });

const emptyPara = (opts = {}) => new Paragraph({
  children: [new TextRun({ text: '', font: FONT, size: opts.size || FONT_SIZE })],
  spacing: opts.spacing || { after: 120 },
});

const articleTitle = (num, title) => new Paragraph({
  children: [boldUnderline(`ARTICLE ${num}- ${title}`)],
  alignment: AlignmentType.LEFT,
  spacing: { before: 200, after: 0 },
});

const articleTitleColon = (num, title) => new Paragraph({
  children: [boldUnderline(`ARTICLE ${num} : ${title}`)],
  alignment: AlignmentType.LEFT,
  spacing: { before: 200, after: 0 },
});

const sectionTitle = (t) => new Paragraph({
  children: [bold(t, { size: FONT_SIZE_TITLE })],
  alignment: AlignmentType.CENTER,
  spacing: { before: 300, after: 200 },
});

// Paragraphe en-tête de sous-section (bold, underline, non justifié)
const subTitle = (t) => new Paragraph({
  children: [boldUnderline(t)],
  alignment: AlignmentType.LEFT,
  spacing: { before: 160, after: 0 },
});

// Paragraphe indenté (pour gérant, tirets, etc.)
const indentPara = (children, opts = {}) => para(children, {
  ...opts,
  indent: { left: opts.indent || 720 },
});

// ============================================================
// PAGE DE GARDE
// ============================================================

const createCoverPage = () => [
  emptyPara({ spacing: { after: 800 } }),
  emptyPara({ spacing: { after: 800 } }),
  centerPara([bold('STATUTS DE LA SOCIETE', { size: FONT_SIZE_COVER_BIG })], { spacing: { after: 400 } }),
  centerPara([bold('«{denomination_complete} »', { size: FONT_SIZE_COVER_BIG })], { spacing: { after: 400 } }),
  centerPara([bold('AU CAPITAL DE {capital_formatte} FCFA', { size: FONT_SIZE_COVER })], { spacing: { after: 200 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============================================================
// PAGE INTRODUCTION
// ============================================================

const createIntroPage = () => [
  emptyPara({ spacing: { after: 300 } }),
  emptyPara({ spacing: { after: 300 } }),
  new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              centerPara([bold('Modèle Type utilisable et adaptable, conforme aux dispositions en vigueur de l\'Acte uniforme révisé de l\'OHADA du 30 janvier 2014 relatif au Droit des Sociétés commerciales et du Groupement d\'Intérêt Economique')], { spacing: { after: 80 } }),
              centerPara([bold('STATUT TYPE SOUS SEING PRIVE')], { spacing: { after: 80 } }),
              centerPara([bold('Cas d\'une  Société à Responsabilité Limitée  comportant  plusieurs associés  et constituée   exclusivement   par apports en numéraire')], { spacing: { after: 40 } }),
            ],
            borders: FULL_BORDER,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }),
  emptyPara({ spacing: { after: 160 } }),
  leftPara([boldUnderline('N.B : Indications d\'utilisation')]),
  para([text('Ce cas de figure courant a été conçu pour faciliter et encadrer le processus de création d\'entreprise pour une meilleure sécurisation des opérateurs économiques.')], { spacing: { after: 100 } }),
  para([text('1.  les espaces en pointillé sont des  champs à remplir  et  à adapter  à partir des informations décrites  dans les parenthèses qui suivent ;')], { indent: { left: 360 }, spacing: { after: 100 } }),
  para([text('2.  établir les statuts en nombre suffisant pour la remise d\'un exemplaire original à chaque associé, le dépôt d\'un exemplaire au siège social, et l\'accomplissement des formalités de constitution.')], { indent: { left: 360 }, spacing: { after: 0 } }),
  emptyPara({ spacing: { after: 400 } }),
  emptyPara({ spacing: { after: 400 } }),
  centerPara([bold('SARL  pluripersonnelle constituée exclusivement', { size: FONT_SIZE_LARGE })], { spacing: { after: 60 } }),
  centerPara([bold('Par apports  en numéraire', { size: FONT_SIZE_LARGE })], { spacing: { after: 200 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ============================================================
// EN-TÊTE ENCADRÉ
// ============================================================

const createHeaderBox = () => [
  new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              centerPara([bold('STATUTS DE LA SOCIETE A RESPONSABILITE LIMITEE DENOMMEE')], { spacing: { after: 40 } }),
              centerPara([bold('« {denomination_complete} »')], { spacing: { after: 40 } }),
              centerPara([bold('Au capital de {capital_formatte} FCFA, située à {siege_social_complet}')], { spacing: { after: 40 } }),
            ],
            borders: FULL_BORDER,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }),
  emptyPara({ spacing: { after: 80 } }),
  leftPara([text('L\'An {annee_lettres},')]),
  emptyPara({ spacing: { after: 40 } }),
  leftPara([text('Le  {date_constitution}')]),
  emptyPara({ spacing: { after: 160 } }),
  // Liste des associés - placeholder rempli par docxGenerator (paragraphes séparés par \n)
  para([text('{associes_identites}')]),
  emptyPara({ spacing: { after: 80 } }),
  para([bold('Il a été établi par les présentes, les statuts de la Société à Responsabilité Limitée dont la teneur suit :')]),
  emptyPara({ spacing: { after: 80 } }),
];

// ============================================================
// ARTICLES
// ============================================================

const createArticles = () => {
  const a = [];

  // Helpers locaux : ajoutent un saut de ligne vide avant chaque titre d'article
  const art = (num, title) => { a.push(emptyPara()); a.push(articleTitle(num, title)); };
  const artC = (num, title) => { a.push(emptyPara()); a.push(articleTitleColon(num, title)); };
  const sec = (t) => { a.push(emptyPara()); a.push(sectionTitle(t)); };
  const sep = () => a.push(emptyPara()); // séparateur entre sous-sections

  // TITRE I
  sec('TITRE I : DISPOSITIONS GENERALES');

  // ART 1 - FORME
  art('1', 'FORME');
  a.push(para([text('Il est constitué par les soussignés, une Société à Responsabilité Limitée devant exister entre eux et tous propriétaires de parts sociales ultérieures, qui sera régie par l\'Acte Uniforme révisé de l\'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d\'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et les présents statuts.')]));

  // ART 2 - DENOMINATION
  art('2', 'DENOMINATION');
  a.push(para([text('La société a pour dénomination : '), bold('{denomination_complete}')]));
  a.push(para([text('La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie immédiatement en caractère lisible de l\'indication Société à Responsabilité Limitée ou SARL, du montant de son capital social, de l\'adresse de son siège social et de la mention de son immatriculation au registre du commerce et du Crédit Mobilier.')]));

  // ART 3 - OBJET
  art('3', 'OBJET');
  a.push(para([bold('{objet_social}')]));
  a.push(para([text('Et généralement, toutes opérations industrielles, commerciales, financières, civiles, mobilières ou immobilières pouvant se rattacher directement ou indirectement à l\'objet social ou à tous objets similaires ou connexes ou susceptibles d\'en faciliter l\'extension ou le développement.')]));
  a.push(para([text('En outre, la Société peut également participer par tous moyens, directement ou indirectement, dans toutes opérations pouvant se rattacher à son objet.')]));
  a.push(para([text('- l\'acquisition, la location et la vente de tous biens meubles et immeubles.')]));
  a.push(para([text('- l\'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.')]));
  a.push(para([text('- la prise en location gérance de tous fonds de commerce.')]));
  a.push(para([text('- la prise de participation dans toute société existante ou devant être créée')]));
  a.push(para([text('- et généralement, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, se rapportant directement ou indirectement à l\'objet social ou pouvant en faciliter l\'extension ou le développement.')]));

  // ART 4 - SIEGE SOCIAL
  art('4', 'SIEGE SOCIAL');
  a.push(para([text('Le siège social est fixé à : '), bold('{siege_social_complet}')]));
  a.push(para([text('Il peut être transféré dans les limites du territoire de la République de CÔTE-D\'IVOIRE par décision de la gérance qui modifie en conséquence les statuts, sous réserve de la ratification de cette décision par la plus prochaine Assemblée Générale Ordinaire.')]));

  // ART 5 - DUREE
  art('5', 'DUREE');
  a.push(para([text('La durée de la société est de {duree_societe_lettres} ({duree_societe}) années, sauf dissolution anticipée ou prorogation.')]));

  // ART 6 - EXERCICE SOCIAL
  art('6', 'EXERCICE SOCIAL');
  a.push(para([text('L\'exercice social commence le premier janvier et se termine le trente et-un décembre de chaque année.')]));
  a.push(para([text('Par exception, le premier exercice sera clos le trente et un décembre de l\'année suivante si la société commence ses activités au-delà des six premiers mois de l\'année en cours.')]));

  // ART 7 - APPORTS
  art('7', 'APPORTS');
  a.push(leftPara([bold('Apports en numéraires')]));
  a.push(para([text('Lors de la constitution, les soussignés ont fait apport à la société, à savoir :')]));

  // Tableau apports - avec placeholders pour chaque associé
  a.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [leftPara([bold('IDENTITE DES APPORTEURS')])], borders: FULL_BORDER, width: { size: 60, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [leftPara([bold('MONTANT APPORT EN NUMERAIRE')])], borders: FULL_BORDER, width: { size: 40, type: WidthType.PERCENTAGE } }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [leftPara([text('{tableau_apports_noms}')])], borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('{tableau_apports_montants}')])], borders: FULL_BORDER }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [leftPara([bold('Total des apports en numéraire : {capital_formatte} de francs CFA')])] , borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('{capital_formatte} F CFA')])], borders: FULL_BORDER }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  a.push(emptyPara());
  a.push(para([
    text('Les apports en numéraire d\''),
    bold('{capital_lettres_min}'),
    text(' ({capital_formatte}) F CFA correspondent à {nombre_parts} parts sociales de {valeur_part_formatte} FCFA chacune, souscrites et libérées intégralement par les associés. La somme correspondante a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à '),
    bold('{banque}'),
  ]));

  // ART 8 - CAPITAL SOCIAL
  art('8', 'CAPITAL SOCIAL');
  a.push(para([text('Le capital social est fixé à la somme de F CFA {capital_formatte} divisé en {nombre_parts} parts sociales de F CFA {valeur_part_formatte}, entièrement souscrites et libérées intégralement, numérotées de 1 à {nombre_parts}, attribuées aux associés, à savoir :')]));

  // Tableau capital social
  a.push(new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [leftPara([bold('IDENTITE DES ASSOCIES')])], borders: FULL_BORDER, width: { size: 60, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [leftPara([bold('CONCURRENCE DES PARTS')])], borders: FULL_BORDER, width: { size: 40, type: WidthType.PERCENTAGE } }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [para([text('{tableau_capital_noms}')])] , borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([text('{tableau_capital_parts}')])], borders: FULL_BORDER }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [para([text('TOTAL EGAL au nombre de parts Composant le capital social, soit {nombre_parts} parts sociales, ci-contre')])] , borders: FULL_BORDER }),
          new TableCell({ children: [leftPara([bold('{nombre_parts} PARTS')])], borders: FULL_BORDER }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));

  // ART 9 - MODIFICATION DU CAPITAL
  art('9', 'MODIFICATION DU CAPITAL');
  a.push(para([text('9-1- Le capital social peut être augmenté, par décision extraordinaire des associés, soit par émission de parts nouvelles, soit par majoration du nominal des parts existantes.')]));
  a.push(para([text('Les parts nouvelles sont libérées soit en espèce, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices, soit par apport en nature.')]));
  sep();
  a.push(para([text('9-2 – En cas d\'augmentation de capital, les attributaires de parts nouvelles, s\'ils n\'ont pas déjà la qualité d\'associés, devront être agréés dans les conditions fixées à l\'article 11 ci-après.')]));
  sep();
  a.push(para([text('9-3 – En cas d\'augmentation de capital par voie d\'apports en numéraire, chacun des associés a, proportionnellement au nombre de parts qu\'il possède, un droit de préférence à la souscription des parts nouvelles représentatives de l\'augmentation de capital.')]));
  a.push(para([text('Le droit de souscription attaché aux parts anciennes peut être cédé sous réserve de l\'agrément du cessionnaire dans les conditions prévues à l\'Article 11 ci-après.')]));
  a.push(para([text('Les associés pourront, lors de la décision afférente à l\'augmentation de capital, renoncer, en tout ou en partie, à leur droit préférentiel de souscription.')]));
  a.push(para([text('La collectivité des associés peut également décider la suppression de ce droit.')]));
  sep();
  a.push(para([text('9-4 Dans tous les cas, si l\'opération fait apparaître des rompus, les associés feront leur affaire personnelle de toute acquisition ou cession de droits nécessaires.')]));
  sep();
  a.push(para([text('9-5 Le capital social peut être réduit, soit par la diminution de la valeur nominale des parts, soit par la diminution du nombre de parts.')]));
  a.push(para([text('La réduction du capital est autorisée ou décidée par l\'Assemblée Générale Extraordinaire qui peut déléguer à la gérance les pouvoirs nécessaires pour la réaliser.')]));

  // ART 10 - DROIT DES PARTS
  art('10', 'DROIT DES PARTS');
  a.push(para([text('Chaque part sociale confère à son propriétaire un droit égal dans les bénéfices de la société et dans tout l\'actif social.')]));

  // ART 11 - CESSION DE PARTS ENTRE VIFS
  art('11', 'CESSION DE PARTS ENTRE VIFS');
  a.push(para([bold('11-1- Forme')]));
  a.push(para([text('Toute cession de parts sociales doit être constatée par écrit. Elle n\'est opposable à la société qu\'après accomplissement des formalités suivantes :')]));
  a.push(para([text('- signification de la cession à la société par acte extrajudiciaire ;')]));
  a.push(para([text('- acceptation de la cession par la société dans un acte authentique ;')]));
  a.push(para([text('- dépôt d\'un original de l\'acte de cession au siège social contre remise par le gérant d\'une attestation de ce dépôt.')]));
  a.push(para([text('La cession n\'est opposable aux tiers qu\'après l\'accomplissement de l\'une des formalités ci-dessus et modification des statuts et publicité au registre du commerce et du crédit mobilier.')]));
  sep();
  a.push(para([bold('11-2- Cessions entre associés.')]));
  a.push(para([text('Les parts sociales sont librement cessibles entre associés.')]));
  sep();
  a.push(para([bold('11-3- Cessions aux conjoints, ascendants ou descendants')]));
  a.push(para([text('Les parts sociales sont librement cessibles entre conjoint, ascendants ou descendants.')]));
  sep();
  a.push(para([bold('11-4- Cessions à des tiers')]));
  a.push(para([text('Les parts ne peuvent être cédées à des tiers qu\'avec le consentement de la majorité des associés représentant au moins les trois quarts (3/4) des parts sociales.')]));
  a.push(para([text('Le projet de cession est notifié par l\'associé cédant à la société et à chacun des associés par acte extrajudiciaire. Si la société n\'a pas fait connaître sa décision dans le délai de trois (3) mois à compter de la dernière des notifications, le consentement à la cession est réputée acquis.')]));
  a.push(para([text('Si la société refuse de consentir à la cession, les associés sont tenus, dans les trois (3) mois de la notification du refus, d\'acquérir les parts à un prix qui, à défaut d\'accord entre les parties, est fixé par un expert nommé par le président de la juridiction compétente à la demande de la partie la plus diligente. Le délai de trois (3) mois peut être prolongé une seule fois par ordonnance du président de la juridiction compétente, sans que cette prolongation puisse excéder cent vingt (120) jours.')]));
  a.push(para([text('La société peut également, avec le consentement du cédant, décider, dans le même délai, de réduire son capital du montant de la valeur nominale desdites parts et de racheter ces parts au prix déterminé dans les conditions prévues ci-dessus. Si, à l\'expiration du délai imparti, la société n\'a pas racheté ou fait racheter les parts, l\'associé peut réaliser la cession initialement prévue.')]));
  a.push(para([text('Les dispositions qui précèdent sont applicables à tous les cas de cessions, y compris en cas d\'apport au titre d\'une fusion ou d\'une scission ou encore à titre d\'attribution en nature à la liquidation d\'une autre société.')]));

  // ART 12 - TRANSMISSION DE PARTS PAR DECES
  art('12', 'TRANSMISSION DE PARTS PAR DECES OU LIQUIDATION DE COMMUNAUTE');
  a.push(para([text('En cas de décès ou d\'incapacité d\'un associé, la société continue de plein droit entre les associés survivants et les héritiers et ayants droit de l\'associé décédé, lesdits héritiers, ayants droit ou conjoint, devront justifier en outre de leur identité personnelle, de leur qualité héréditaire par la production de toutes pièces appropriées.')]));
  a.push(para([text('La gérance peut requérir de tout Notaire, la délivrance d\'expéditions ou d\'extraits de tous actes établissant lesdites qualités ; lesdits héritiers, ayants droit et conjoint désignent un mandataire chargé de les représenter auprès de la société pendant la durée de l\'indivision.')]));

  // ART 13 - NANTISSEMENT
  art('13', 'NANTISSEMENT DES PARTS SOCIALES');
  a.push(para([text('Le nantissement des parts est constaté par acte notarié ou sous seing privé, enregistré et signifié à la société et publié au registre du commerce et du crédit mobilier. Si la société a donné son consentement à un projet de nantissement de parts dans les conditions prévues pour les cessions de parts à des tiers, ce consentement emportera agrément du cessionnaire en cas de réalisation forcée des parts nanties, à moins que la société ne préfère, après la cession, racheter dans le délai les parts, en vue de réduire son capital.')]));

  // TITRE II
  sec('TITRE II : FONCTIONNEMENT-DISSOLUTION');

  // ART 14 - COMPTES COURANTS
  artC('14', 'COMPTES COURANTS');
  a.push(para([text('Les associés peuvent laisser ou mettre à disposition de la société toute somme dont celle-ci peut avoir besoin. Les conditions de retrait ou de remboursement de ces sommes, ainsi que leur rémunération, sont déterminées soit par décisions collectives des associés, soit par accord entre la gérance et l\'intéressé, dans le cas où l\'avance est faite par un gérant, ces conditions sont fixées par décision collectives des associés. Ces accords sont soumis à la procédure de contrôle des conventions passées entre la société et l\'un de ses gérants ou associés en ce qui concerne la rémunération des sommes mises à disposition.')]));

  // ART 15 - GERANCE
  art('15', 'GERANCE');
  a.push(para([text('La société est gérée par une ou plusieurs personnes physiques, choisies parmi les associés ou en dehors d\'eux. Elles sont nommées pour une durée de '), bold('{duree_mandat_lettres} ({duree_mandat}) ans'), text(' et sont toujours rééligibles. La nomination des gérants au cours de la vie sociale est décidée à la majorité de plus de la moitié des parts.')]));
  a.push(para([text('{gerant_nomination_prefix}'), bold('{duree_mandat_lettres} ({duree_mandat}) ans'), text(' :')], { spacing: { after: 0 } }));
  // Identité du/des gérant(s) en bloc indenté (conforme au modèle de référence)
  // {gerant_identite_complete} contient "qui accepte." et tous les gérants séparés par \n si co-gérance
  a.push(new Paragraph({
    children: [bold('{gerant_identite_complete}')],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' },
    indent: { left: 720 },
  }));
  a.push(emptyPara());
  a.push(para([text('Les gérants reçoivent, à titre de rémunération de leurs fonctions et en compensation de la responsabilité attachée à la gestion de la société, un traitement dont le montant et les modalités de paiement sont déterminés par décision collective ordinaire des associés.')]));
  a.push(para([text('Ce traitement peut être fixe ou proportionnel ou à la fois fixe et proportionnel selon des modalités arrêtées par les associés. Il peut comprendre, également, des avantages en nature et, éventuellement, être augmenté de gratifications exceptionnelles en cours ou en fin d\'exercice social. Chaque gérant a droit au remboursement, sur justification, de ses frais de représentation et de déplacement.')]));
  a.push(para([text('Les sommes versées aux gérants à titre de rémunération ou en remboursement de frais sont inscrites en dépenses d\'exploitation. Les gérants sont soumis aux obligations fixées par la loi et les règlements et notamment à l\'établissement des comptes annuels et du rapport de gestion.')]));
  a.push(para([text('Les gérants peuvent démissionner de leur mandat, mais seulement en prévenant chacun des associés au moins trois (3) mois à l\'avance, par lettre recommandée avec demande d\'avis de réception ou lettre au porteur contre récépissé.')]));
  a.push(para([text('Les gérants sont révocables par décision des associés représentant plus de la moitié des parts sociales.')]));
  a.push(para([text('La rémunération des gérants est fixée par la décision qui les nomme.')]));

  // ART 16 - POUVOIRS DU GERANT
  art('16', 'POUVOIRS DU GERANT');
  a.push(para([text('Dans les rapports entre associés, le gérant peut faire tous les actes de gestion dans l\'intérêt de la société.')]));
  a.push(para([text('Dans le rapport avec les tiers le gérant est investi des pouvoirs les plus étendus pour agir en toutes circonstances, au nom de la société, sous réserve des pouvoirs expressément attribués aux associés par la loi.')]));
  a.push(para([text('La société est engagée, même par les actes du gérant qui ne relèvent pas de l\'objet social, à moins qu\'elle ne prouve que le tiers savait que l\'acte dépassait cet objet ou qu\'il ne pouvait l\'ignorer compte tenu des circonstances, étant exclu que la seule publication des statuts suffise à constituer cette preuve.')]));

  // ART 17 - RESPONSABILITE DES GERANTS
  art('17', 'RESPONSABILITE DES GERANTS');
  a.push(para([text('Les gérants sont responsables, individuellement ou solidairement, selon le cas, envers la société ou envers les tiers, soit des infractions aux dispositions législatives ou réglementaires applicables aux sociétés à responsabilité limitée, soit des violations des statuts, soit de fautes commises dans leur gestion. Si plusieurs gérants ont coopéré aux mêmes faits, le tribunal chargé des affaires commerciales détermine la part contributive de chacun dans la réparation du dommage.')]));
  a.push(para([text('Aucune décision de l\'Assemblée ne peut avoir pour effet d\'éteindre une action en responsabilité contre les gérants pour faute commise dans l\'accomplissement de leur mandat.')]));
  sep();
  a.push(para([boldUnderline('Assiduité – Non-concurrence - publicité')]));
  a.push(para([bold('1-Assiduité :'), text(' Les gérants sont tenus de consacrer le temps et les soins nécessaires aux affaires sociales.')]));
  sep();
  a.push(para([bold('2- Non concurrence :'), text(' Tout gérant s\'interdit, directement ou indirectement à quelque titre que ce soit, toute activité concurrente ou connexe à celle de la société et s\'engage à informer les associés de la nature de toute activité professionnelle qu\'il envisagerait d\'entreprendre au cours de son mandat.')]));
  sep();
  a.push(para([bold('3- Publicité :'), text(' La nomination et la cessation des fonctions d\'un gérant donnent lieu à publication dans les conditions prévues par la réglementation sur les sociétés commerciales.')]));
  a.push(para([text('Ni la société, ni les tiers ne peuvent pour se soustraire à leurs engagements, se prévaloir d\'une irrégularité dans la nomination d\'un gérant lorsque la nomination a été régulièrement publiée.')]));
  a.push(para([text('La société ne peut se prévaloir, à l\'égard des tiers, des nominations et cessation de fonctions d\'un gérant, tant qu\'elles n\'ont pas été régulièrement publiées.')]));
  a.push(para([text('Un gérant qui a cessé ses fonctions peut exiger, par toute voie de droit, l\'accomplissement de toute publicité rendue nécessaire par la cessation de ses fonctions.')]));

  // ART 18 - DECISIONS COLLECTIVES
  art('18', 'DECISIONS COLLECTIVES');
  a.push(para([text('18-1 – La volonté des associés s\'exprime par des décisions collectives qui obligent tous les associés, qu\'ils aient ou non pris part.')]));
  sep();
  a.push(para([text('18-2- les décisions collectives sont prises, au choix de la gérance, soit en assemblée, soit par consultation écrite, sauf dans les cas où la loi impose la tenue d\'une Assemblée.')]));
  sep();
  a.push(para([text('18-3- l\'assemblée est convoquée par le ou les gérants individuellement ou collectivement ou, à défaut par le commissaire aux comptes, s\'il en existe un, ou, encore par mandataire désigné en justice à la demande de tout associé.')]));
  a.push(para([text('Pendant la liquidation, les assemblées sont convoquées par le ou les liquidateurs.')]));
  a.push(para([text('Les assemblées sont réunies au lieu indiqué dans la convocation. La convocation est faite par lettre recommandée avec demande d\'avis de réception ou par lettre au porteur contre récépissé adressé à chacun des associés, quinze (15) jours au moins avant la date de la réunion. Celle-ci indique l\'ordre du jour.')]));
  a.push(para([text('L\'assemblée est présidée par le gérant ou par l\'un des gérants. Si aucun des gérants n\'est associé, elle est présidée par l\'associé présent ou acceptant qui possède ou représente le plus grand nombre de parts. Si deux associés qui possèdent ou représentent le même nombre de parts sont acceptants, la présidence de l\'assemblée est assurée par le plus âgé.')]));
  a.push(para([text('La délibération est constatée par un procès-verbal qui indique la date et le lieu de la réunion, les noms et prénoms des associés présents du nombre de parts sociales détenues par chacun, les documents et rapports soumis à l\'Assemblée, un résumé des débats, le texte des résolutions mises aux voix et le résultat des votes. Les procès-verbaux sont signés par chacun des associés présents.')]));
  sep();
  a.push(para([text('18-4- en cas de consultation écrite, le texte des résolutions proposées ainsi que les documents nécessaires à l\'information des associés sont adressés à chacun d\'eux par lettre recommandée avec demande d\'avis de réception ou par lettre au porteur contre récépissé. Les associés disposent d\'un délai minimal de quinze (15) jours, à compter de la date de réception des projets des résolutions pour émettre leur vote par écrit.')]));
  a.push(para([text('La réponse est faite par lettre recommandée avec demande d\'avis de réception ou par lettre contre récépissé. Tout associé n\'ayant pas répondu dans le délai ci-dessus est considéré comme s\'étant abstenu.')]));
  a.push(para([text('La consultation est mentionnée dans un procès-verbal, auquel est annexée la réponse de chaque associé.')]));
  sep();
  a.push(para([text('18-5- chaque associé à le droit de participer aux décisions et dispose d\'un nombre de voix égal à celui des parts sociales qu\'il possède.')]));
  sep();
  a.push(para([text('18-6- un associé peut se faire représenter par son conjoint à moins que la société ne comprenne que les deux époux. Sauf si les associés sont au nombre de deux, un associé peut se faire représenter par un autre associé.')]));
  a.push(para([text('Tout associé peut se faire représenter par la personne de son choix.')]));

  // ART 19 - DECISIONS COLLECTIVES ORDINAIRES
  art('19', 'DECISION COLLECTIVES ORDINAIRES');
  a.push(para([text('Sont qualifiées d\'ordinaires, les décisions des associés ayant pour but de statuer sur les états financiers de synthèse, d\'autoriser la gérance à effectuer les opérations subordonnées dans les statuts à l\'accord préalable des associés, de nommer et de remplacer les gérants et, le cas échéant, le commissaire aux comptes, d\'approuver les conventions intervenues entre la société et les gérants et associés et plus généralement de statuer sur toutes les questions qui n\'entraînent pas modification des statuts.')]));
  a.push(para([text('Ces décisions sont valablement adoptées par un ou plusieurs associés représentant plus de la moitié des parts sociales. Si cette majorité n\'est pas obtenue, les associés sont, selon le cas, convoqués ou consultés une seconde fois, et les décisions sont prises à la majorité des votes émis, quel que soit le nombre de votants.')]));
  a.push(para([text('Toutefois, la révocation des gérants doit toujours être décidée à la majorité absolue.')]));

  // ART 20 - DECISIONS EXTRAORDINAIRES
  art('20', 'DECISIONS COLLECTIVES EXTRAORDINAIRES');
  a.push(para([text('Sont qualifiées d\'extraordinaires, les décisions des associés ayant pour objet de statuer sur la modification des statuts, sous réserve des exceptions prévues par la loi.')]));
  a.push(para([text('Les modifications des statuts sont adoptées par les associés représentant au moins les trois quarts (3/4) des parts sociales.')]));
  a.push(para([text('Toutefois, l\'unanimité est requise dans les cas suivants :')]));
  a.push(para([text('- augmentation des engagements des associés ;')]));
  a.push(para([text('- transformation de la société en société en nom collectif ;')]));
  a.push(para([text('- transfert du siège social dans un Etat autre qu\'un Etat partie au Traité OHADA ;')]));
  a.push(para([text('La décision d\'augmenter le capital social par incorporation de bénéfices, de réserves ou de primes d\'apports, d\'émission ou de fusion est prise par les associés représentant au moins la moitié des parts sociales.')]));

  // ART 21 - DROIT DE COMMUNICATION
  artC('21', 'DROIT DE COMMUNICATION DES ASSOCIES');
  a.push(para([text('Lors de toute consultation des associés, chacun d\'eux a le droit d\'obtenir communication des documents et informations nécessaires pour lui permettre de se prononcer en connaissance de cause et de porter un jugement sur la gestion de la société.')]));
  a.push(para([text('La nature de ces documents et les conditions de leur envoi ou mise à disposition sont déterminées par la loi.')]));

  // ART 22 - COMPTES SOCIAUX
  artC('22', 'COMPTES SOCIAUX');
  a.push(para([text('A la clôture de chaque exercice, le gérant établit et arrête les états financiers de synthèse conformément aux dispositions de l\'Acte uniforme portant organisation et harmonisation des comptabilités.')]));
  a.push(para([text('Le gérant établit un rapport de gestion dans lequel il expose la situation de la société durant l\'exercice écoulé, son évolution prévisible et, en particulier les perspectives de continuation de l\'activité, l\'évolution de la situation de trésorerie et le plan de financement.')]));
  a.push(para([text('Ces documents ainsi que les textes des résolutions proposées et, le cas échéant, les rapports du commissaire aux comptes sont communiqués aux associés dans les conditions et délais prévus par les dispositions légales et réglementaires.')]));
  a.push(para([text('A compter de cette communication, tout associé à la possibilité de poser par écrit des questions auxquelles le gérant sera tenu de répondre au cours de l\'Assemblée.')]));
  a.push(para([text('Une assemblée générale appelée à statuer sur les comptes de l\'exercice écoulé doit être réunie chaque année dans les six (6) mois de la clôture de l\'exercice ou, en cas de prolongation, dans le délai fixé par décision de justice.')]));

  // ART 23 - AFFECTATION DES RESULTATS
  artC('23', 'AFFECTATION DES RESULTATS');
  a.push(para([text('Après approbation des comptes et constatations de l\'existence d\'un bénéfice distribuable, l\'Assemblée Générale détermine la part attribuée aux associés sous forme de dividende.')]));
  a.push(para([text('Il est pratiqué sur le bénéfice de l\'exercice diminué, le cas échéant, des pertes antérieures, une dotation égale à un dixième au moins affectée à la formation d\'un fonds de réserve dit « réserve légale ». Cette dotation cesse d\'être obligatoire lorsque la réserve atteint le cinquième du montant du capital social.')]));
  a.push(para([text('Les sommes dont la mise en distribution est décidée, sont réparties entre les associés titulaires de parts, proportionnellement au nombre de leurs parts.')]));
  a.push(para([text('L\'assemblée générale a la faculté de constituer tous postes de réserves.')]));
  a.push(para([text('Elle peut procéder à la distribution de tout ou partie des réserves à la condition qu\'il ne s\'agisse pas de réserves déclarées indisponibles par la loi ou par les statuts. Dans ce cas, elle indique expressément les postes de réserve sur lesquels les prélèvements sont effectués.')]));
  a.push(para([text('La société est tenue de déposer au Registre du Commerce et du Crédit Mobilier, du lieu du siège social dans le mois qui suit leur approbation par les organes compétents, les états financiers de synthèse, à savoir le bilan, le compte de résultat, le tableau des ressources et des emplois et l\'état annexé de l\'exercice écoulé.')]));

  // ART 24 - VARIATION DES CAPITAUX PROPRES
  artC('24', 'VARIATION DES CAPITAUX PROPRES');
  a.push(para([text('Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le gérant ou, le cas échéant, le commissaire aux comptes doit dans les quatre (4) mois qui suivent l\'approbation des comptes ayant fait apparaître cette perte, consulter les associés sur l\'opportunité de prononcer la dissolution anticipée de la société.')]));
  a.push(para([text('Si la dissolution est écartée, la société est tenue, dans les deux (2) ans qui suivent la date de clôture de l\'exercice déficitaire, de reconstituer ses capitaux propres jusqu\'à ce que ceux-ci soient à la hauteur de la moitié au moins du capital social.')]));
  a.push(para([text('A défaut, elle doit réduire son capital d\'un montant au moins égal à celui des pertes qui n\'ont pu être imputées sur les réserves, à la condition que cette réduction du capital n\'ait pas pour effet de réduire le capital à un montant inférieur à celui du capital légal.')]));
  a.push(para([text('A défaut par le gérant ou le commissaire aux comptes de provoquer cette décision ou si les associés n\'ont pu délibérer valablement, tout intéressé peut demander à la juridiction compétente de prononcer la dissolution de la société. Il en est de même si la reconstitution des capitaux propres n\'est pas intervenue dans les délais prescrits.')]));

  // ART 25 - CONTROLE DES COMPTES
  artC('25', 'CONTROLE DES COMPTES');
  a.push(para([text('Un ou plusieurs commissaires aux comptes titulaires et suppléants seront désignés lorsque qu\'à la clôture d\'un exercice social, la société remplit deux des conditions suivantes :')]));
  a.push(para([text('- total du bilan supérieur à cent vingt-cinq millions (125 000 000) de francs CFA ;')], { indent: { left: 720 } }));
  a.push(para([text('- chiffre d\'affaire annuel supérieur à deux cent cinquante millions (250 000 000) de francs CFA ;')], { indent: { left: 720 } }));
  a.push(para([text('- effectif permanent supérieur à cinquante (50) personnes ;')], { indent: { left: 720 } }));
  a.push(para([text('Le commissaire aux comptes est nommé pour trois (3) exercices par un ou plusieurs associés représentant plus de la moitié du capital.')]));
  a.push(para([text('La société n\'est plus tenue de désigner un commissaire aux comptes dès lors qu\'elle n\'a pas rempli deux (2) des conditions fixées ci-dessus pendant les (2) exercices précédant l\'expiration du mandat du commissaire aux comptes.')]));

  // ART 26 - DISSOLUTION
  art('26', 'DISSOLUTION');
  a.push(para([text('La société à responsabilité limitée est dissoute pour les causes communes à toutes sociétés.')]));
  a.push(para([text('La dissolution de la société entraîne sa mise en liquidation. Le ou les gérants en fonction lors de la dissolution exercent les fonctions de liquidateurs, à moins qu\'une décision collective des associés ne désigne un ou plusieurs autres liquidateurs, choisis parmi les associés ou les tiers. Les pouvoirs du liquidateur ou de chacun d\'eux, s\'ils sont plusieurs, sont déterminés par la collectivité des associés.')]));
  a.push(para([text('Le boni de liquidation est réparti entre les associés au prorata du nombre de parts qu\'ils détiennent.')]));
  a.push(para([text('Si toutes les parts sociales sont réunies en une seule main, l\'expiration de la société ou sa dissolution pour quelque cause que ce soit, entraîne la transmission universelle du patrimoine social à l\'associé unique, sans qu\'il y ait lieu à liquidation, sous réserve du droit d\'opposition des créanciers.')]));

  // ART 27 - CONTESTATIONS
  artC('27', 'CONTESTATIONS ENTRE ASSOCIES OU ENTRE UN OU PLUSIEURS ASSOCIES ET LA SOCIETE');
  a.push(para([bold('Variante 1. Droit commun')]));
  a.push(para([text('Les contestations relatives aux affaires de la société survenant pendant la vie de la société ou au cours de sa liquidation, entre les associés ou entre un ou plusieurs associés et la société, sont soumises au tribunal chargé des affaires commerciales.')]));
  sep();
  a.push(para([bold('Variante 2. Arbitrage')]));
  a.push(para([text('Les contestations relatives aux affaires, survenant pendant la durée de société ou au cours de sa liquidation, entre les associés ou entre un ou plusieurs associés et la société, sont soumises à l\'arbitrage conformément aux dispositions de l\'Acte Uniforme de l\'OHADA s\'y rapportant.')]));

  // ART 28 - ENGAGEMENTS
  artC('28', 'ENGAGEMENTS POUR LE COMPTE DE LA SOCIETE');
  a.push(para([text('Un état des actes accomplis par les fondateurs pour le compte de la société en formation, avec indication de l\'engagement qui en résulterait, sera présenté à la société qui s\'engage à les reprendre.')]));
  a.push(para([text('En outre, les soussignés donnent mandat à {gerant_nom_complet}, à l\'effet de prendre les engagements suivants au nom et pour le compte de la société.')]));

  // ART 29 - FRAIS
  artC('29', 'FRAIS');
  a.push(para([text('Les frais, droits et honoraires des présents Statuts sont à la charge de la société.')]));

  // ART 30 - ELECTION DE DOMICILE
  artC('30', 'ELECTION DE DOMICILE');
  a.push(para([text('Pour l\'exécution des présentes et de leurs suites, les parties déclarent faire élection de domicile au siège sociale.')]));

  // ART 31 - POUVOIRS
  artC('31', 'POUVOIRS');
  a.push(para([text('Les associés donnent tous pouvoirs à {gerant_identite_premier}, à l\'effet de procéder à l\'enregistrement des présents statuts, accomplir les formalités d\'immatriculation au Registre du Commerce et du Crédit Mobilier, et pour les besoins de formalités, de signer tout acte et en donner bonne et valable décharge.')]));

  return a;
};

// ============================================================
// BLOC SIGNATURE
// ============================================================

const GREY_HEADER = { fill: 'BFBFBF', color: 'auto' };

const createSignatureBlock = () => [
  // "En Deux..." en gras, keepNext pour rester avec le bloc suivant
  new Paragraph({
    children: [bold('En Deux (2) exemplaires originaux')],
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120 },
    keepNext: true,
  }),
  // "Fait à..." centré, AVANT le tableau, keepNext pour coller au tableau
  new Paragraph({
    children: [text('Fait à  {ville}, le {date_constitution}')],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 600 },
    keepNext: true,
  }),
  // Tableau signatures : en-tête gris + une ligne par associé (boucle docxtemplater)
  new Table({
    rows: [
      // Ligne d'en-tête : fond gris, texte noir gras centré
      new TableRow({
        height: { value: 500, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            children: [centerPara([bold('NOMS DES ASSOCIES')])],
            borders: FULL_BORDER,
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: GREY_HEADER,
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [centerPara([bold('SIGNATURES')])],
            borders: FULL_BORDER,
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: GREY_HEADER,
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
      // Ligne boucle docxtemplater : une ligne générée par associé
      // {#tableau_signatures} dans cellule 1, {/tableau_signatures} dans cellule 2
      new TableRow({
        height: { value: 1000, rule: HeightRule.ATLEAST },
        cantSplit: true,
        children: [
          new TableCell({
            children: [centerPara([text('{#tableau_signatures}'), bold('{nom}')])],
            borders: FULL_BORDER,
            width: { size: 60, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [centerPara([text('{/tableau_signatures}')])],
            borders: FULL_BORDER,
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  }),
];

// ============================================================
// DOCUMENT
// ============================================================

// Bordure de page conforme au modèle de référence
const PAGE_BORDERS = {
  pageBorderTop:    { style: BorderStyle.THIN_THICK_SMALL_GAP,  size: 24, space: 24, color: '000000' },
  pageBorderLeft:   { style: BorderStyle.THIN_THICK_SMALL_GAP,  size: 24, space: 24, color: '000000' },
  pageBorderBottom: { style: BorderStyle.THICK_THIN_SMALL_GAP,  size: 24, space: 24, color: '000000' },
  pageBorderRight:  { style: BorderStyle.THICK_THIN_SMALL_GAP,  size: 24, space: 24, color: '000000' },
};

const createDocument = () => {
  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: FONT_SIZE },
          paragraph: { spacing: { after: 200, line: 276, lineRule: 'auto' }, alignment: AlignmentType.JUSTIFIED },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
            borders: PAGE_BORDERS,
          },
        },
        children: createCoverPage(),
      },
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 720, left: 1440, right: 1440 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
            borders: PAGE_BORDERS,
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
  console.log('Création du template DOCX des Statuts SARL Pluripersonnelle...');

  const doc = createDocument();
  const buffer = await Packer.toBuffer(doc);

  const outputPath = path.join(__dirname, '../templates/statuts_sarl_pluri_template.docx');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Template généré: ${outputPath}`);
  console.log(`Taille: ${(buffer.length / 1024).toFixed(1)} Ko`);
};

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
