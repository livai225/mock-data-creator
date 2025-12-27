// Templates de documents pour la génération
// Basés sur les templates du generator mais adaptés pour le backend

/**
 * Convertir un nombre en lettres (français)
 */
const numberToWords = (num) => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  if (num === 0) return 'zéro';
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (ten === 7 || ten === 9) {
      return tens[ten] + (one > 0 ? '-' + ones[10 + one] : '');
    }
    return tens[ten] + (one > 0 ? '-' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return (hundred === 1 ? 'cent' : ones[hundred] + ' cent') + 
           (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (thousand === 1 ? 'mille' : numberToWords(thousand) + ' mille') + 
           (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  return num.toString();
};

/**
 * Formater une date au format français
 */
const formatDate = (dateString) => {
  if (!dateString) return '[DATE]';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Template: Statuts SARL (Version complète avec tous les articles)
 */
export const generateStatutsSARL = (company, associates, managers) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital)).toUpperCase();
  const duree = company.duree_societe || 99;
  const dureeWords = numberToWords(duree);
  
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantDuree = gerant?.duree_mandat || 99;
  const gerantDureeWords = numberToWords(gerantDuree);
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || 'CNI';
  const gerantNumId = gerant?.numero_identite || '[NUMÉRO]';
  const gerantDateDelivranceId = gerant?.date_delivrance_id ? formatDate(gerant.date_delivrance_id) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = gerant?.date_validite_id ? formatDate(gerant.date_validite_id) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || 'la république de Côte d\'Ivoire';
  
  const isUnipersonnelle = !associates || associates.length <= 1;
  const nombreParts = associates?.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) || Math.floor(capital / 5000);
  const valeurPart = capital / nombreParts;
  
  // Construire la liste des associés
  let listeAssocies = '';
  let listeApports = '';
  let listeParts = '';
  let totalApports = 0;
  
  if (associates && associates.length > 0) {
    associates.forEach((associe, index) => {
      const parts = parseInt(associe.parts) || 0;
      const apport = (capital * parts) / nombreParts;
      totalApports += apport;
      const debutParts = index === 0 ? 1 : associates.slice(0, index).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) + 1;
      const finParts = associates.slice(0, index + 1).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0);
      
      listeAssocies += `M. ${associe.name || '[NOM ASSOCIÉ]'}\n`;
      listeApports += `M. ${associe.name || '[NOM ASSOCIÉ]'}\n\n${apport.toLocaleString('fr-FR')} F CFA\n\n`;
      listeParts += `M. ${associe.name || '[NOM ASSOCIÉ]'}\n\n${parts} parts sociales numérotées de ${debutParts} à ${finParts} inclus, en rémunération de son apport exclusif en numéraire ci-dessus\n\n`;
    });
  } else {
    listeAssocies = `M. ${gerantNom}\n`;
    listeApports = `M. ${gerantNom}\n\n${capital.toLocaleString('fr-FR')} F CFA\n\n`;
    listeParts = `M. ${gerantNom}\n\n${nombreParts} parts sociales numérotées de 1 à ${nombreParts} inclus, en rémunération de son apport exclusif en numéraire ci-dessus\n\n`;
    totalApports = capital;
  }
  
  const annee = new Date().getFullYear();
  const anneeWords = numberToWords(annee);
  const dateActuelle = formatDate(new Date().toISOString());
  
  // Construire l'objet social complet
  const objetSocial = company.activity || '[OBJET SOCIAL]';
  const objetSocialComplet = `${objetSocial}

- l'acquisition, la location et la vente de tous biens meubles et immeubles.

- l'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.

- la prise en location gérance de tous fonds de commerce.

- la prise de participation dans toute société existante ou devant être créée

- et généralement, toute opérations financières, commerciales, industrielles, mobilières et immobilière, se rapportant directement ou indirectement à l'objet social ou pouvant en faciliter l'extension ou le développement.`;
  
  return `
STATUTS

SOCIÉTÉ À RESPONSABILITÉ LIMITÉE

${company.company_name || '[NOM SOCIÉTÉ]'}

${company.sigle ? `Sigle : ${company.sigle}` : ''}

AYANT SON SIEGE SOCIAL A ${(company.address || '[ADRESSE]').toUpperCase()}, ${(company.city || 'ABIDJAN').toUpperCase()}

L'An ${anneeWords},

Le ${dateActuelle}

Le soussigné${isUnipersonnelle ? '' : 's'},

${isUnipersonnelle ? 
  `M. ${gerantNom}, ${gerantProfession}, résident à ${gerantAdresse} de nationalité ${gerantNationalite} né(e) le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${gerantTypeId} ${gerantNumId} délivré(e) le ${gerantDateDelivranceId} et valable ${gerantDateValiditeId} par ${gerantLieuDelivranceId}.` :
  associates.map(a => `M. ${a.name || '[NOM ASSOCIÉ]'}`).join('\n\n')
}

${isUnipersonnelle ? 'A établi' : 'Ont établi'} par les présentes, les statuts de la Société à Responsabilité Limitée dont la teneur suit :

TITRE I : DISPOSITIONS GENERALES

ARTICLE 1- FORME

Il est constitué par ${isUnipersonnelle ? 'le soussigné' : 'les soussignés'}, une Société à Responsabilité Limitée devant exister entre ${isUnipersonnelle ? 'lui' : 'eux'} et tous propriétaires de parts sociales ultérieures, qui sera régie par l'Acte Uniforme révisé de l'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et les présents statuts.

ARTICLE 2- DENOMINATION

La société a pour dénomination : ${company.company_name || '[NOM SOCIÉTÉ]'}

La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie immédiatement en caractère lisible de l'indication Société à Responsabilité Limitée ou SARL, du montant de son capital social, de l'adresse de son siège social et de la mention de son immatriculation au registre du commerce et du Crédit Mobilier.

ARTICLE 3- OBJET

La société a pour objet en COTE D'IVOIRE :

${objetSocialComplet}

ARTICLE 4- SIEGE SOCIAL

Le siège social est fixé à : ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

Il peut être transféré dans les limites du territoire de la République de COTE D'IVOIRE par décision de la gérance qui modifie en conséquence les statuts, sous réserve de la ratification de cette décision par la plus prochaine Assemblée Générale Ordinaire.

ARTICLE 5- DUREE

La durée de la société est de ${dureeWords} (${duree}) années, sauf dissolution anticipée ou prorogation.

ARTICLE 6- EXERCICE SOCIAL

L'exercice social commence le premier janvier et se termine le trente et-un décembre de chaque année.

Par exception, le premier exercice sera clos le trente et un décembre de l'année suivante si la société commence ses activités au-delà des six premiers mois de l'année en cours.

ARTICLE 7-APPORTS

Apports en numéraires

Lors de la constitution, ${isUnipersonnelle ? 'le soussigné a fait' : 'les soussignés ont fait'} apport à la société, à savoir :

IDENTITE DES APPORTEURS

MONTANT APPORT EN NUMERAIRE

${listeApports}

Total des apports en numéraire : ${totalApports.toLocaleString('fr-FR')} de francs CFA,

${totalApports.toLocaleString('fr-FR')} F CFA

Les apports en numéraire de ${capitalWords} de francs CFA (${capital.toLocaleString('fr-FR')}) F CFA correspondent à ${nombreParts} parts sociales de ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA entièrement souscrites et libérée intégralement, La somme correspondante a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à [NOM BANQUE]

ARTICLE 8- CAPITAL SOCIAL

Le capital social est fixé à la somme de F CFA ${capital.toLocaleString('fr-FR')} divisé en ${nombreParts} parts sociales de F CFA ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}, entièrement souscrites et libérées intégralement, numérotées de 1 à ${nombreParts}, attribuées ${isUnipersonnelle ? 'à l\'associé unique' : 'aux associés'}, à savoir :

IDENTITE DES ASSOCIES

CONCURRENCE DES PARTS

${listeParts}

TOTAL EGAL au nombre de parts composant le capital social, soit ${nombreParts} parts sociales, ci-contre

${nombreParts} PARTS

ARTICLE 9- MODIFICATION DU CAPITAL

${isUnipersonnelle ? 
  `1. Le capital social peut être augmenté, par décision extraordinaire de l'associé unique, soit par émission de parts nouvelles, soit par majoration du nominal des parts existantes.

