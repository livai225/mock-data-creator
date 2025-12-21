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

• Le bailleur fait procéder, à ses frais dans les locaux donnés à bail, à toutes les grosses réparations devenues nécessaires et urgentes.

Le bailleur délivre les locaux en bon état.

• Le bailleur autorise le preneur à apposer sur les façades extérieures des locaux les enseignes et plaques indicatrices relatives à son commerce.

Article 5 : Obligation du preneur

• Le preneur doit payer le loyer aux termes convenus, entre les mains du bailleur.

• Le preneur est tenu d'exploiter les locaux donnés à bail, en bon père de famille, et conformément à la destination prévue au bail, à défaut de convention écrite, suivant celle présumée d'après les circonstances.

Le preneur est tenu des réparations d'entretien ; il répond des dégradations ou des pertes dues à un défaut d'entretien en cours de bail.

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
      
      return `M. ${associe.name || '[NOM ASSOCIÉ]'}\n${parts} parts numérotés de ${index === 0 ? 1 : (associates.slice(0, index).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) + 1)} à ${associates.slice(0, index + 1).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0)} inclus\n\n${valeurPart.toLocaleString('fr-FR')} FCFA\n\n${montantSouscrit.toLocaleString('fr-FR')} CFA\n\n${montantSouscrit.toLocaleString('fr-FR')} CFA`;
    }).join('\n\n');
  } else {
    tableauAssocies = `M. ${gerantNom}\n${totalParts} parts numérotés de 1 à ${totalParts} inclus\n\n${valeurPart.toLocaleString('fr-FR')} FCFA\n\n${capital.toLocaleString('fr-FR')} CFA\n\n${capital.toLocaleString('fr-FR')} CFA`;
    totalSouscrit = capital;
    totalVerse = capital;
  }
  
  return `
DSV DE LA SOCIÉTÉ « ${company.company_name || '[NOM SOCIÉTÉ]'} »

DÉCLARATION DE SOUSCRIPTION ET DE VERSEMENT

(cf Art 314 de l'Acte uniforme révisé du 30 janvier 2014, Art 6 de l'Ordonnance N° 2014-161 du 02 avril 2014 relative à la formes des statuts et au capital social de la société à responsabilité limitée)

L'An ${anneeWords},

Le ${dateJour}

Le soussigné,

M. ${gerantNom}, ${gerantProfession}, résident à ${gerantAdresse} de nationalité ${gerantNationalite} né(e) le ${gerantDateNaissance} à ${gerantLieuNaissance} et titulaire de la ${gerantTypeId} ${gerantNumId} délivré(e) le ${gerantDateDelivranceId} et valable ${gerantDateValiditeId} par ${gerantLieuDelivranceId}.

EXPOSÉ PRÉALABLE

Par Acte sous seing Privé en date du ${dateJour},

Ont établi, les statuts de la Société à Responsabilité Limitée devant exister entre eux et tous propriétaires de parts sociales ultérieures, dont les principales caractéristiques sont les suivantes :

1-FORME

La société constituée est une société à Responsabilité Limitée régie par les dispositions de l'Acte uniforme révisé de l'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et ses présents statuts.

2- DÉNOMINATION

La société a pour dénomination : ${company.company_name || '[NOM SOCIÉTÉ]'}

3- OBJET

La société a pour objet en CÔTE-D'IVOIRE :

${company.activity || '[OBJET SOCIAL]'}

4- SIÈGE SOCIAL

Le siège social est fixé à : ${company.address || '[ADRESSE]'}, ${company.city || 'Abidjan'}

5- DURÉE

La durée de la société est de ${company.duree_societe || 99} (${numberToWords(company.duree_societe || 99)}) années, sauf dissolution anticipée ou prorogation.

6- CAPITAL SOCIAL

Le capital social est fixé à la somme de ${capitalWords.toUpperCase()} Franc CFA (F CFA ${capital.toLocaleString('fr-FR')}) divisé en ${totalParts} parts sociales de F CFA ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}.

II- CONSTATATION DE LA LIBÉRATION ET DU DÉPÔT DES FONDS PROVENANT DES PARTS SOCIALES

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

La somme correspondante à l'ensemble des souscriptions et versements effectué à ce jour, de ${numberToWords(Math.floor(totalVerse)).toLowerCase()} (${totalVerse.toLocaleString('fr-FR')} FCFA) a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à [NOM BANQUE].

En Foi de quoi, ils ont dressé la présente, pour servir et valoir ce que de droit

Fait à ${company.city || 'Abidjan'}, le ${dateJour}

En Deux (2) exemplaires originaux

L'associé${associates && associates.length > 1 ? 's' : ''}

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
  
  return `
« ${company.company_name || '[NOM SOCIÉTÉ]'} »

AYANT SON SIÈGE SOCIAL À ${company.address?.toUpperCase() || '[ADRESSE]'}, ${company.city?.toUpperCase() || 'ABIDJAN'}

───────────────────────────────────────────────────────────────────

LISTE DE DIRIGEANT

Est nommé gérant de la société pour une durée de ${dureeMandatWords} ans (${dureeMandat} ans),

M. ${gerant.nom || ''} ${gerant.prenoms || ''}, ${gerant.profession || '[PROFESSION]'}, résident à ${gerant.adresse || '[ADRESSE]'} de nationalité ${gerant.nationalite || '[NATIONALITÉ]'} né(e) le ${formatDate(gerant.date_naissance)} à ${gerant.lieu_naissance || '[LIEU NAISSANCE]'} et titulaire de la ${typeIdentite} ${numeroIdentite} délivré(e) le ${dateDelivranceId} et valable ${dateValiditeId} par ${lieuDelivranceId}.
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
  const gerantPrenoms = gerant?.prenoms || '[PRÉNOMS]';
  const gerantPereNom = gerant?.pere_nom || '[NOM PÈRE]';
  const gerantMereNom = gerant?.mere_nom || '[NOM MÈRE]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDomicile = gerant?.adresse || '[DOMICILE]';
  
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

