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
 * Template: Statuts SARL
 */
export const generateStatutsSARL = (company, associates, managers) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital));
  const duree = company.duree_societe || 99;
  
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantDuree = gerant?.duree_mandat || 4;
  
  const associe1 = associates && associates.length > 0 ? associates[0] : null;
  const associe1Nom = associe1?.name || '[NOM ASSOCIÉ]';
  const associe1Nationalite = '[NATIONALITÉ]';
  const associe1DateNaissance = '[DATE NAISSANCE]';
  const associe1LieuNaissance = '[LIEU NAISSANCE]';
  const associe1Domicile = '[DOMICILE]';
  const associe1Apport = capital;
  
  const nombreParts = associates?.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) || 100;
  const valeurPart = capital / nombreParts;
  
  return `
═══════════════════════════════════════════════════════════════════
                        STATUTS
                          DE
           « ${company.company_name || '[NOM SOCIÉTÉ]'} »
              SOCIÉTÉ À RESPONSABILITÉ LIMITÉE
═══════════════════════════════════════════════════════════════════

LES SOUSSIGNÉS :

${associe1Nom}, de nationalité ${associe1Nationalite}, né(e) le ${associe1DateNaissance} à ${associe1LieuNaissance}, demeurant à ${associe1Domicile}

Ont établi ainsi qu'il suit les statuts d'une société à responsabilité limitée devant exister entre eux.

═══════════════════════════════════════════════════════════════════
                    TITRE I - FORME - OBJET - DÉNOMINATION
                           SIÈGE - DURÉE
═══════════════════════════════════════════════════════════════════

ARTICLE 1 - FORME

Il est formé entre les propriétaires des parts sociales ci-après créées et de celles qui pourraient l'être ultérieurement, une société à responsabilité limitée qui sera régie par l'Acte Uniforme relatif au droit des sociétés commerciales et du groupement d'intérêt économique, par les lois en vigueur en Côte d'Ivoire et par les présents statuts.

ARTICLE 2 - OBJET SOCIAL

La société a pour objet, en Côte d'Ivoire et à l'étranger :

${company.activity || '[OBJET SOCIAL]'}

Et généralement, toutes opérations commerciales, industrielles, financières, mobilières ou immobilières se rattachant directement ou indirectement à l'objet social ci-dessus ou susceptibles d'en faciliter la réalisation.

ARTICLE 3 - DÉNOMINATION SOCIALE

La société prend la dénomination de : « ${company.company_name || '[NOM SOCIÉTÉ]'} »

Dans tous les actes et documents émanant de la société, la dénomination sociale doit toujours être précédée ou suivie immédiatement des mots « Société à Responsabilité Limitée » ou du sigle « SARL » et de l'énonciation du capital social.

ARTICLE 4 - SIÈGE SOCIAL

Le siège social est fixé à :
${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}, Côte d'Ivoire.

Il pourra être transféré en tout autre lieu par décision collective des associés.

ARTICLE 5 - DURÉE

La durée de la société est fixée à ${duree} (${numberToWords(duree)}) années à compter de son immatriculation au Registre du Commerce et du Crédit Mobilier, sauf dissolution anticipée ou prorogation.

═══════════════════════════════════════════════════════════════════
                    TITRE II - APPORTS - CAPITAL SOCIAL
═══════════════════════════════════════════════════════════════════

ARTICLE 6 - APPORTS

Les associés font à la société les apports suivants :

${associe1Nom} : ${associe1Apport.toLocaleString('fr-FR')} FCFA en numéraire

TOTAL DES APPORTS : ${capital.toLocaleString('fr-FR')} FCFA

ARTICLE 7 - CAPITAL SOCIAL

Le capital social est fixé à la somme de ${capital.toLocaleString('fr-FR')} (${capitalWords}) FCFA.

Il est divisé en ${nombreParts} parts sociales de ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA chacune, numérotées de 1 à ${nombreParts}, entièrement souscrites et libérées, attribuées aux associés proportionnellement à leurs apports.

═══════════════════════════════════════════════════════════════════
                    TITRE III - GÉRANCE
═══════════════════════════════════════════════════════════════════

ARTICLE 8 - GÉRANCE

La société est administrée par un ou plusieurs gérants, personnes physiques, associés ou non, nommés par les associés.

Le gérant est investi des pouvoirs les plus étendus pour agir en toutes circonstances au nom de la société, sous réserve des pouvoirs que la loi attribue expressément aux associés.

ARTICLE 9 - NOMINATION DU PREMIER GÉRANT

Est nommé gérant de la société pour une durée de ${gerantDuree} ans :

M. ${gerantNom}

═══════════════════════════════════════════════════════════════════
                    TITRE IV - DISPOSITIONS DIVERSES
═══════════════════════════════════════════════════════════════════

ARTICLE 10 - EXERCICE SOCIAL

L'exercice social commence le 1er janvier et finit le 31 décembre de chaque année.

ARTICLE 11 - AFFECTATION DES RÉSULTATS

Sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures, il est prélevé 10% pour constituer le fonds de réserve légale. Ce prélèvement cesse d'être obligatoire lorsque le fonds de réserve atteint le cinquième du capital social.

Le bénéfice distribuable est constitué par le bénéfice de l'exercice diminué des pertes antérieures et des sommes portées en réserve.

═══════════════════════════════════════════════════════════════════

Fait à ${company.city || 'Abidjan'}, le ${formatDate(new Date().toISOString())}

En autant d'exemplaires que de parties plus un pour l'enregistrement.

Les Associés :

_____________________
${associe1Nom}
`;
};

