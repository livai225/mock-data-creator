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
  
  // Debug: Afficher les données du gérant
  if (gerant) {
    console.log('🔍 [DOCX Statuts] Données gérant:', {
      nom: gerant.nom,
      prenoms: gerant.prenoms,
      nationalite: gerant.nationalite,
      lieu_naissance: gerant.lieu_naissance,
      lieuNaissance: gerant.lieuNaissance,
      adresse: gerant.adresse,
      address: gerant.address,
      profession: gerant.profession,
      date_naissance: gerant.date_naissance,
      dateNaissance: gerant.dateNaissance
    });
  }
  
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantDuree = gerant?.duree_mandat || gerant?.dureeMandat || 99;
  const gerantDureeWords = numberToWords(gerantDuree);
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || gerant?.address || '[ADRESSE]';
  const gerantVilleResidence = gerant?.ville_residence || gerant?.villeResidence || '';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = (gerant?.date_naissance || gerant?.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU NAISSANCE]';
DSV DE LA SOCIETE « ${company.company_name || '[NOM SOCIÉTÉ]'} »

DECLARATION DE SOUSCRIPTION ET DE VERSEMENT

(cf Art 314 de l'Acte uniforme révisé du 30 janvier 2014, Art 6 de l'Ordonnance N° 2014-161 du 02 avril 2014 relative à la formes des statuts et au capital social de la société à responsabilité limitée)

L'An ${anneeWords},

Le ${dateJour}

${signatairesLabel}

${signatairesText}

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

Le siège social est fixé à : ${siegeAdresse}

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