Les parts nouvelles sont libérées soit en espèces, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices, soit par apport en nature.

Le capital social peut être réduit, soit par la diminution de la valeur nominale des parts, soit par diminution du nombre de parts.

La réduction du capital est autorisée ou décidée par l'associé unique qui peut déléguer à la gérance les pouvoirs nécessaires pour la réaliser.` :
  `9-1- Le capital social peut être augmenté, par décision extraordinaire des associés, soit par émission de parts nouvelles, soit par majoration du nominal des parts existantes.

Les parts nouvelles sont libérées soit en espèce, soit par compensation avec des créances certaines, liquides et exigibles sur la société, soit par incorporation de réserves, bénéfices, soit par apport en nature.

9-2 – En cas d'augmentation de capital, les attributaires de parts nouvelles, s'ils n'ont pas déjà la qualité d'associés, devront être agréés dans les conditions fixées à l'article 11 ci-après.

9-3 – En cas d'augmentation de capital par voie d'apports en numéraire, chacun des associés a, proportionnellement au nombre de parts qu'il possède, un droit de préférence à la souscription des parts nouvelles représentatives de l'augmentation de capital.

Le droit de souscription attaché aux parts anciennes peut être cédé sous réserve de l'agrément du cessionnaire dans les conditions prévues à l'Article 11 ci-après.

Les associés pourront, lors de la décision afférente à l'augmentation de capital, renoncer, en tout ou en partie, à leur droit préférentiel de souscription.

La collectivité des associés peut également décider la suppression de ce droit.

9-4 Dans tous les cas, si l'opération fait apparaître des rompus, les associés feront leur affaire personnelle de toute acquisition ou cession de droits nécessaires.

9-5 Le capital social peut être réduit, soit par la diminution de la valeur nominale des parts, soit par la diminution du nombre de parts.

La réduction du capital est autorisée ou décidée par l'Assemblée Générale Extraordinaire qui peut déléguer à la gérance les pouvoirs nécessaires pour la réaliser.`
}

ARTICLE 10 : DROITS DES PARTS

Chaque part sociale confère à son propriétaire un droit égal dans les bénéfices de la société et dans tout l'actif social.

${!isUnipersonnelle ? `ARTICLE 11- CESSION DE PARTS ENTRE VIFS

11-1- Forme

Toute cession de parts sociales doit être constatée par écrit. Elle n'est opposable à la société qu'après accomplissement des formalités suivantes :

- signification de la cession à la société par acte extrajudiciaire ;

- acceptation de la cession par la société dans un acte authentique ;

- dépôt d'un original de l'acte de cession au siège social contre remise par le gérant d'une attestation de ce dépôt.

La cession n'est opposable aux tiers qu'après l'accomplissement de l'une des formalités ci-dessus et modification des statuts et publicité au registre du commerce et du crédit mobilier.

11-2- Cessions entre associés.

Les parts sociales sont librement cessibles entre associés.

11-3 - Cessions aux conjoints, ascendants ou descendants

Les parts sociales sont librement cessibles entre conjoint, ascendants ou descendants.

11-4- Cessions à des tiers

Les parts ne peuvent être cédées à des tiers qu'avec le consentement de la majorité des associés représentant au moins les trois quarts (3/4) des parts sociales.

Le projet de cession est notifié par l'associé cédant à la société et à chacun des associés par acte extrajudiciaire. Si la société n'a pas fait connaître sa décision dans le délai de trois (3) mois à compter de la dernière des notifications, le consentement à la cession est réputée acquis.

Si la société refuse de consentir à la cession, les associés sont tenus, dans les trois (3) mois de la notification du refus, d'acquérir les parts à un prix qui, à défaut d'accord entre les parties, est fixé par un expert nommé par le président de la juridiction compétente à la demande de la partie la plus diligente. Le délai de trois (3) mois peut être prolongé une seule fois par ordonnance du président de la juridiction compétente, sans que cette prolongation puisse excéder cent vingt (120) jours.

La société peut également, avec le consentement du cédant, décider, dans le même délai, de réduire son capital du montant de la valeur nominale desdites parts et de racheter ces parts au prix déterminé dans les conditions prévues ci-dessus. Si, à l'expiration du délai imparti, la société n'a pas racheté ou fait racheter les parts, l'associé peut réaliser la cession initialement prévue.

Les dispositions qui précèdent sont applicables à tous les cas de cessions, y compris en cas d'apport au titre d'une fusion ou d'une scission ou encore à titre d'attribution en nature à la liquidation d'une autre société.

ARTICLE 12- TRANSMISSION DE PARTS PAR DECES OU LIQUIDATION DE COMMUNAUTE

En cas de décès ou d'incapacité d'un associé, la société continue de plein droit entre les associés survivants et les héritiers et ayants droit de l'associé décédé, lesdits héritiers, ayants droit ou conjoint, devront justifier en outre de leur identité personnelle, de leur qualité héréditaire par la production de toutes pièces appropriées.

La gérance peut requérir de tout Notaire, la délivrance d'expéditions ou d'extraits de tous actes établissant lesdites qualités ; lesdits héritiers, ayants droit et conjoint désignent un mandataire chargé de les représenter auprès de la société pendant la durée de l'indivision.

ARTICLE 13- NANTISSEMENT DES PARTS SOCIALES

Le nantissement des parts est constaté par acte notarié ou sous seing privé, enregistré et signifié à la société et publié au registre du commerce et du crédit mobilier. Si la société a donné son consentement à un projet de nantissement de parts dans les conditions prévues pour les cessions de parts à des tiers, ce consentement emportera agrément du cessionnaire en cas de réalisation forcée des parts nanties, à moins que la société ne préfère, après la cession, racheter dans le délai les parts, en vue de réduire son capital.` : `ARTICLE 11 : NANTISSEMENT DES PARTS SOCIALES

Le nantissement des parts est constaté par acte notarié ou sous seing-privé enregistré et signifié à la société ou accepté par elle dans un acte authentique.`}

TITRE II : FONCTIONNEMENT-DISSOLUTION

${isUnipersonnelle ? `ARTICLE 12 : COMPTES COURANTS

L'associé unique peut laisser ou mettre à disposition de la société toutes sommes dont celle-ci peut avoir besoin. Les conditions de retrait ou de remboursement de ces sommes, ainsi que leur rémunération, sont déterminées soit par décision de l'associé unique, Soit par accords entre la gérance et l'intéressé. Dans le cas où l'avance est faite par l'associé unique gérant, ces conditions sont fixées par décision de ce dernier.` : `ARTICLE 14- COMPTES COURANTS

Les associés peuvent laisser ou mettre à disposition de la société toute somme dont celle -ci peut avoir besoin. Les conditions de retrait ou de remboursement de ces sommes, ainsi que leur rémunération, sont déterminées soit par décisions collectives des associés, soit par accord entre la gérance et l'intéressé, dans le cas où l'avance est faite par un gérant, ces conditions sont fixées par décision collectives des associés. Ces accords sont soumis à la procédure de contrôle des conventions passées entre la société et l'un de ses gérants ou associés en ce qui concerne la rémunération des sommes mises à disposition.`}