/**
 * Template: Contrat de Bail Commercial
 */
export const generateContratBail = (company, bailleurData = {}) => {
  const gerant = company.managers && company.managers.length > 0 ? company.managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  
  // Extraire lot et îlot de l'adresse si possible
  const addressParts = (company.address || '').match(/LOT\s*(\d+)|ILOT\s*(\d+)/gi);
  const lotNumero = addressParts?.find(p => p.toUpperCase().includes('LOT'))?.replace(/LOT\s*/i, '') || '';
  const ilotNumero = addressParts?.find(p => p.toUpperCase().includes('ILOT'))?.replace(/ILOT\s*/i, '') || '';
  
  const dureeBail = bailleurData.duree_bail || 1;
  const dateDebut = bailleurData.date_debut ? formatDate(bailleurData.date_debut) : formatDate(new Date().toISOString());
  const dateFin = bailleurData.date_fin ? formatDate(bailleurData.date_fin) : '[DATE FIN]';
  const loyerMensuel = bailleurData.loyer_mensuel || 0;
  const loyerLettres = bailleurData.loyer_lettres || numberToWords(Math.floor(loyerMensuel));
  const cautionMois = bailleurData.caution_mois || 2;
  const avanceMois = bailleurData.avance_mois || 2;
  const garantieTotale = bailleurData.garantie_totale || (loyerMensuel * (cautionMois + avanceMois));
  
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

Il est précisé que l'emplacement est livré nu, et que le preneur devra supporter le cout et les frais d'eaux, d'électricité, téléphone et en général, tous travaux d'aménagements. Tel au surplus que le cout se poursuit et se comporte sans plus ample description, le preneur déclarant avoir vu. Visite et parfaitement connaitre les locaux loués, qu'il consent à occuper dans leur état actuel.

Article 2 : Durée

Le présent bail est conclu pour une durée de ${dureeBail} an(s) allant du ${dateDebut} au ${dateFin} à son expiration, le bail se renouvellera par tacite reconduction, sauf dénonciation par acte extra judiciaire, au plus tard TROIS (03) mois avant la date d'expiration de la période triennale concernée.

Article 3 : Renouvellement et cession

• Le preneur qui a droit au renouvellement de son bail, doit demander le renouvellement de celui-ci au bailleur, par écrit, au plus tard deux (2) mois avant la date d'expiration du bail.
• Le preneur qui n'a pas formé sa demande de renouvellement dans ce délai est déchu du droit de renouvellement du bail.
• Le BAILLEUR qui n'a pas fait connaître sa réponse à la demande de renouvellement au plus tard UN (01) mois avant l'expiration du bail est réputé avoir accepté le principe du renouvellement de ce bail.
• La partie qui entend résilier le bail doit donner congés, par acte extra judiciaire au moins SIX (06) mois à l'avance.

Article 4 : Obligation du bailleur

Le bailleur fait procéder, à ses frais dans les locaux donnés à bail, à toutes les grosses réparations devenues nécessaires et urgentes.

Article 5 : Obligation du preneur

• Le preneur doit payer le loyer aux termes convenus, entre les mains du bailleur.
• Le preneur est tenu d'exploiter les locaux donnés à bail, en bon père de famille, et conformément à la destination prévue au bail, à défaut de convention écrite, suivant celle présumée d'après les circonstances.
• Le preneur est tenu des réparations d'entretien ; il répond des dégradations ou des pertes dues à un défaut d'entretien en cours de bail.

Article 6 : Loyer

La présente location est consentie et acceptée moyennant un loyer mensuel de ${loyerLettres} (${loyerMensuel.toLocaleString('fr-FR')}) francs CFA, payable à la fin du mois au plus tard le cinq (05) du mois suivant. De plus une garantie de ${garantieTotale.toLocaleString('fr-FR')} FCFA dont ${cautionMois} mois de caution et ${avanceMois} mois d'avance.

Les parties conviennent que le prix fixé ci-dessus ne peut être révisé au cours du bail.

Dans le cas où il surviendrait une contestation sur le montant du loyer tel qu'il est défini par le présent bail, le preneur devra aviser le bailleur qui s'engage à s'en remettre à une expertise amiable.

Article 7 : Sous-location

Sauf stipulation contraire du bail, toute sous-location totale ou partielle est interdite.

Article 8 : Clause résolutoire

A défaut de paiement d'un seul terme de loyer ou en cas d'inexécution d'une clause du bail, le bailleur pourra demander à la juridiction compétente la résiliation du bail et l'expulsion du preneur, et de tous occupants de son chef, après avoir fait délivrer, par acte extrajudiciaire, une mise en demeure d'avoir à respecter les clauses et conditions du bail.

Article 9 : Élection de domicile

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
  
  let associésText = '';
  if (associates && associates.length > 0) {
    const totalParts = associates.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0);
    associésText = associates.map((associe, index) => {
      const parts = parseInt(associe.parts) || 0;
      const pourcentage = totalParts > 0 ? ((parts / totalParts) * 100).toFixed(2) : 0;
      const apport = (capital * parts) / totalParts;
      return `${index + 1}. ${associe.name || '[NOM ASSOCIÉ]'} : ${parts} parts (${pourcentage}%) - Apport : ${apport.toLocaleString('fr-FR')} FCFA`;
    }).join('\n');
  } else {
    associésText = '1. [NOM ASSOCIÉ] : [PARTS] parts - Apport : [MONTANT] FCFA';
  }
  
  return `
RÉPUBLIQUE DE CÔTE D'IVOIRE
Union - Discipline - Travail

═══════════════════════════════════════════════════════════════════

DÉCLARATION DE SOUSCRIPTION ET DE VERSEMENT
DU CAPITAL SOCIAL

═══════════════════════════════════════════════════════════════════

Je soussigné(e), ${company.gerant || '[NOM GÉRANT]'}, Gérant de la société :

« ${company.company_name || '[NOM SOCIÉTÉ]'} »
Société à Responsabilité Limitée (SARL)
Siège social : ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

DÉCLARE :

1. Que le capital social de la société est fixé à la somme de ${capital.toLocaleString('fr-FR')} (${capitalWords}) francs CFA.

2. Que ce capital est divisé en parts sociales de valeur nominale égale.

3. Que les parts sociales ont été souscrites et libérées intégralement par les associés suivants :

${associésText}

4. Que les versements ont été effectués en numéraire et sont disponibles sur le compte bancaire de la société.

5. Que les fonds sont libres de toute hypothèque ou nantissement.

Fait à ${company.city || 'Abidjan'}, le ${dateSignature}

Le Gérant

_____________________
${company.gerant || '[NOM GÉRANT]'}
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
  const dureeMandat = gerant.duree_mandat || 4;
  
  return `