La somme correspondante à l'ensemble des souscriptions et versements effectué à ce jour, de ${numberToWords(Math.floor(totalVerse)).toLowerCase()} (${totalVerse.toLocaleString('fr-FR')} FCFA) a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à ${banque}

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
  
  // Debug: Afficher les données du gérant
  console.log('🔍 [DOCX Liste Gérants] Données gérant:', {
    nom: gerant.nom,
    prenoms: gerant.prenoms,
    nationalite: gerant.nationalite,
    lieu_naissance: gerant.lieu_naissance,
    lieuNaissance: gerant.lieuNaissance,
    adresse: gerant.adresse,
    address: gerant.address,
    profession: gerant.profession,
    date_naissance: gerant.date_naissance,
    dateNaissance: gerant.dateNaissance
  });
  
  const capital = parseFloat(company.capital) || 0;
  const dureeMandat = gerant.duree_mandat || gerant.dureeMandat || 99;
  const dureeMandatWords = numberToWords(dureeMandat);
  
  // Extraire le numéro de pièce d'identité
  const numeroIdentite = gerant.numero_identite || gerant.numeroIdentite || '[NUMÉRO]';
  const typeIdentite = gerant.type_identite || gerant.typeIdentite || 'CNI';
  const dateDelivranceId = (gerant.date_delivrance_id || gerant.dateDelivranceId) ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '[DATE DÉLIVRANCE]';
  const dateValiditeId = (gerant.date_validite_id || gerant.dateValiditeId) ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '[DATE VALIDITÉ]';
  const lieuDelivranceId = gerant.lieu_delivrance_id || gerant.lieuDelivranceId || 'la république de Côte d\'Ivoire';
  
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
  
  // Récupérer les champs du gérant avec toutes les variantes
  const gerantProfession = gerant.profession || '[PROFESSION]';
  const gerantAdresse = gerant.adresse || gerant.address || '[ADRESSE]';
  const gerantNationalite = gerant.nationalite || gerant.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = (gerant.date_naissance || gerant.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant.lieu_naissance || gerant.lieuNaissance || '[LIEU NAISSANCE]';
  
  return `
« ${company.company_name || '[NOM SOCIÉTÉ]'} »

AYANT SON SIÈGE SOCIAL À ${adresseSiege.toUpperCase()}, ${company.city?.toUpperCase() || 'ABIDJAN'}

__________________________________________________________________________

LISTE DE DIRIGEANT

Est nommé gérant de la société pour une durée de ${dureeMandatWords} ans (${dureeMandat} ans),

M. ${gerant.nom || ''} ${gerant.prenoms || ''}, ${gerantProfession}, résident à ${gerantAdresse} de nationalité ${gerantNationalite} né(e) le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${typeIdentite} ${numeroIdentite} délivré(e) le ${dateDelivranceId} et valable ${dateValiditeId} par ${lieuDelivranceId}.
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
  
  // Debug: Afficher les données du gérant
  if (gerant) {
    console.log('🔍 [DOCX Déclaration Honneur] Données gérant:', {
      nom: gerant.nom,
      prenoms: gerant.prenoms,
      nationalite: gerant.nationalite,
      lieu_naissance: gerant.lieu_naissance,
      lieuNaissance: gerant.lieuNaissance,
      adresse: gerant.adresse,
      profession: gerant.profession,
      date_naissance: gerant.date_naissance
    });
  }
  
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM]';
  const gerantPrenoms = gerant?.prenoms || gerant?.prenoms || '[PRÉNOMS]';
  const gerantPereNom = gerant?.pere_nom || gerant?.pereNom || '[NOM ET PRÉNOMS DU PÈRE]';
  const gerantMereNom = gerant?.mere_nom || gerant?.mereNom || '[NOM ET PRÉNOMS DE LA MÈRE]';
  const gerantDateNaissance = gerant?.date_naissance || gerant?.dateNaissance ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDomicile = gerant?.adresse || gerant?.address || '[DOMICILE]';
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
  const dureeSociete = company.duree_societe || 99;
  
  // Récupérer les informations du déclarant (consultant comptable)
  const declarant = company.declarant || {};
  const declarantNom = declarant.nom || '[NOM DECLARANT]';
  const declarantQualite = declarant.qualite || 'CONSULTANT COMPTABLE';
  const declarantNumeroCompte = declarant.numeroCompte || '[NUMERO COMPTE]';
  const declarantAdresse = declarant.adresse || '[ADRESSE DECLARANT]';
  const declarantTel = declarant.telephone || '[TEL]';
  const declarantFax = declarant.fax || '[FAX]';
  const declarantMobile = declarant.mobile || '[MOBILE]';
  const declarantEmail = declarant.email || '[EMAIL]';
  
  // Récupérer les projections sur 3 ans
  const projections = company.projections || {};
  const investAnnee1 = projections.investissementAnnee1 || 0;
  const investAnnee2 = projections.investissementAnnee2 || 0;
  const investAnnee3 = projections.investissementAnnee3 || 0;
  const emploisAnnee1 = projections.emploisAnnee1 || 0;
  const emploisAnnee2 = projections.emploisAnnee2 || 0;
  const emploisAnnee3 = projections.emploisAnnee3 || 0;
  
  return `
RÉPUBLIQUE DE CÔTE D'IVOIRE
Union - Discipline - Travail

Présidence de la République
CEPICI
CENTRE DE PROMOTION DES INVESTISSEMENTS EN CÔTE D'IVOIRE

FORMULAIRE UNIQUE
D'IMMATRICULATION DES ENTREPRISES
(PERSONNES MORALES)


CADRE RÉSERVÉ AU CEPICI

DOSSIER N° ………………………………………………

DATE DE RECEPTION ………………………………………

NUMERO REGISTRE DE COMMERCE      /___/___/___/___/___/___/___/___/___/___/
NUMERO COMPTE CONTRIBUABLE       /___/___/___/___/___/___/___/___/___/___/
NUMERO CNPS ENTREPRISE           /___/___/___/___/___/___/___/___/___/___/
CODE IMPORT-EXPORT               /___/___/___/___/___/___/___/___/___/___/


DÉCLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITÉS

DÉCLARATION ÉTABLIE PAR : ${declarantNom}

AGISSANT EN QUALITÉ DE : ${declarantQualite}

ADRESSE PERSONNELLE : ${declarantAdresse}

………………………………………………………………………………………………………………………………………………

TEL :……………………………………… FAX :…………… MOBILE : ${declarantMobile}…………

E-MAIL : ${declarantEmail}


I- IDENTIFICATION

                                    ANNÉE 1         ANNÉE 2         ANNÉE 3

Montant d'Investissement         ${investAnnee1.toLocaleString().padEnd(15)} ${investAnnee2.toLocaleString().padEnd(15)} ${investAnnee3.toLocaleString()}
(projeté)

Nombre d'Emplois                 ${emploisAnnee1.toString().padEnd(15)} ${emploisAnnee2.toString().padEnd(15)} ${emploisAnnee3.toString()}
(projetés)


II- DÉNOMINATION

Dénomination sociale : ${company.company_name || '[DENOMINATION]'}

Sigle : ${company.sigle || ''}

Forme juridique : ${company.company_type || 'SARL'}

Durée : ${dureeSociete} ANS

Montant du capital : ${capital.toLocaleString('fr-FR')} FCFA


III- ACTIVITÉ

Activité principale : ${company.activity || '[ACTIVITE PRINCIPALE]'}

Activités secondaires : ${company.activite_secondaire || ''}

Chiffre d'affaires prévisionnel : ${company.chiffre_affaires_prev || '[CA PREV]'} FCFA


IV- LOCALISATION DU SIÈGE SOCIAL / DE LA SUCCURSALE

Ville : ${company.city || 'ABIDJAN'}      Commune : ${company.commune || ''}      Quartier : ${company.quartier || ''}

Rue : ${company.address || '[RUE]'}      Lot n° : ${company.lot || ''}      Ilot n° : ${company.ilot || ''}

Nom immeuble : ${company.nomImmeuble || ''}      Numéro étage : ${company.numeroEtage || ''}      Numéro porte : ${company.numeroPorte || ''}

Section : ${company.section || ''}      Parcelle : ${company.parcelle || ''}

TF n° : ${company.tfNumero || ''}

Tél. : ${company.telephone || ''}

Fax : ${company.fax || ''}

Adresse postale : ${company.adressePostale || ''}      Email : ${company.email || ''}


V- INFORMATIONS SUR LES DIRIGEANTS

DIRIGEANT SOCIAL

Nom et Prénoms : ${gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : '[NOM GERANT]'}

Adresse : ${gerant?.adresse || gerant?.address || '[ADRESSE]'}

Nationalité : ${gerant?.nationalite || '[NATIONALITE]'}

Date et lieu de naissance : ${gerant ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE]'} à ${gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU]'}

Fonction : GÉRANT


__________________________________________________________________________

Fait à Abidjan, le ${formatDate(new Date().toISOString())}

Signature du déclarant


_____________________
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