${isUnipersonnelle ? `ARTICLE 13 : GERANCE

1. La société est gérée par une ou plusieurs personnes physiques. L'associé unique peut être le gérant de la société. Le gérant est nommé pour une durée de ${gerantDureeWords} ans (${gerantDuree}ans). La nomination du gérant au cours de la vie sociale est décidée par l'associé unique.

Est nommé gérant de la société pour une durée de ${gerantDureeWords} ans (${gerantDuree}ans):

M. ${gerantNom}, ${gerantProfession}, résident à ${gerantAdresse} de nationalité ${gerantNationalite} né(e) le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${gerantTypeId} ${gerantNumId} délivré(e) le ${gerantDateDelivranceId} et valable ${gerantDateValiditeId} par ${gerantLieuDelivranceId} qui accepte.

Le gérant est nommé par décision de l'associe unique.

Le gérant peut démissionner de son mandat, mais seulement en prévenant l'associé unique au moins 3 mois à l'avance, par lettre recommandé avec demande d'avis de réception ou lettre au porteur contre récépissé.

Le gérant est révocable par décision de l'associé unique.

La rémunération du gérant est fixée par la décision qui le nomme.` : `ARTICLE 15- GERANCE

La société est gérée par une ou plusieurs personnes physiques, choisies parmi les associés ou en dehors d'eux. Elles sont nommées pour une durée de Quatre (4) ans et sont toujours rééligibles. La nomination des gérants au cours de la vie sociale est décidée à la majorité de plus de la moitié des parts.

Est nommée comme gérant pour une durée de Quatre (4) ans :

M. ${gerantNom}, ${gerantProfession}, résidant à ${gerantAdresse} de nationalité ${gerantNationalite}, né le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${gerantTypeId} ${gerantNumId} délivré(e) le ${gerantDateDelivranceId} et valable ${gerantDateValiditeId} par ${gerantLieuDelivranceId} qui accepte.

Les gérants reçoivent, à titre de rémunération de leurs fonctions et en compensation de la responsabilité attachée à la gestion de la société, un traitement dont le montant et les modalités de paiement sont déterminés par décision collective ordinaire des associés. Ce traitement peut être fixe ou proportionnel ou à la fois fixe et proportionnel selon des modalités arrêtées par les associés. Il peut comprendre, également, des avantages en nature et, éventuellement, être augmenté de gratifications exceptionnelles en cours ou en fin d'exercice social. Chaque gérant a droit au remboursement, sur justification, de ses frais de représentation et de déplacement.

Les sommes versées aux gérants à titre de rémunération ou en remboursement de frais sont inscrites en dépenses d'exploitation. Les gérants sont soumis aux obligations fixées par la loi et les règlements et notamment à l'établissement des comptes annuels et du rapport de gestion.

Les gérants peuvent démissionner de leur mandat, mais seulement en prévenant chacun des associés au moins trois (3) mois à l'avance, par lettre recommandée avec demande d'avis de réception ou lettre au porteur contre récépissé.

Les gérants sont révocables par décision des associés représentant plus de la moitié des parts sociales.

La rémunération des gérants est fixée par la décision qui les nomme.`}

${isUnipersonnelle ? `ARTICLE 14 : POUVOIRS DU GERANT

Le gérant peut faire tous les actes de gestion dans l'intérêt de la société.

Dans les rapports avec les tiers, le gérant est investi des pouvoirs les plus étendus pour agir en toute circonstance, au nom de la société, sous réserve des pouvoirs expressément attribués à l'associé unique par la loi.

La société est engagée, même par les actes du gérant qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que le tiers savait qu'il dépassait cet objet ou qu'il ne pouvait l'ignorer compte tenu des circonstances, étant exclu que la seule publication des statuts suffise constituer cette preuve.` : `ARTICLE 16- POUVOIRS DU GERANT

Dans les rapports entre associés, le gérant peut faire tous les actes de gestion dans l'intérêt de la société.

Dans le rapport avec les tiers le gérant est investi des pouvoirs les plus étendus pour agir en toutes circonstances, au nom de la société, sous réserve des pouvoirs expressément attribués aux associés par la loi.

La société est engagée, même par les actes du gérant qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que le tiers savait que l'acte dépassait cet objet ou qu'il ne pouvait l'ignorer compte tenu des circonstances, étant exclu que la seule publication des statuts suffise à constituer cette preuve.`}

${isUnipersonnelle ? `ARTICLE 15 : RESPONSABILITE DU GERANT

Le gérant est responsable, envers la société ou envers les tiers, soit des infractions aux dispositions législatives ou réglementaires applicables aux sociétés à responsabilité limitée, soit des violations des statuts, soit des fautes commises dans sa gestion. Si plusieurs gérants ont coopéré aux mêmes faits, le tribunal chargé des affaires commerciales détermine la part contributive de chacun dans la réparation du dommage.

Aucune décision de l'associé unique ne peut avoir pour effet d'éteindre une action en responsabilité contre les gérants pour faute commise dans l'accomplissement de leur mandat.` : `ARTICLE 17- RESPONSABILITE DES GERANTS

Les gérants sont responsables, individuellement ou solidairement, selon le cas, envers la société ou envers les tiers, soit des infractions aux dispositions législatives ou réglementaires applicables aux sociétés à responsabilité limitée, soit des violations des statuts, soit de fautes commises dans leur gestion. Si plusieurs gérants ont coopéré aux mêmes faits, le tribunal chargé des affaires commerciales détermine la part contributive de chacun dans la réparation du dommage.

Aucune décision de l'Assemblée ne peut avoir pour effet d'éteindre une action en responsabilité contre les gérants pour faute commise dans l'accomplissement de leur mandat.

Assiduité – Non-concurrence- publicité

1-Assiduité :

Les gérants sont tenus de consacrer le temps et les soins nécessaires aux affaires sociales.

2- Non concurrence :

Tout gérant s'interdit, directement ou indirectement à quelque titre que ce soit, toute activité concurrente ou connexe à celle de la société et s'engage à informer les associés de la nature de toute activité professionnelle qu'il envisagerait d'entreprendre au cours de son mandat.

3- Publicité :

La nomination et la cessation des fonctions d'un gérant donnent lieu à publication dans les conditions prévues par la réglementation sur les sociétés commerciales.

Ni la société, ni les tiers ne peuvent pour se soustraire à leurs engagements, se prévaloir d'une irrégularité dans la nomination d'un gérant lorsque la nomination a été régulièrement publiée. La société ne peut se prévaloir, à l'égard des tiers, des nominations et cessation de fonctions d'un gérant, tant qu'elles n'ont pas été régulièrement publiées.

Un gérant qui a cessé ses fonctions peut exiger, par toute voie de droit, l'accomplissement de toute publicité rendue nécessaire par la cessation de ses fonctions.`}