« ${company.company_name || '[NOM SOCIÉTÉ]'} »

Au capital de ${capital.toLocaleString('fr-FR')} FCFA, située à ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

═══════════════════════════════════════════════════════════════════

LISTE DE DIRIGEANT

═══════════════════════════════════════════════════════════════════

Est nommé Gérant pour une durée de ${dureeMandat} ans (${numberToWords(dureeMandat)} ans)

M. ${gerant.nom || ''} ${gerant.prenoms || ''}, ${gerant.profession || '[PROFESSION]'} résidant à ${gerant.adresse || '[ADRESSE]'} de nationalité ${gerant.nationalite || '[NATIONALITÉ]'}, né le ${formatDate(gerant.date_naissance)} à ${gerant.lieu_naissance || '[LIEU NAISSANCE]'} et titulaire du ${gerant.type_identite || '[TYPE PIÈCE]'} N° ${gerant.numero_identite || '[NUMÉRO]'} délivrée le ${formatDate(gerant.date_delivrance_id)} et valable jusqu'au ${formatDate(gerant.date_validite_id)} par ${gerant.lieu_delivrance_id || '[ÉMETTEUR]'}

───────────────────────────────────────────────────────────────────

Signature

_____________________
`;
};

const generateListeGerantsDefault = (company) => {
  const capital = parseFloat(company.capital) || 0;
  return `