${isUnipersonnelle ? `ARTICLE 16 : DECISIONS DE L'ASSOCIE UNIQUE

L'associé unique exerce les pouvoirs dévolus par l'Acte Uniforme relatif au droit des sociétés commerciales et du GIE.

L'associé unique ne peut déléguer ses pouvoirs. Ses décisions sont consignées dans un procès-verbal versé dans les archives de la société.` : `ARTICLE 18- DECISIONS COLLECTIVES

18-1 –La volonté des associés s'exprime par des décisions collectives qui obligent tous les associés, qu'ils aient ou non pris part.

18-2- les décisions collectives sont prises, au choix de la gérance, soit en assemblée, soit par consultation écrite, sauf dans les cas où la loi impose la tenue d'une Assemblée.

18-3- l'assemblée est convoquée par le ou les gérants individuellement ou collectivement ou, à défaut par le commissaire aux comptes, s'il en existe un, ou, encore par mandataire désigné en justice à la demande de tout associé.

Pendant la liquidation, les assemblées sont convoquées par le ou les liquidateurs.

Les assemblées sont réunies au lieu indiqué dans la convocation. La convocation est faite par lettre recommandée avec demande d'avis de réception ou par lettre au porteur contre récépissé adressé à chacun des associés, quinze (15) jours au moins avant la date de la réunion. Celle –ci indique l'ordre du jour.

L'assemblée est présidée par le gérant ou par l'un des gérants. Si aucun des gérants n'est associé, elle est présidée par l'associé présent ou acceptant qui possède où représente le plus grand nombre de parts. Si deux associés qui possèdent ou représentent le même nombre de parts sont acceptants, la présidence de l'assemblée est assurée par le plus âgé.

La délibération est constatée par un procès –verbal qui indique la date et le lieu de la réunion, les noms et prénoms des associés présents du nombre de parts sociales détenues par chacun, les documents et rapports soumis à l'Assemblée, un résumé des débats, le textes des résolutions mises aux voix et le résultat des votes. Les procès – verbaux sont signés par chacun des associés présents.

18-4- en cas de consultation écrite, le texte des résolutions proposées ainsi que les documents nécessaires à l'information des associés sont adressés à chacun d'eux par lettre recommandée avec demande d'avis de réception où par lettre au porteur contre récépissé. Les associés disposent d'un délai minimal de quinze (15) jours, à compter de la date de réception des projets des résolutions pour émettre leur vote par écrit.

La réponse est faite par lettre recommandée avec demande d'avis de réception ou par lettre contre récépissé. Tout associé n'ayant pas répondu dans le délai ci –dessus est considéré comme s'étant abstenu.

La consultation est mentionnée dans un procès-verbal, auquel est annexée la réponse de chaque associé.

18-5- chaque associé à le droit de participer aux décisions et dispose d'un nombre de voix égal à celui des parts sociales qu'il possède.

18-6- un associé peut se faire représenter par son conjoint à moins que la société ne comprenne que les deux époux. Sauf si les associés sont au nombre de deux, un associé peut se faire représenter par un autre associé.

Tout associé peut se faire représenter par la personne de son choix.

ARTICLE 19 DECISION COLLECTIVES ORDINAIRES

Sont qualifiées d'ordinaires, les décisions des associés ayant pour but de statuer sur les états financiers de synthèse, d'autoriser la gérance à effectuer les opérations subordonnées dans les statuts à l'accord préalable des associés, de nommer et de remplacer les gérants et, le cas échéant, le commissaire aux comptes, d'approuver les conventions intervenues entre la société et les gérants et associés et plus généralement de statuer sur toutes les questions qui n'entraînent pas modification des statuts.

Ces décisions sont valablement adoptées par un ou plusieurs associés représentant plus de la moitié des parts sociales. Si cette majorité n'est pas obtenue, les associés sont, selon le cas, convoqués ou consultés une seconde fois, et les décisions sont prises à la majorité des votes émis, quel que soit le nombre de votants.

Toutefois, la révocation des gérants doit toujours être décidée à la majorité absolue.

ARTICLE 20-DECISIONS COLLECTIVES EXTRAORDINAIRES

Sont qualifiées d'extraordinaires, les décisions des associés ayant pour objet de statuer sur la modification des statuts, sous réserve des exceptions prévues par la loi.

Les modifications des statuts sont adoptées par les associés représentant au moins les trois quarts (3/4) des parts sociales.

Toutefois, l'unanimité est requise dans les cas suivants :

augmentation des engagements des associés ;

transformation de la société en société en nom collectif ;

transfert du siège social dans un Etat autre qu'un Etat partie au Traité OHADA;

La décision d'augmenter le capital social par incorporation de bénéfices, de réserves ou de primes d'apports, d'émission ou de fusion est prise par les associés représentant au moins la moitié des parts sociales.

ARTICLE 21- DROIT DE COMMUNICATION DES ASSOCIES

Lors de toute consultation des associés, chacun d'eux a le droit d'obtenir communication des documents et informations nécessaires pour lui permettre de se prononcer en connaissance de cause et de porter un jugement sur la gestion de la société.

La nature de ces documents et les conditions de leur envoi ou mise à disposition sont déterminées par la loi.`}

${isUnipersonnelle ? `ARTICLE 17 : COMPTES SOCIAUX

A la clôture de chaque exercice, le gérant établit et arrête les états financiers de synthèse conformément aux dispositions de l'Acte Uniforme portant organisation et harmonisation des comptabilités.

Le gérant établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et, en particulier les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement.

Ces documents ainsi que les textes des résolutions proposées et, le cas échéant, les rapports du commissaire aux comptes sont communiqués à l'associé unique dans les conditions et délais prévus par les dispositions légales et réglementaires.

A compter de cette communication, l'associé unique à la possibilité de poser par écrit des questions auxquelles le gérant sera tenu de répondre.

L'associé unique est tenu de statuer sur les comptes de l'exercice écoulé dans les six mois de la clôture de l'exercice ou, en cas de prolongation, dans le délai fixé par décision de justice.` : `ARTICLE 22- COMPTES SOCIAUX

A la clôture de chaque exercice, le gérant établit et arrête les états financiers de synthèse conformément aux dispositions de l'Acte uniforme portant organisation et harmonisation des comptabilités.

Le gérant établit un rapport de gestion dans lequel il expose la situation de la société durant l'exercice écoulé, son évolution prévisible et, en particulier les perspectives de continuation de l'activité, l'évolution de la situation de trésorerie et le plan de financement.

Ces documents ainsi que les textes des résolutions proposées et, le cas échéant, les rapports du commissaire aux comptes sont communiqués aux associés dans les conditions et délais prévus par les dispositions légales et réglementaires.

A compter de cette communication, tout associé à la possibilité de poser par écrit des questions auxquelles le gérant sera tenu de répondre au cours de l'Assemblée.

Une assemblée générale appelée à statuer sur les comptes de l'exercice écoulé doit être réunie chaque année dans les six (6) mois de la clôture de l'exercice ou, en cas de prolongation, dans le délai fixé par décision de justice.`}

${isUnipersonnelle ? `ARTICLE 18 : AFFECTATION DES RESULTATS

Après approbation des comptes et constatations de l'existence d'un bénéfice distribuable, l'associé unique détermine la part attribuée sous forme de dividende.

Il est pratiqué sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures, une dotation égale à un dixième au moins affecté à la formation d'un fonds de réserve dit "réserve légale". Cette dotation cesse d'être obligatoire lorsque la réserve atteint le cinquième du montant du capital social.

L'associé unique a la faculté de constituer tous postes de réserves.

Il peut procéder à la distribution de tout ou partie des réserves à la condition qu'il ne s'agisse pas de réserves déclarées indisponibles par la loi ou par les statuts. Dans ce cas, il indique expressément les postes de réserve sur lesquels les prélèvements sont effectués. La société est tenue de déposer au Registre du Commerce et du Crédit Mobilier, du lieu du siège social dans le mois qui suit leur approbation par les organes compétents, les états financiers de synthèse, à savoir le bilan, le compte de résultat, le tableau des ressources et des emplois et l'état annexé de l'exercice écoulé.` : `ARTICLE 23- AFFECTATION DES RESULTATS

Après approbation des comptes et constatations de l'existence d'un bénéfice distribuable, l'Assemblée Générale détermine la part attribuée aux associés sous forme de dividende.

Il est pratiqué sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures, une dotation égale à un dixième au moins affectée à la formation d'un fonds de réserve dit « réserve légale ». Cette dotation cesse d'être obligatoire lorsque la réserve atteint le cinquième du montant du capital social.

Les sommes dont la mise en distribution est décidée, sont réparties entre les associés titulaires de parts, proportionnellement au nombre de leurs parts.

L'assemblée générale a la faculté de constituer tous postes de réserves.

Elle peut procéder à la distribution de tout ou partie des réserves à la condition qu'il ne s'agisse pas de réserves déclarées indisponibles par la loi ou par les statuts. Dans ce cas, elle indique expressément les postes de réserve sur lesquels les prélèvements sont effectués. La société est tenue de déposer au Registre du Commerce et du Crédit Mobilier, du lieu du siège social dans le mois qui suit leur approbation par les organes compétents, les états financiers de synthèse, à savoir le bilan, le compte de résultat, le tableau des ressources et des emplois et l'état annexé de l'exercice écoulé.`}

${isUnipersonnelle ? `ARTICLE 19 : VARIATION DES CAPITAUX PROPRES

Si du fait des pertes constatées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le gérant ou, le cas échéant, le commissaire aux comptes doit dans les quatre mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, consulter l'associé unique sur l'opportunité de prononcer la dissolution anticipée de la société.

Si la dissolution est écartée, la société est tenue, dans les deux ans qui suivent la date de clôture de l'exercice déficitaire, de reconstituer ses capitaux propres jusqu'à ce que ceux-ci soient à la hauteur de la moitié au moins du capital social.

A défaut, elle doit réduire son capital d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves, à la condition que cette réduction du capital n'ait pas pour effet de réduire le capital à un montant inférieur à celui du capital minimum légal.

A défaut par le gérant ou le commissaire aux comptes de provoquer cette décision, ou si l'associé unique n'a pu prendre de décision valablement, tout intéressé peut demander à la juridiction compétente de prononcer la dissolution de la société. Il en est de même si la reconstitution des capitaux propres n'est pas intervenue dans les délais prescrits.` : `ARTICLE 24- VARIATION DES CAPITAUX PROPRES

Si du fait des pertes contactées dans les états financiers de synthèse, les capitaux propres de la société deviennent inférieurs à la moitié du capital social, le gérant ou, le cas échéant, le commissaire aux comptes doit dans les quatre (4) mois qui suivent l'approbation des comptes ayant fait apparaître cette perte, consulter les associés sur l'opportunité de prononcer la dissolution anticipée de la société.

Si la dissolution est écartée, la société est tenue, dans les deux (2) ans qui suivent la date de clôture de l'exercice déficitaire, de reconstituer ses capitaux propres jusqu'à ce que ceux –ci soient à la hauteur de la moitié au moins du capital social.

A défaut, elle doit réduire son capital d'un montant au moins égal à celui des pertes qui n'ont pu être imputées sur les réserves, à la condition que cette réduction du capital n'ait pas pour effet de réduire le capital à un montant inférieur à celui du capital légal.

A défaut par le gérant ou le commissaire aux comptes de provoquer cette décision ou si les associés n'ont pu délibérer valablement, tout intéressé peut demander à la juridiction compétente de prononcer la dissolution de la société. Il en est de même si la reconstitution des capitaux propres n'est pas intervenue dans les délais prescrits.`}

${isUnipersonnelle ? `ARTICLE 20 : CONTROLE DES COMPTES

Un ou plusieurs commissaires aux comptes titulaires et suppléants seront désignés lorsque qu'à la clôture d'un exercice social, la société remplit deux des conditions suivantes :

total du bilan supérieur à cent vingt- cinq millions (125 000 000) de francs CFA ;

chiffre d'affaire annuel supérieur à deux cent cinquante millions (250 000 000) de francs CFA ;

effectif permanent supérieur à cinquante (50) personnes ;

Le commissaire aux comptes est nommé pour trois (3) exercices par un ou plusieurs associés représentant plus de la moitié du capital.

La société n'est plus tenue de désigner un commissaire aux comptes dès lors qu'elle n'a pas rempli deux (2) des conditions fixées ci-dessus pendant les (2) exercices précédant l'expiration du mandat du commissaire aux comptes.` : `ARTICLE 25- CONTROLE DES COMPTES

Un ou plusieurs commissaires aux comptes titulaires et suppléants seront désignés lorsque qu'à la clôture d'un exercice social, la société remplit deux des conditions suivantes :

total du bilan supérieur à cent vingt- cinq millions (125 000 000) de francs CFA ;

chiffre d'affaire annuel supérieur à deux cent cinquante millions (250 000 000) de francs CFA ;

effectif permanent supérieur à cinquante (50) personnes ;

Le commissaire aux comptes est nommé pour trois (3) exercices par un ou plusieurs associés représentant plus de la moitié du capital.

La société n'est plus tenue de désigner un commissaire aux comptes dès lors qu'elle n'a pas rempli deux (2) des conditions fixées ci-dessus pendant les (2) exercices précédant l'expiration du mandat du commissaire aux comptes.`}

${isUnipersonnelle ? `ARTICLE 21 : DISSOLUTION

La société à responsabilité limitée est dissoute pour les causes communes à toutes les sociétés. La dissolution de la société n'entraîne pas sa mise en liquidation.` : `ARTICLE 26-DISSOLUTION

La société à responsabilité limitée est dissoute pour les causes communes à toutes sociétés.

La dissolution de la société entraîne sa mise en liquidation. Le ou les gérants en fonction lors de la dissolution exercent les fonctions de liquidateurs, à moins qu'une décision collective des associés ne désigne un ou plusieurs autres liquidateurs, choisis parmi les associés ou les tiers. Les pouvoirs du liquidateur ou de chacun d'eux, s'ils sont plusieurs, sont déterminés par la collectivité des associés.

Le boni de liquidation est réparti entre les associés au prorata du nombre de parts qu'ils détiennent.

Si toutes les parts sociales sont réunies en une seule main, l'expiration de la société ou sa dissolution pour quelque cause que ce soit, entraîne la transmission universelle du patrimoine social à l'associé unique, sans qu'il y ait lieu à liquidation, sous réserve du droit d'opposition des créanciers.

ARTICLE 27- CONTESTATIONS ENTRE ASSOCIES OU ENTRE UN OU PLUSIEURS ASSOCIES ET LA SOCIETE

Les contestations relatives aux affaires de la société survenant pendant la vie de la société ou au cours de sa liquidation, entre les associés ou entre un ou plusieurs associés et la société, sont soumises au tribunal chargé des affaires commerciales.`}

${isUnipersonnelle ? `ARTICLE 22 : ENGAGEMENTS POUR LE COMPTE DE LA SOCIETE

1. Un état des actes accomplis par l'associé unique pour le compte de la société en formation, avec l'indication, de l'engagement qui en résulterait pour la société, est annexé aux présents statuts.

2. En outre, le soussigné se réserve le droit de prendre les engagements suivants au nom et pour le compte de la société : ${company.company_name || '[NOM SOCIÉTÉ]'}` : `ARTICLE 28 : ENGAGEMENTS POUR LE COMPTE DE LA SOCIETE

Un état des actes accomplis par les fondateurs pour le compte de la société en formation, avec indication de l'engagement qui en résulterait, sera présenté à la société qui s'engage à les reprendre.

En outre, les soussignés donnent mandat à M. ${gerantNom}, à l'effet de prendre les engagements suivants au nom et pour le compte de la société.`}

${isUnipersonnelle ? `ARTICLE 23 : FRAIS

Les frais, droits et honoraires des présents statuts sont à la charge de la société.` : `ARTICLE 29 : FRAIS

Les frais, droits et honoraires des présents Statuts sont à la charge de la société.`}

${isUnipersonnelle ? `ARTICLE 24 : ELECTION DE DOMICILE

Pour l'exécution des présentes et de leurs suites, le soussigné déclare faire élection de domicile au siège social.` : `ARTICLE 30 : ELECTION DE DOMICILE

Pour l'exécution des présentes et de leurs suites, les parties déclarent faire élection de domicile au siège sociale.`}

${isUnipersonnelle ? `ARTICLE 25 : POUVOIRS

L'associé donnent tous pouvoirs à M. ${gerantNom}, ${gerantProfession}, résident à ${gerantAdresse} de nationalité ${gerantNationalite} né(e) le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${gerantTypeId} ${gerantNumId} délivré(e) le ${gerantDateDelivranceId} et valable ${gerantDateValiditeId} par ${gerantLieuDelivranceId} de procéder à l'enregistrement des présents statuts, accomplir les formalités d'immatriculation au Registre du Commerce et du Crédit Mobilier, et pour les besoins de formalités, de signer tout acte et en donner bonne et valable décharge.` : `ARTICLE 31 : POUVOIRS

Les associés donnent tous pouvoirs à M. ${gerantNom}, ${gerantProfession}, résidant à ${gerantAdresse} de nationalité ${gerantNationalite}, né le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${gerantTypeId} ${gerantNumId} délivré(e) le ${gerantDateDelivranceId} et valable ${gerantDateValiditeId} par ${gerantLieuDelivranceId} à l'effet de procéder à l'enregistrement des présents statuts, accomplir les formalités d'immatriculation au Registre du Commerce et du Crédit Mobilier, et pour les besoins de formalités, de signer tout acte et en donner bonne et valable décharge.`}