« ${company.company_name || '[NOM SOCIÉTÉ]'} »

Au capital de ${capital.toLocaleString('fr-FR')} FCFA, située à ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

═══════════════════════════════════════════════════════════════════

LISTE DE DIRIGEANT

═══════════════════════════════════════════════════════════════════

Est nommé Gérant pour une durée de 4 ans (quatre ans)

M. ${company.gerant || '[NOM GÉRANT]'}, [PROFESSION] résidant à [ADRESSE] de nationalité [NATIONALITÉ], né le [DATE NAISSANCE] à [LIEU NAISSANCE] et titulaire du [TYPE PIÈCE] N° [NUMÉRO] délivrée le [DATE DÉLIVRANCE] et valable jusqu'au [DATE VALIDITÉ] par [ÉMETTEUR]

───────────────────────────────────────────────────────────────────

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
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || '[LIEU NAISSANCE]';
  const gerantDomicile = gerant?.adresse || '[DOMICILE]';
  
  return `
RÉPUBLIQUE DE CÔTE D'IVOIRE
Union - Discipline - Travail

═══════════════════════════════════════════════════════════════════

DÉCLARATION SUR L'HONNEUR

═══════════════════════════════════════════════════════════════════

Je soussigné(e),

${gerantNom}

De nationalité ${gerantNationalite}

Né(e) le ${gerantDateNaissance} à ${gerantLieuNaissance}

Domicilié(e) à ${gerantDomicile}

Agissant en qualité de Gérant de la société :

« ${company.company_name || '[NOM SOCIÉTÉ]'} »
SARL
Siège social : ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

───────────────────────────────────────────────────────────────────

DÉCLARE SUR L'HONNEUR :

1. N'avoir fait l'objet d'aucune condamnation pénale pour crime ou délit ;

2. N'avoir fait l'objet d'aucune mesure d'interdiction, de déchéance ou d'incapacité prévue par les textes en vigueur ;

3. Ne pas exercer de fonction incompatible avec l'exercice d'une activité commerciale ;

4. Que les informations fournies dans le cadre de cette déclaration sont exactes et sincères.

───────────────────────────────────────────────────────────────────

Je reconnais avoir été informé(e) des sanctions pénales encourues en cas de fausse déclaration.

Fait pour servir et valoir ce que de droit.

À ${company.city || 'Abidjan'}, le ${formatDate(new Date().toISOString())}

Signature précédée de la mention « Lu et approuvé »

_____________________
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
REPUBLIQUE DE COTE D'IVOIRE
Union - Discipline - Travail
Présidence de la République
CEPICI
CENTRE DE PROMOTION DES INVESTISSEMENTS EN COTE D'IVOIRE

═══════════════════════════════════════════════════════════════════

FORMULAIRE UNIQUE D'IMMATRICULATION DES ENTREPRISES (PERSONNES MORALES)

═══════════════════════════════════════════════════════════════════

CADRE RESERVE AU CEPICI
┌─────────────────────────────────────────────────────────────────┐
│ DOSSIER N° ......................                                │
│ DATE DE RECEPTION ......................                         │
│ NUMERO REGISTRE DE COMMERCE / / / / / / / /                     │
│ NUMERO COMPTE CONTRIBUABLE / / / / / / / /                      │
│ NUMERO CNPS ENTREPRISE / / / / / / / /                          │
│ CODE IMPORT-EXPORT / / / / / / / /                              │
└─────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────
DECLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITES
───────────────────────────────────────────────────────────────────

DECLARATION ETABLIE PAR : [NOM DÉCLARANT]
AGISSANT EN QUALITE DE : [QUALITÉ]
ADRESSE PERSONNELLE : [ADRESSE]
MOBILE : [MOBILE]
E-MAIL : [EMAIL]

═══════════════════════════════════════════════════════════════════
I- IDENTIFICATION
═══════════════════════════════════════════════════════════════════

Dénomination sociale : ${company.company_name || '[DÉNOMINATION]'}
Nom commercial : 
Sigle : 
Durée : ${dureeSociete} ANS
Forme juridique : ${company.company_type || 'SARL'}
Montant du capital : ${capital.toLocaleString('fr-FR')} FCFA
    Dont : Montant en numéraire : ${capitalNumeraire.toLocaleString('fr-FR')} FCFA
    Evaluation des apports en nature : ${apportsNature.toLocaleString('fr-FR')} FCFA

┌───────────────────────────────────┬──────────────┬──────────────┬──────────────┐
│                                   │   ANNEE 1    │   ANNEE 2    │   ANNEE 3    │
├───────────────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Montant d'Investissement (projeté) │      -       │      -       │      -       │
├───────────────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Nombre d'Emplois (projetés)       │      -       │      -       │      -       │
└───────────────────────────────────┴──────────────┴──────────────┴──────────────┘

═══════════════════════════════════════════════════════════════════
II- ACTIVITE
═══════════════════════════════════════════════════════════════════

Activité principale : 
${company.activity || '[ACTIVITÉ PRINCIPALE]'}

Activités secondaires : 

Chiffre d'affaires prévisionnel : ${company.chiffre_affaires_prev ? company.chiffre_affaires_prev.toLocaleString('fr-FR') : '-'} FCFA
Nombre d'employés : 1
Date embauche 1er employé : ${formatDate(new Date().toISOString())}
Date de début d'activité : ${formatDate(new Date().toISOString())}

═══════════════════════════════════════════════════════════════════
III- LOCALISATION DU SIEGE SOCIAL
═══════════════════════════════════════════════════════════════════

Ville : ${company.city || 'ABIDJAN'}
Commune : [COMMUNE]
Quartier : [QUARTIER]
Rue : 
Lot n° :      Îlot n° : 
Numéro étage :      Numéro porte : 
Tél. : [TÉLÉPHONE]
Email : [EMAIL]

═══════════════════════════════════════════════════════════════════
V- INFORMATIONS SUR LES DIRIGEANTS
═══════════════════════════════════════════════════════════════════

DIRIGEANT SOCIAL
┌────────────────────────────┬─────────────────────────────────────┐
│ Nom et Prénoms             │ ${gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : '[NOM]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Adresse                    │ ${gerant?.adresse || '[ADRESSE]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Nationalité                │ ${gerant?.nationalite || '[NATIONALITÉ]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Date et lieu de naissance  │ ${gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE]'} à ${gerant?.lieu_naissance || '[LIEU]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Régime matrimonial         │ [RÉGIME] │
├────────────────────────────┼─────────────────────────────────────┤
│ Fonction                   │ GERANT │
└────────────────────────────┴─────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

Fait à Abidjan, le ${formatDate(new Date().toISOString())}

Signature

_____________________


───────────────────────────────────────────────────────────────────
CEPICI : BP V152 ABIDJAN 01 – ABIDJAN PLATEAU 2ème étage immeuble DJEKANOU
Tel : (225) 20 30 23 85 – Fax : (225) 20 21 40 71 – Site web : www.cepici.gouv.ci
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