Fait à ${company.city || 'Abidjan'}, le ${dateActuelle}

${isUnipersonnelle ? 'EN QUATRE (4) EXEMPLAIRES ORIGINAUX' : 'En Deux (2) exemplaires originaux'}

${isUnipersonnelle ? 
  `M. ${gerantNom}

Associé unique` :
  associates.map((a, index) => `M. ${a.name || '[NOM ASSOCIÉ]'}`).join('\n\n')
}
`;
};

/**
 * Template: Contrat de Bail Commercial
 */
export const generateContratBail = (company, bailleurData = {}) => {
  const gerant = company.managers && company.managers.length > 0 ? company.managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  
  // Utiliser lot et îlot des données si fournis, sinon extraire de l'adresse
  const lotNumero = bailleurData.lot || company.lot || '';
  const ilotNumero = bailleurData.ilot || company.ilot || '';
  
  const dureeBail = bailleurData.duree_bail || 1;
  const dureeBailWords = dureeBail === 1 ? 'un (01)' : `${numberToWords(dureeBail)} (${String(dureeBail).padStart(2, '0')})`;
  const dateDebut = bailleurData.date_debut ? formatDate(bailleurData.date_debut) : formatDate(new Date().toISOString());
  const dateFin = bailleurData.date_fin ? formatDate(bailleurData.date_fin) : '[DATE FIN]';
  const loyerMensuel = bailleurData.loyer_mensuel || 0;
  const loyerLettres = bailleurData.loyer_lettres || numberToWords(Math.floor(loyerMensuel));
  const cautionMois = bailleurData.caution_mois || 2;
  const avanceMois = bailleurData.avance_mois || 2;
  const garantieTotale = bailleurData.garantie_totale || (loyerMensuel * (cautionMois + avanceMois));
  const garantieTotaleWords = numberToWords(Math.floor(garantieTotale)).toUpperCase();
  
  return `
CONTRAT DE BAIL COMMERCIAL

Entre les soussignés :

${bailleurData.bailleur_nom || '[NOM DU BAILLEUR]'}, Téléphone : ${bailleurData.bailleur_telephone || '[TELEPHONE]'} Propriétaire, ci-après dénommé « le bailleur »

D'une part

Et

La société dénommée « ${company.company_name || '[NOM SOCIÉTÉ]'} » Représenté par son gérant Monsieur ${gerantNom} locataire ci-après dénommé « le preneur »

D'autre part.

Il a été dit et convenu ce qui suit :

Le bailleur loue et donne par les présentes au preneur, qui accepte, les locaux ci-après désignés sis à ${company.address || '[ADRESSE]'}, LOT ${lotNumero || '[LOT]'}, ILOT ${ilotNumero || '[ILOT]'} en vue de l'exploitation de la « ${company.company_name || '[NOM SOCIÉTÉ]'} ».

Article 1 : Désignation

Il est précisé que l'emplacement est livré nu, et que le preneur devra supporter le cout et les frais d'eaux, d'électricité, téléphone et en général, tous travaux d'aménagements.

Tel au surplus que le cout se poursuit et se comporte sans plus ample description, le preneur déclarant avoir vu. Visite et parfaitement connaitre les locaux loués, qu'il consent à occuper dans leur état actuel.

Article 2 : Durée

Le présent bail est conclu pour une durée de ${dureeBailWords} an${dureeBail > 1 ? 's' : ''} allant du ${dateDebut} au ${dateFin} à son expiration, le bail se renouvellera par tacite reconduction, sauf dénonciation par acte extra judiciaire, au plus tard TROIS (03) mois avant la date d'expiration de la période triennale concernée.

Article 3 : Renouvellement et cession

- Le preneur qui a droit au renouvellement de son bail, doit demander le renouvellement de celui-ci au bailleur, par écrit, au plus tard deux (2) mois avant la date d'expiration du bail.

- Le preneur qui n'a pas formé sa demande de renouvellement dans ce délai est déchu du droit de renouvellement du bail.

Le BAILLEUR qui n'a pas fait connaître sa réponse à la demande de renouvellement au plus tard UN (01) mois avant l'expiration du bail est réputé avoir accepté le principe du renouvellement de ce bail.

La partie qui entend résilier le bail doit donner congés, par acte extra judiciaire au moins SIX (06) mois à l'avance.

Article 4 : Obligation du bailleur

- Le bailleur fait procéder, à ses frais dans les locaux donnés à bail, à toutes les grosses réparations devenues nécessaires et urgentes.

Le bailleur délivre les locaux en bon état.

- Le bailleur autorise le preneur à apposer sur les façades extérieures des locaux les enseignes et plaques indicatrices relatives à son commerce.

Article 5 : Obligation du preneur

- Le preneur doit payer le loyer aux termes convenus, entre les mains du bailleur.

- Le preneur est tenu d'exploiter les locaux donnés à bail, en bon père de famille, et conformément à la destination prévue au bail, à défaut de convention écrite, suivant celle présumée d'après les circonstances.

Le preneur est tenu des réparations d'entretien ; il répond des dégradations ou des pertes dues à un défaut d'entretien en cours de bail.

Article 6 : Loyer

La présente location est consentie et acceptée moyennant un loyer mensuel de ${loyerLettres.charAt(0).toUpperCase() + loyerLettres.slice(1)} (${loyerMensuel.toLocaleString('fr-FR')}) francs CFA, payable à la fin du mois au plus tard le cinq (05) du mois suivant. De plus une garantie de ${garantieTotaleWords} (${garantieTotale.toLocaleString('fr-FR')} FCFA) dont ${numberToWords(cautionMois)} (${cautionMois}) mois de caution et ${numberToWords(avanceMois)} (${avanceMois}) mois d'avance.

Les parties conviennent que le prix fixé ci-dessus ne peut être révisé au cours du bail.

Dans le cas où il surviendrait une contestation sur le montant du loyer tel qu'il est défini par le présent bail, le preneur devra aviser le bailleur qui s'engage à s'en remettre à une expertise amiable.

Article 7 : Sous-location

Sauf stipulation contraire du bail, toute sous-location totale ou partielle est interdite.

Article 8 : Clause résolutoire

A défaut de paiement d'un seul terme de loyer ou en cas d'inexécution d'une clause du bail, le bailleur pourra demander à la juridiction compétente la résiliation du bail et l'expulsion du preneur, et de tous occupants de son chef, après avoir fait délivrer, par acte extrajudiciaire, une mise en demeure d'avoir à respecter les clauses et conditions du bail.

Article 9 : Election de domicile

En cas de litige, si aucun accord amiable n'est trouvé, le tribunal d'Abidjan sera seul compétent.

Fait en deux exemplaires et de bonne foi.

À ${bailleurData.lieu_signature || company.city || 'Abidjan'}, le ${formatDate(bailleurData.date_signature || new Date().toISOString())}

Le Bailleur                                    Le Preneur

_____________________                          _____________________
`;
};

/**
 * Template: Déclaration Souscription/Versement (DSV)
 */
export const generateDSV = (company, associates) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital));
  const dateSignature = formatDate(new Date().toISOString());
  const dateParts = dateSignature.split(' ');
  const dateJour = dateParts[0] || '';
  const annee = new Date().getFullYear();
  const anneeWords = numberToWords(annee);
  
  // Calculer le nombre de parts et la valeur nominale
  const totalParts = associates && associates.length > 0 
    ? associates.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0)
    : Math.floor(capital / 5000); // Par défaut, parts de 5000 FCFA
  const valeurPart = capital / totalParts;
  
  const gerant = company.managers && company.managers.length > 0 ? company.managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || 'CNI';
  const gerantNumId = gerant?.numero_identite || '[NUMÉRO]';
  const gerantDateDelivranceId = gerant?.date_delivrance_id ? formatDate(gerant.date_delivrance_id) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = gerant?.date_validite_id ? formatDate(gerant.date_validite_id) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || 'la république de Côte d\'Ivoire';
  
  // Construire l'objet social complet
  const objetSocial = company.activity || '[OBJET SOCIAL]';
  const objetSocialComplet = `${objetSocial}

- l'acquisition, la location et la vente de tous biens meubles et immeubles.

- l'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.

- la prise en location gérance de tous fonds de commerce.

- la prise de participation dans toute société existante ou devant être créée

- et généralement, toute opérations financières, commerciales, industrielles, mobilières et immobilière, se rapportant directement ou indirectement à l'objet social ou pouvant en faciliter l'extension ou le développement.`;
  
  // Construire le tableau des associés
  let tableauAssocies = '';
  let totalSouscrit = 0;
  let totalVerse = 0;
  
  if (associates && associates.length > 0) {
    tableauAssocies = associates.map((associe, index) => {
      const parts = parseInt(associe.parts) || 0;
      const montantSouscrit = (capital * parts) / totalParts;
      totalSouscrit += montantSouscrit;
      totalVerse += montantSouscrit;
      const debutParts = index === 0 ? 1 : associates.slice(0, index).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) + 1;
      const finParts = associates.slice(0, index + 1).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0);
      
      return `M. ${associe.name || '[NOM ASSOCIÉ]'}

${parts} parts numérotés de ${debutParts} à ${finParts} inclus

${valeurPart.toLocaleString('fr-FR')} FCFA

${montantSouscrit.toLocaleString('fr-FR')} CFA

${montantSouscrit.toLocaleString('fr-FR')} CFA`;
    }).join('\n\n');
  } else {
    tableauAssocies = `M. ${gerantNom}

${totalParts} parts numérotés de 1 à ${totalParts} inclus

${valeurPart.toLocaleString('fr-FR')} FCFA

${capital.toLocaleString('fr-FR')} CFA

${capital.toLocaleString('fr-FR')} CFA`;
    totalSouscrit = capital;
    totalVerse = capital;
  }
  
  const isUnipersonnelle = !associates || associates.length <= 1;
  
  return `
DSV DE LA SOCIETE « ${company.company_name || '[NOM SOCIÉTÉ]'} »

DECLARATION DE SOUSCRIPTION ET DE VERSEMENT

(cf Art 314 de l'Acte uniforme révisé du 30 janvier 2014, Art 6 de l'Ordonnance N° 2014-161 du 02 avril 2014 relative à la formes des statuts et au capital social de la société à responsabilité limitée)

L'An ${anneeWords},

Le ${dateJour}

Le soussigné,

M. ${gerantNom}, ${gerantProfession}, résident à ${gerantAdresse} de nationalité ${gerantNationalite} né(e) le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${gerantTypeId} ${gerantNumId} délivré(e) le ${gerantDateDelivranceId} et valable ${gerantDateValiditeId} par ${gerantLieuDelivranceId}.

EXPOSE PREALABLE

Par Acte sous seing Privé en date du ${dateJour},

Ont établi, les statuts de la Société à Responsabilité Limitée devant exister entre ${isUnipersonnelle ? 'lui' : 'eux'} et tous propriétaires de parts sociales ultérieures, dont les principales caractéristiques sont les suivantes :

1-FORME

La société constituée est une société à Responsabilité Limitée régie par les dispositions de l'Acte uniforme révisé de l'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et ses présents statuts.

2- DENOMINATION

La société a pour dénomination : ${company.company_name || '[NOM SOCIÉTÉ]'}

3- OBJET

La société a pour objet en CÔTE-D'IVOIRE :

${objetSocialComplet}

4- SIEGE SOCIAL

Le siège social est fixé à : ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

5- DUREE

La durée de la société est de ${numberToWords(company.duree_societe || 99)} (${company.duree_societe || 99}) années, sauf dissolution anticipée ou prorogation.

6- CAPITAL SOCIAL

Le capital social est fixé à la somme de ${capitalWords} Franc CFA (F CFA ${capital.toLocaleString('fr-FR')}) divisé en ${totalParts} parts sociales de F CFA ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}

II- CONSTATATION DE LA LIBERATION ET DU DEPOT DES FONDS PROVENANT DES PARTS SOCIALES

Les soussignées déclarent, que les souscriptions et les versements des fonds provenant de la libération des parts sociales ont été effectués comme suit :

Identité des associés et leur domicile

Nombre de parts Souscrites

Montant nominal

Montant total souscrit F CFA

Versement effectué F CFA

${tableauAssocies}

TOTAL

${totalParts} parts

${valeurPart.toLocaleString('fr-FR')} FCFA

${totalSouscrit.toLocaleString('fr-FR')} CFA

${totalVerse.toLocaleString('fr-FR')} CFA

La somme correspondante à l'ensemble des souscriptions et versements effectué à ce jour, de ${numberToWords(Math.floor(totalVerse)).toLowerCase()} (${totalVerse.toLocaleString('fr-FR')} FCFA) a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à [NOM BANQUE]

En Foi de quoi, ils ont dressé la présente, pour servir et valoir ce que de droit

Fait à ${company.city || 'Abidjan'}, le ${dateJour}

En Deux (2) exemplaires originaux

${isUnipersonnelle ? 'L\'associé Unique' : 'L\'associé' + (associates && associates.length > 1 ? 's' : '')}

${gerantNom}
`;
};

/**
 * Template: Liste de Gérant
 */
export const generateListeGerants = (company, managers) => {
  if (!managers || managers.length === 0) {
    return generateListeGerantsDefault(company);
  }
  
  const gerant = managers[0];
  const capital = parseFloat(company.capital) || 0;
  const dureeMandat = gerant.duree_mandat || 99;
  const dureeMandatWords = numberToWords(dureeMandat);
  
  // Extraire le numéro de pièce d'identité
  const numeroIdentite = gerant.numero_identite || '[NUMÉRO]';
  const typeIdentite = gerant.type_identite || 'CNI';
  const dateDelivranceId = gerant.date_delivrance_id ? formatDate(gerant.date_delivrance_id) : '[DATE DÉLIVRANCE]';
  const dateValiditeId = gerant.date_validite_id ? formatDate(gerant.date_validite_id) : '[DATE VALIDITÉ]';
  const lieuDelivranceId = gerant.lieu_delivrance_id || 'la république de Côte d\'Ivoire';
  
  // Construire l'adresse avec lot et îlot si disponibles
  let adresseSiege = company.address || '[ADRESSE]';
  const lot = company.lot || '';
  const ilot = company.ilot || '';
  if (lot || ilot) {
    const parts = [];
    if (lot) parts.push(`Lot ${lot}`);
    if (ilot) parts.push(`Îlot ${ilot}`);
    adresseSiege = `${adresseSiege}${parts.length > 0 ? `, ${parts.join(', ')}` : ''}`;
  }
  
  return `
« ${company.company_name || '[NOM SOCIÉTÉ]'} »

AYANT SON SIÈGE SOCIAL À ${adresseSiege.toUpperCase()}, ${company.city?.toUpperCase() || 'ABIDJAN'}

__________________________________________________________________________

LISTE DE DIRIGEANT

Est nommé gérant de la société pour une durée de ${dureeMandatWords} ans (${dureeMandat} ans),

M. ${gerant.nom || ''} ${gerant.prenoms || ''}, ${gerant.profession || '[PROFESSION]'}, résident à ${gerant.adresse || '[ADRESSE]'} de nationalité ${gerant.nationalite || '[NATIONALITÉ]'} né(e) le ${formatDate(gerant.date_naissance || gerant.dateNaissance)} à ${gerant.lieu_naissance || gerant.lieuNaissance || '[LIEU NAISSANCE]'} et titulaire de la ${typeIdentite} ${numeroIdentite} délivré(e) le ${dateDelivranceId} et valable ${dateValiditeId} par ${lieuDelivranceId}.
`;
};

const generateListeGerantsDefault = (company) => {
  const capital = parseFloat(company.capital) || 0;
  return `
« ${company.company_name || '[NOM SOCIÉTÉ]'} »

Au capital de ${capital.toLocaleString('fr-FR')} FCFA, située à ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

__________________________________________________________________________

LISTE DE DIRIGEANT

__________________________________________________________________________

Est nommé Gérant pour une durée de 4 ans (quatre ans)

M. ${company.gerant || '[NOM GÉRANT]'}, [PROFESSION] résidant à [ADRESSE] de nationalité [NATIONALITÉ], né le [DATE NAISSANCE] à [LIEU NAISSANCE] et titulaire du [TYPE PIÈCE] N° [NUMÉRO] délivrée le [DATE DÉLIVRANCE] et valable jusqu'au [DATE VALIDITÉ] par [ÉMETTEUR]

__________________________________________________________________________

Signature

_____________________
`;
};

/**
 * Template: Déclaration sur l'Honneur
 */
export const generateDeclarationHonneur = (company, managers) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM]';
  const gerantPrenoms = gerant?.prenoms || '[PRÉNOMS]';
  const gerantPereNom = gerant?.pere_nom || gerant?.pereNom || '[NOM ET PRÉNOMS DU PÈRE]';
  const gerantMereNom = gerant?.mere_nom || gerant?.mereNom || '[NOM ET PRÉNOMS DE LA MÈRE]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDomicile = gerant?.adresse || '[DOMICILE]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  
  return `
DÉCLARATION SUR L'HONNEUR

(Article 47 de l'Acte Uniforme relatif au Droit commercial général adopté le 15 décembre 2010)

NOM : ${gerant?.nom || '[NOM]'}

PRÉNOMS : ${gerantPrenoms}

DE : ${gerantPereNom}

Et DE : ${gerantMereNom}

DATE DE NAISSANCE : ${gerantDateNaissance}

NATIONALITÉ : ${gerantNationalite}

DOMICILE : ${gerantDomicile}

PROFESSION : ${gerantProfession}

QUALITÉ : GÉRANT

Déclare, conformément à l'article 47 de l'Acte Uniforme relatif au Droit Commercial Général adopté le 15 décembre 2010, au titre du Registre de commerce et du Crédit Mobilier,

N'avoir fait l'objet d'aucune condamnation pénale, ni de sanction professionnelle ou administrative de nature à m'interdire de gérer, administrer ou diriger une société ou l'exercice d'une activité commerciale.

M'engage dans un délai de 75 jours à compter de l'immatriculation à fournir mon casier judiciaire ou tout autre document en tenant lieu.

Je prends acte de ce qu'à défaut de produire l'extrait du casier judiciaire ou tout document en tenant lieu dans le délai de soixante-quinze (75) jours, il sera procédé au retrait de mon immatriculation et à ma radiation.

Fait à ${company.city || 'Abidjan'}, le ${formatDate(new Date().toISOString())}

(Lu et approuvé suivi de la signature)
`;
};

/**
 * Template: Formulaire CEPICI
 */
export const generateFormulaireCEPICI = (company, managers, associates) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const capital = parseFloat(company.capital) || 0;
  const capitalNumeraire = capital;
  const apportsNature = 0;
  const dureeSociete = company.duree_societe || 99;
  
  return `
RÉPUBLIQUE DE CÔTE D'IVOIRE
Union - Discipline - Travail

CEPICI
CENTRE DE PROMOTION DES INVESTISSEMENTS EN COTE D'IVOIRE

GUICHET UNIQUE
Création d'Entreprise

FORMULAIRE UNIQUE DE DEMANDE DE CRÉATION D'ENTREPRISE

SECTION A: IDENTIFICATION DE L'ENTREPRISE

Denomination sociale : ${company.company_name || '[DENOMINATION]'}
Nom commercial : 
Sigle : 
Duree : ${dureeSociete} ANS
Forme juridique : ${company.company_type || 'SARL'}
Montant du capital : ${capital.toLocaleString('fr-FR')} FCFA
    Dont : Montant en numéraire : ${capitalNumeraire.toLocaleString('fr-FR')} FCFA
    Evaluation des apports en nature : ${apportsNature.toLocaleString('fr-FR')} FCFA

PREVISIONS SUR 3 ANS:
    Montant d'Investissement : A determiner
    Nombre d'Emplois : A determiner

__________________________________________________________________________
II- ACTIVITE
__________________________________________________________________________

Activite principale : 
${company.activity || '[ACTIVITE PRINCIPALE]'}

Activites secondaires : 

Chiffre d'affaires previsionnel : ${company.chiffre_affaires_prev ? company.chiffre_affaires_prev.toLocaleString('fr-FR') : '-'} FCFA
Nombre d'employes : 1
Date embauche 1er employe : ${formatDate(new Date().toISOString())}
Date de debut d'activite : ${formatDate(new Date().toISOString())}

__________________________________________________________________________
III- LOCALISATION DU SIEGE SOCIAL
__________________________________________________________________________

Ville : ${company.city || 'ABIDJAN'}
Commune : ${company.commune || '[COMMUNE]'}
Quartier : ${company.quartier || '[QUARTIER]'}
Rue : ${company.address || ''}
Lot n° : ${company.lot || ''}      Ilot n° : ${company.ilot || ''}
Numero etage :      Numero porte : 
Tel. : ${company.telephone || '[TELEPHONE]'}
Email : ${company.email || '[EMAIL]'}

__________________________________________________________________________
V- INFORMATIONS SUR LES DIRIGEANTS
__________________________________________________________________________

DIRIGEANT SOCIAL

Nom et Prenoms : ${gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : '[NOM]'}
Adresse : ${gerant?.adresse || '[ADRESSE]'}
Nationalite : ${gerant?.nationalite || '[NATIONALITE]'}
Date et lieu de naissance : ${gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE]'} a ${gerant?.lieu_naissance || '[LIEU]'}
Regime matrimonial : [REGIME]
Fonction : GERANT

__________________________________________________________________________

Fait a Abidjan, le ${formatDate(new Date().toISOString())}

Signature

_____________________


__________________________________________________________________________
CEPICI : BP V152 ABIDJAN 01 - ABIDJAN PLATEAU 2eme etage immeuble DJEKANOU
Tel : (225) 20 30 23 85 - Fax : (225) 20 21 40 71 - Site web : www.cepici.gouv.ci
`;
};

/**
 * Mapper les noms de documents vers les fonctions de génération
 */
export const documentGenerators = {
  'Statuts SARL': generateStatutsSARL,
  'Statuts': generateStatutsSARL,
  'Contrat de bail commercial': generateContratBail,
  'Contrat de bail': generateContratBail,
  'Formulaire unique CEPICI': generateFormulaireCEPICI,
  'Formulaire CEPICI': generateFormulaireCEPICI,
  'Liste des dirigeants/gérants': generateListeGerants,
  'Liste de Gérant': generateListeGerants,
  'Liste des gérants': generateListeGerants,
  'Déclaration sur l\'honneur (greffe)': generateDeclarationHonneur,
  'Déclaration sur l\'honneur': generateDeclarationHonneur,
  'Déclaration de Souscription et Versement (DSV)': generateDSV,
  'DSV': generateDSV,
  'Déclaration Souscription/Versement': generateDSV,
};

