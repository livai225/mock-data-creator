import { DocumentTemplate } from '@/types/template';

export const templates: DocumentTemplate[] = [
  {
    id: 'contrat-bail',
    name: 'Contrat de Bail Commercial',
    description: 'Contrat de location pour locaux commerciaux avec toutes les clauses légales nécessaires.',
    icon: '🏢',
    category: 'commercial',
    fields: [
      // Bailleur
      { id: 'bailleur_nom', label: 'Nom du Bailleur', type: 'text', placeholder: 'TRAORE BAKARY', section: 'Bailleur', required: true },
      { id: 'bailleur_telephone', label: 'Téléphone du Bailleur', type: 'text', placeholder: '0151252999', section: 'Bailleur', required: true },
      
      // Preneur
      { id: 'societe_nom', label: 'Nom de la Société', type: 'text', placeholder: 'NEW VOLTA FORAGE', section: 'Preneur', required: true },
      { id: 'gerant_nom', label: 'Nom du Gérant', type: 'text', placeholder: 'KARIAKALIAMMAN RAVI RANJITH', section: 'Preneur', required: true },
      
      // Locaux
      { id: 'adresse_complete', label: 'Adresse Complète', type: 'textarea', placeholder: 'ABIDJAN COMMUNE DE COCODY ANGRE NOUVEAU CHU...', section: 'Locaux', required: true },
      { id: 'lot_numero', label: 'Numéro de Lot', type: 'text', placeholder: '3838', section: 'Locaux' },
      { id: 'ilot_numero', label: 'Numéro d\'Îlot', type: 'text', placeholder: '342', section: 'Locaux' },
      
      // Durée
      { id: 'duree_bail', label: 'Durée du Bail (années)', type: 'number', placeholder: '1', defaultValue: '1', section: 'Durée', required: true },
      { id: 'date_debut', label: 'Date de Début', type: 'date', section: 'Durée', required: true },
      { id: 'date_fin', label: 'Date de Fin', type: 'date', section: 'Durée', required: true },
      
      // Loyer
      { id: 'loyer_mensuel', label: 'Loyer Mensuel (FCFA)', type: 'number', placeholder: '80000', section: 'Loyer', required: true },
      { id: 'loyer_lettres', label: 'Loyer en Lettres', type: 'text', placeholder: 'Quatre-vingt mille', section: 'Loyer', required: true },
      { id: 'caution_mois', label: 'Mois de Caution', type: 'number', placeholder: '2', defaultValue: '2', section: 'Loyer', required: true },
      { id: 'avance_mois', label: 'Mois d\'Avance', type: 'number', placeholder: '2', defaultValue: '2', section: 'Loyer', required: true },
      { id: 'garantie_totale', label: 'Garantie Totale (FCFA)', type: 'number', placeholder: '320000', section: 'Loyer', required: true },
      
      // Signature
      { id: 'lieu_signature', label: 'Lieu de Signature', type: 'text', placeholder: 'Abidjan', defaultValue: 'Abidjan', section: 'Signature', required: true },
      { id: 'date_signature', label: 'Date de Signature', type: 'date', section: 'Signature', required: true },
    ],
    generateContent: (values) => `
CONTRAT DE BAIL COMMERCIAL

Entre les soussignés :

${values.bailleur_nom || '[NOM DU BAILLEUR]'}, Téléphone : ${values.bailleur_telephone || '[TELEPHONE]'} Propriétaire, ci-après dénommé « le bailleur »

D'une part

Et

La société dénommée « ${values.societe_nom || '[NOM SOCIÉTÉ]'} » Représenté par son gérant Monsieur ${values.gerant_nom || '[NOM GÉRANT]'} locataire ci-après dénommé « le preneur »

D'autre part.

Il a été dit et convenu ce qui suit :

Le bailleur loue et donne par les présentes au preneur, qui accepte, les locaux ci-après désignés sis à ${values.adresse_complete || '[ADRESSE]'}, LOT ${values.lot_numero || '[LOT]'}, ILOT ${values.ilot_numero || '[ILOT]'} en vue de l'exploitation de la « ${values.societe_nom || '[NOM SOCIÉTÉ]'} ».

Article 1 : Désignation

Il est précisé que l'emplacement est livré nu, et que le preneur devra supporter le cout et les frais d'eaux, d'électricité, téléphone et en général, tous travaux d'aménagements. Tel au surplus que le cout se poursuit et se comporte sans plus ample description, le preneur déclarant avoir vu. Visite et parfaitement connaitre les locaux loués, qu'il consent à occuper dans leur état actuel.

Article 2 : Durée

Le présent bail est conclu pour une durée de ${values.duree_bail || '[DURÉE]'} an(s) allant du ${values.date_debut || '[DATE DÉBUT]'} au ${values.date_fin || '[DATE FIN]'} à son expiration, le bail se renouvellera par tacite reconduction, sauf dénonciation par acte extra judiciaire, au plus tard TROIS (03) mois avant la date d'expiration de la période triennale concernée.

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

La présente location est consentie et acceptée moyennant un loyer mensuel de ${values.loyer_lettres || '[LOYER EN LETTRES]'} (${values.loyer_mensuel || '[MONTANT]'}) francs CFA, payable à la fin du mois au plus tard le cinq (05) du mois suivant. De plus une garantie de ${values.garantie_totale || '[GARANTIE]'} FCFA dont ${values.caution_mois || '[CAUTION]'} mois de caution et ${values.avance_mois || '[AVANCE]'} mois d'avance.

Les parties conviennent que le prix fixé ci-dessus ne peut être révisé au cours du bail.

Dans le cas où il surviendrait une contestation sur le montant du loyer tel qu'il est défini par le présent bail, le preneur devra aviser le bailleur qui s'engage à s'en remettre à une expertise amiable.

Article 7 : Sous-location

Sauf stipulation contraire du bail, toute sous-location totale ou partielle est interdite.

Article 8 : Clause résolutoire

A défaut de paiement d'un seul terme de loyer ou en cas d'inexécution d'une clause du bail, le bailleur pourra demander à la juridiction compétente la résiliation du bail et l'expulsion du preneur, et de tous occupants de son chef, après avoir fait délivrer, par acte extrajudiciaire, une mise en demeure d'avoir à respecter les clauses et conditions du bail.

Article 9 : Élection de domicile

En cas de litige, si aucun accord amiable n'est trouvé, le tribunal d'Abidjan sera seul compétent.

Fait en deux exemplaires et de bonne foi.

À ${values.lieu_signature || '[LIEU]'}, le ${values.date_signature || '[DATE]'}

Le Bailleur                                    Le Preneur

_____________________                          _____________________
    `,
  },
  {
    id: 'formulaire-cepici',
    name: 'Formulaire CEPICI',
    description: 'Formulaire unique d\'immatriculation des entreprises (personnes morales) pour le CEPICI.',
    icon: '📋',
    category: 'administratif',
    fields: [
      // Déclarant
      { id: 'declarant_nom', label: 'Nom du Déclarant', type: 'text', placeholder: 'KOUACOU HARRISON', section: 'Déclarant', required: true },
      { id: 'declarant_qualite', label: 'Qualité du Déclarant', type: 'text', placeholder: 'CONSULTANT COMPTABLE', section: 'Déclarant', required: true },
      { id: 'declarant_adresse', label: 'Adresse du Déclarant', type: 'text', placeholder: 'COCODY RIVIERA (ABIDJAN)', section: 'Déclarant', required: true },
      { id: 'declarant_mobile', label: 'Mobile du Déclarant', type: 'text', placeholder: '+225 01 51 25 29 99', section: 'Déclarant', required: true },
      { id: 'declarant_email', label: 'Email du Déclarant', type: 'text', placeholder: 'email@example.com', section: 'Déclarant', required: true },
      
      // Société
      { id: 'denomination_sociale', label: 'Dénomination Sociale', type: 'text', placeholder: 'NEW VOLTA FORAGE SARL', section: 'Identification', required: true },
      { id: 'nom_commercial', label: 'Nom Commercial', type: 'text', placeholder: '', section: 'Identification' },
      { id: 'sigle', label: 'Sigle', type: 'text', placeholder: '', section: 'Identification' },
      { id: 'duree_societe', label: 'Durée (années)', type: 'number', placeholder: '99', defaultValue: '99', section: 'Identification', required: true },
      { id: 'forme_juridique', label: 'Forme Juridique', type: 'select', options: ['SARL', 'SARL U', 'SA', 'SAS', 'SNC', 'SCS'], section: 'Identification', required: true },
      { id: 'capital_social', label: 'Capital Social (FCFA)', type: 'number', placeholder: '1000000', section: 'Identification', required: true },
      { id: 'capital_numeraire', label: 'Montant en Numéraire', type: 'number', placeholder: '1000000', section: 'Identification', required: true },
      { id: 'apports_nature', label: 'Apports en Nature', type: 'number', placeholder: '0', defaultValue: '0', section: 'Identification' },
      
      // Investissement
      { id: 'invest_annee1', label: 'Investissement Année 1 (FCFA)', type: 'number', placeholder: '5000000', section: 'Investissement', required: true },
      { id: 'invest_annee2', label: 'Investissement Année 2 (FCFA)', type: 'number', placeholder: '7000000', section: 'Investissement' },
      { id: 'invest_annee3', label: 'Investissement Année 3 (FCFA)', type: 'number', placeholder: '9000000', section: 'Investissement' },
      { id: 'emplois_annee1', label: 'Emplois Année 1', type: 'number', placeholder: '3', section: 'Investissement', required: true },
      { id: 'emplois_annee2', label: 'Emplois Année 2', type: 'number', placeholder: '4', section: 'Investissement' },
      { id: 'emplois_annee3', label: 'Emplois Année 3', type: 'number', placeholder: '7', section: 'Investissement' },
      
      // Activité
      { id: 'activite_principale', label: 'Activité Principale', type: 'textarea', placeholder: 'Les travaux de forage d\'eau potable...', section: 'Activité', required: true },
      { id: 'activites_secondaires', label: 'Activités Secondaires', type: 'textarea', placeholder: '', section: 'Activité' },
      { id: 'chiffre_affaires', label: 'Chiffre d\'Affaires Prévisionnel (FCFA)', type: 'number', placeholder: '5000001', section: 'Activité', required: true },
      { id: 'nombre_employes', label: 'Nombre d\'Employés', type: 'number', placeholder: '1', section: 'Activité', required: true },
      { id: 'date_embauche', label: 'Date Embauche 1er Employé', type: 'date', section: 'Activité', required: true },
      { id: 'date_debut_activite', label: 'Date de Début d\'Activité', type: 'date', section: 'Activité', required: true },
      
      // Localisation
      { id: 'ville', label: 'Ville', type: 'text', placeholder: 'ABIDJAN', defaultValue: 'ABIDJAN', section: 'Localisation', required: true },
      { id: 'commune', label: 'Commune', type: 'text', placeholder: 'COCODY', section: 'Localisation', required: true },
      { id: 'quartier', label: 'Quartier', type: 'text', placeholder: 'ANGRE NOUVEAU CHU', section: 'Localisation', required: true },
      { id: 'rue', label: 'Rue', type: 'text', placeholder: 'BASE CIE', section: 'Localisation' },
      { id: 'lot', label: 'N° Lot', type: 'text', placeholder: '3838', section: 'Localisation' },
      { id: 'ilot', label: 'N° Îlot', type: 'text', placeholder: '342', section: 'Localisation' },
      { id: 'etage', label: 'Étage', type: 'text', placeholder: '3', section: 'Localisation' },
      { id: 'porte', label: 'Porte', type: 'text', placeholder: 'B1', section: 'Localisation' },
      { id: 'telephone_siege', label: 'Téléphone', type: 'text', placeholder: '+2250555864655', section: 'Localisation', required: true },
      { id: 'email_siege', label: 'Email', type: 'text', placeholder: 'contact@example.com', section: 'Localisation', required: true },
      
      // Dirigeant
      { id: 'dirigeant_nom', label: 'Nom et Prénoms du Dirigeant', type: 'text', placeholder: 'KARIAKALIAMMAN RAVI RANJITH', section: 'Dirigeant', required: true },
      { id: 'dirigeant_adresse', label: 'Adresse du Dirigeant', type: 'text', placeholder: 'MARCORY', section: 'Dirigeant', required: true },
      { id: 'dirigeant_nationalite', label: 'Nationalité', type: 'text', placeholder: 'Indienne', section: 'Dirigeant', required: true },
      { id: 'dirigeant_date_naissance', label: 'Date de Naissance', type: 'date', section: 'Dirigeant', required: true },
      { id: 'dirigeant_lieu_naissance', label: 'Lieu de Naissance', type: 'text', placeholder: 'ERODE, TAMIL NADU (INDE)', section: 'Dirigeant', required: true },
      { id: 'dirigeant_regime_matrimonial', label: 'Régime Matrimonial', type: 'select', options: ['Célibataire', 'Marié, communauté de bien', 'Marié, séparation de bien', 'Divorcé', 'Veuf'], section: 'Dirigeant', required: true },
      { id: 'dirigeant_fonction', label: 'Fonction', type: 'text', placeholder: 'GERANT', defaultValue: 'GERANT', section: 'Dirigeant', required: true },
      
      // Signature
      { id: 'date_formulaire', label: 'Date du Formulaire', type: 'date', section: 'Signature', required: true },
    ],
    generateContent: (values) => `
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

DECLARATION ETABLIE PAR : ${values.declarant_nom || '[NOM DÉCLARANT]'}
AGISSANT EN QUALITE DE : ${values.declarant_qualite || '[QUALITÉ]'}
ADRESSE PERSONNELLE : ${values.declarant_adresse || '[ADRESSE]'}
MOBILE : ${values.declarant_mobile || '[MOBILE]'}
E-MAIL : ${values.declarant_email || '[EMAIL]'}

═══════════════════════════════════════════════════════════════════
I- IDENTIFICATION
═══════════════════════════════════════════════════════════════════

Dénomination sociale : ${values.denomination_sociale || '[DÉNOMINATION]'}
Nom commercial : ${values.nom_commercial || ''}
Sigle : ${values.sigle || ''}
Durée : ${values.duree_societe || '99'} ANS
Forme juridique : ${values.forme_juridique || '[FORME JURIDIQUE]'}
Montant du capital : ${values.capital_social || '[CAPITAL]'} FCFA
    Dont : Montant en numéraire : ${values.capital_numeraire || '[NUMÉRAIRE]'} FCFA
    Evaluation des apports en nature : ${values.apports_nature || '0'} FCFA

┌───────────────────────────────────┬──────────────┬──────────────┬──────────────┐
│                                   │   ANNEE 1    │   ANNEE 2    │   ANNEE 3    │
├───────────────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Montant d'Investissement (projeté)│ ${values.invest_annee1 || '-'} │ ${values.invest_annee2 || '-'} │ ${values.invest_annee3 || '-'} │
├───────────────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Nombre d'Emplois (projetés)       │     ${values.emplois_annee1 || '-'}      │     ${values.emplois_annee2 || '-'}      │     ${values.emplois_annee3 || '-'}      │
└───────────────────────────────────┴──────────────┴──────────────┴──────────────┘

═══════════════════════════════════════════════════════════════════
II- ACTIVITE
═══════════════════════════════════════════════════════════════════

Activité principale : 
${values.activite_principale || '[ACTIVITÉ PRINCIPALE]'}

Activités secondaires : 
${values.activites_secondaires || ''}

Chiffre d'affaires prévisionnel : ${values.chiffre_affaires || '[CA]'} FCFA
Nombre d'employés : ${values.nombre_employes || '[NOMBRE]'}
Date embauche 1er employé : ${values.date_embauche || '[DATE]'}
Date de début d'activité : ${values.date_debut_activite || '[DATE]'}

═══════════════════════════════════════════════════════════════════
III- LOCALISATION DU SIEGE SOCIAL
═══════════════════════════════════════════════════════════════════

Ville : ${values.ville || 'ABIDJAN'}
Commune : ${values.commune || '[COMMUNE]'}
Quartier : ${values.quartier || '[QUARTIER]'}
Rue : ${values.rue || ''}
Lot n° : ${values.lot || ''}     Îlot n° : ${values.ilot || ''}
Numéro étage : ${values.etage || ''}     Numéro porte : ${values.porte || ''}
Tél. : ${values.telephone_siege || '[TÉLÉPHONE]'}
Email : ${values.email_siege || '[EMAIL]'}

═══════════════════════════════════════════════════════════════════
V- INFORMATIONS SUR LES DIRIGEANTS
═══════════════════════════════════════════════════════════════════

DIRIGEANT SOCIAL
┌────────────────────────────┬─────────────────────────────────────┐
│ Nom et Prénoms             │ ${values.dirigeant_nom || '[NOM]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Adresse                    │ ${values.dirigeant_adresse || '[ADRESSE]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Nationalité                │ ${values.dirigeant_nationalite || '[NATIONALITÉ]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Date et lieu de naissance  │ ${values.dirigeant_date_naissance || '[DATE]'} à ${values.dirigeant_lieu_naissance || '[LIEU]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Régime matrimonial         │ ${values.dirigeant_regime_matrimonial || '[RÉGIME]'} │
├────────────────────────────┼─────────────────────────────────────┤
│ Fonction                   │ ${values.dirigeant_fonction || 'GERANT'} │
└────────────────────────────┴─────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

Fait à Abidjan, le ${values.date_formulaire || '[DATE]'}

Signature

_____________________


───────────────────────────────────────────────────────────────────
CEPICI : BP V152 ABIDJAN 01 – ABIDJAN PLATEAU 2ème étage immeuble DJEKANOU
Tel : (225) 20 30 23 85 – Fax : (225) 20 21 40 71 – Site web : www.cepici.gouv.ci
    `,
  },
  {
    id: 'liste-gerant',
    name: 'Liste de Gérant',
    description: 'Document de nomination du gérant pour une société SARL.',
    icon: '👔',
    category: 'juridique',
    fields: [
      // Société
      { id: 'societe_nom', label: 'Nom de la Société', type: 'text', placeholder: 'NEW VOLTA FORAGE SARL', section: 'Société', required: true },
      { id: 'capital_social', label: 'Capital Social (FCFA)', type: 'number', placeholder: '1000000', section: 'Société', required: true },
      { id: 'adresse_siege', label: 'Adresse du Siège', type: 'textarea', placeholder: 'ABIDJAN COMMUNE DE COCODY...', section: 'Société', required: true },
      
      // Gérant
      { id: 'gerant_nom', label: 'Nom et Prénoms du Gérant', type: 'text', placeholder: 'KARIAKALIAMMAN RAVI RANJITH', section: 'Gérant', required: true },
      { id: 'gerant_profession', label: 'Profession', type: 'text', placeholder: 'Technicien hydraulique', section: 'Gérant', required: true },
      { id: 'gerant_residence', label: 'Résidence', type: 'text', placeholder: 'ABIDJAN-MARCORY', section: 'Gérant', required: true },
      { id: 'gerant_nationalite', label: 'Nationalité', type: 'text', placeholder: 'Indienne', section: 'Gérant', required: true },
      { id: 'gerant_date_naissance', label: 'Date de Naissance', type: 'date', section: 'Gérant', required: true },
      { id: 'gerant_lieu_naissance', label: 'Lieu de Naissance', type: 'text', placeholder: 'ERODE, TAMIL NADU (INDE)', section: 'Gérant', required: true },
      { id: 'piece_identite_type', label: 'Type de Pièce d\'Identité', type: 'select', options: ['Passeport', 'CNI', 'Carte de Séjour'], section: 'Gérant', required: true },
      { id: 'piece_identite_numero', label: 'Numéro de la Pièce', type: 'text', placeholder: 'ZA342860', section: 'Gérant', required: true },
      { id: 'piece_identite_date', label: 'Date de Délivrance', type: 'date', section: 'Gérant', required: true },
      { id: 'piece_identite_validite', label: 'Date de Validité', type: 'date', section: 'Gérant', required: true },
      { id: 'piece_identite_emetteur', label: 'Émetteur', type: 'text', placeholder: 'République de l\'Inde', section: 'Gérant', required: true },
      
      // Mandat
      { id: 'duree_mandat', label: 'Durée du Mandat (années)', type: 'number', placeholder: '4', defaultValue: '4', section: 'Mandat', required: true },
    ],
    generateContent: (values) => `
« ${values.societe_nom || '[NOM SOCIÉTÉ]'} »

Au capital de ${values.capital_social || '[CAPITAL]'} FCFA, située à ${values.adresse_siege || '[ADRESSE]'}

═══════════════════════════════════════════════════════════════════

LISTE DE DIRIGEANT

═══════════════════════════════════════════════════════════════════

Est nommé Gérant pour une durée de ${values.duree_mandat || '4'} ans (${values.duree_mandat || '4'} ans)

M. ${values.gerant_nom || '[NOM GÉRANT]'}, ${values.gerant_profession || '[PROFESSION]'} résidant à ${values.gerant_residence || '[RÉSIDENCE]'} de nationalité ${values.gerant_nationalite || '[NATIONALITÉ]'}, né le ${values.gerant_date_naissance || '[DATE NAISSANCE]'} à ${values.gerant_lieu_naissance || '[LIEU NAISSANCE]'} et titulaire du ${values.piece_identite_type || '[TYPE PIÈCE]'} N° ${values.piece_identite_numero || '[NUMÉRO]'} délivrée le ${values.piece_identite_date || '[DATE DÉLIVRANCE]'} et valable jusqu'au ${values.piece_identite_validite || '[DATE VALIDITÉ]'} par ${values.piece_identite_emetteur || '[ÉMETTEUR]'}

───────────────────────────────────────────────────────────────────

Signature

_____________________
    `,
  },
  {
    id: 'declaration-honneur',
    name: 'Déclaration sur l\'Honneur',
    description: 'Déclaration sur l\'honneur pour le greffe du tribunal de commerce.',
    icon: '✋',
    category: 'juridique',
    fields: [
      // Déclarant
      { id: 'declarant_nom', label: 'Nom et Prénoms', type: 'text', placeholder: 'KARIAKALIAMMAN RAVI RANJITH', section: 'Déclarant', required: true },
      { id: 'declarant_nationalite', label: 'Nationalité', type: 'text', placeholder: 'Indienne', section: 'Déclarant', required: true },
      { id: 'declarant_date_naissance', label: 'Date de Naissance', type: 'date', section: 'Déclarant', required: true },
      { id: 'declarant_lieu_naissance', label: 'Lieu de Naissance', type: 'text', placeholder: 'ERODE, TAMIL NADU (INDE)', section: 'Déclarant', required: true },
      { id: 'declarant_domicile', label: 'Domicile', type: 'text', placeholder: 'ABIDJAN-MARCORY', section: 'Déclarant', required: true },
      { id: 'declarant_fonction', label: 'Fonction dans la Société', type: 'text', placeholder: 'Gérant', defaultValue: 'Gérant', section: 'Déclarant', required: true },
      
      // Société
      { id: 'societe_nom', label: 'Nom de la Société', type: 'text', placeholder: 'NEW VOLTA FORAGE SARL', section: 'Société', required: true },
      { id: 'societe_forme', label: 'Forme Juridique', type: 'select', options: ['SARL', 'SARL U', 'SA', 'SAS', 'SNC'], section: 'Société', required: true },
      { id: 'societe_siege', label: 'Siège Social', type: 'textarea', placeholder: 'ABIDJAN, COCODY...', section: 'Société', required: true },
      
      // Signature
      { id: 'lieu', label: 'Lieu', type: 'text', placeholder: 'Abidjan', defaultValue: 'Abidjan', section: 'Signature', required: true },
      { id: 'date', label: 'Date', type: 'date', section: 'Signature', required: true },
    ],
    generateContent: (values) => `
RÉPUBLIQUE DE CÔTE D'IVOIRE
Union - Discipline - Travail

═══════════════════════════════════════════════════════════════════

DÉCLARATION SUR L'HONNEUR

═══════════════════════════════════════════════════════════════════

Je soussigné(e),

${values.declarant_nom || '[NOM]'}

De nationalité ${values.declarant_nationalite || '[NATIONALITÉ]'}

Né(e) le ${values.declarant_date_naissance || '[DATE NAISSANCE]'} à ${values.declarant_lieu_naissance || '[LIEU NAISSANCE]'}

Domicilié(e) à ${values.declarant_domicile || '[DOMICILE]'}

Agissant en qualité de ${values.declarant_fonction || 'Gérant'} de la société :

« ${values.societe_nom || '[NOM SOCIÉTÉ]'} »
${values.societe_forme || '[FORME]'}
Siège social : ${values.societe_siege || '[SIÈGE]'}

───────────────────────────────────────────────────────────────────

DÉCLARE SUR L'HONNEUR :

1. N'avoir fait l'objet d'aucune condamnation pénale pour crime ou délit ;

2. N'avoir fait l'objet d'aucune mesure d'interdiction, de déchéance ou d'incapacité prévue par les textes en vigueur ;

3. Ne pas exercer de fonction incompatible avec l'exercice d'une activité commerciale ;

4. Que les informations fournies dans le cadre de cette déclaration sont exactes et sincères.

───────────────────────────────────────────────────────────────────

Je reconnais avoir été informé(e) des sanctions pénales encourues en cas de fausse déclaration.

Fait pour servir et valoir ce que de droit.

À ${values.lieu || 'Abidjan'}, le ${values.date || '[DATE]'}

Signature précédée de la mention « Lu et approuvé »

_____________________
    `,
  },
  {
    id: 'statuts-sarl',
    name: 'Statuts SARL',
    description: 'Statuts constitutifs pour une Société à Responsabilité Limitée.',
    icon: '📜',
    category: 'juridique',
    fields: [
      // Société
      { id: 'societe_nom', label: 'Dénomination Sociale', type: 'text', placeholder: 'FRIENDS FORAGE', section: 'Société', required: true },
      { id: 'capital_social', label: 'Capital Social (FCFA)', type: 'number', placeholder: '1000000', section: 'Société', required: true },
      { id: 'nombre_parts', label: 'Nombre de Parts', type: 'number', placeholder: '100', section: 'Société', required: true },
      { id: 'valeur_part', label: 'Valeur Nominale par Part (FCFA)', type: 'number', placeholder: '10000', section: 'Société', required: true },
      { id: 'duree_societe', label: 'Durée de la Société (années)', type: 'number', placeholder: '99', defaultValue: '99', section: 'Société', required: true },
      { id: 'siege_social', label: 'Siège Social', type: 'textarea', placeholder: 'ABIDJAN, COCODY...', section: 'Société', required: true },
      
      // Objet social
      { id: 'objet_social', label: 'Objet Social', type: 'textarea', placeholder: 'Les travaux de forage d\'eau potable...', section: 'Objet', required: true },
      
      // Associés
      { id: 'associe1_nom', label: 'Associé 1 - Nom', type: 'text', placeholder: 'KARIAKALIAMMAN RAVI RANJITH', section: 'Associés', required: true },
      { id: 'associe1_nationalite', label: 'Associé 1 - Nationalité', type: 'text', placeholder: 'Indienne', section: 'Associés', required: true },
      { id: 'associe1_date_naissance', label: 'Associé 1 - Date Naissance', type: 'date', section: 'Associés', required: true },
      { id: 'associe1_lieu_naissance', label: 'Associé 1 - Lieu Naissance', type: 'text', placeholder: 'ERODE, TAMIL NADU', section: 'Associés', required: true },
      { id: 'associe1_domicile', label: 'Associé 1 - Domicile', type: 'text', placeholder: 'ABIDJAN-MARCORY', section: 'Associés', required: true },
      { id: 'associe1_parts', label: 'Associé 1 - Nombre de Parts', type: 'number', placeholder: '100', section: 'Associés', required: true },
      { id: 'associe1_apport', label: 'Associé 1 - Apport (FCFA)', type: 'number', placeholder: '1000000', section: 'Associés', required: true },
      
      // Gérant
      { id: 'gerant_nom', label: 'Nom du Gérant', type: 'text', placeholder: 'KARIAKALIAMMAN RAVI RANJITH', section: 'Gérant', required: true },
      { id: 'gerant_duree', label: 'Durée du Mandat (années)', type: 'number', placeholder: '4', defaultValue: '4', section: 'Gérant', required: true },
      
      // Date
      { id: 'lieu_signature', label: 'Lieu de Signature', type: 'text', placeholder: 'Abidjan', defaultValue: 'Abidjan', section: 'Signature', required: true },
      { id: 'date_signature', label: 'Date de Signature', type: 'date', section: 'Signature', required: true },
    ],
    generateContent: (values) => `
═══════════════════════════════════════════════════════════════════
                        STATUTS
                          DE
           « ${values.societe_nom || '[NOM SOCIÉTÉ]'} »
              SOCIÉTÉ À RESPONSABILITÉ LIMITÉE
═══════════════════════════════════════════════════════════════════

LES SOUSSIGNÉS :

${values.associe1_nom || '[NOM ASSOCIÉ]'}, de nationalité ${values.associe1_nationalite || '[NATIONALITÉ]'}, né(e) le ${values.associe1_date_naissance || '[DATE]'} à ${values.associe1_lieu_naissance || '[LIEU]'}, demeurant à ${values.associe1_domicile || '[DOMICILE]'}

Ont établi ainsi qu'il suit les statuts d'une société à responsabilité limitée devant exister entre eux.

═══════════════════════════════════════════════════════════════════
                    TITRE I - FORME - OBJET - DÉNOMINATION
                           SIÈGE - DURÉE
═══════════════════════════════════════════════════════════════════

ARTICLE 1 - FORME

Il est formé entre les propriétaires des parts sociales ci-après créées et de celles qui pourraient l'être ultérieurement, une société à responsabilité limitée qui sera régie par l'Acte Uniforme relatif au droit des sociétés commerciales et du groupement d'intérêt économique, par les lois en vigueur en Côte d'Ivoire et par les présents statuts.

ARTICLE 2 - OBJET SOCIAL

La société a pour objet, en Côte d'Ivoire et à l'étranger :

${values.objet_social || '[OBJET SOCIAL]'}

Et généralement, toutes opérations commerciales, industrielles, financières, mobilières ou immobilières se rattachant directement ou indirectement à l'objet social ci-dessus ou susceptibles d'en faciliter la réalisation.

ARTICLE 3 - DÉNOMINATION SOCIALE

La société prend la dénomination de : « ${values.societe_nom || '[NOM SOCIÉTÉ]'} »

Dans tous les actes et documents émanant de la société, la dénomination sociale doit toujours être précédée ou suivie immédiatement des mots « Société à Responsabilité Limitée » ou du sigle « SARL » et de l'énonciation du capital social.

ARTICLE 4 - SIÈGE SOCIAL

Le siège social est fixé à :
${values.siege_social || '[SIÈGE SOCIAL]'}

Il pourra être transféré en tout autre lieu par décision collective des associés.

ARTICLE 5 - DURÉE

La durée de la société est fixée à ${values.duree_societe || '99'} (${values.duree_societe || 'quatre-vingt-dix-neuf'}) années à compter de son immatriculation au Registre du Commerce et du Crédit Mobilier, sauf dissolution anticipée ou prorogation.

═══════════════════════════════════════════════════════════════════
                    TITRE II - APPORTS - CAPITAL SOCIAL
═══════════════════════════════════════════════════════════════════

ARTICLE 6 - APPORTS

Les associés font à la société les apports suivants :

${values.associe1_nom || '[NOM]'} : ${values.associe1_apport || '[MONTANT]'} FCFA en numéraire

TOTAL DES APPORTS : ${values.capital_social || '[CAPITAL]'} FCFA

ARTICLE 7 - CAPITAL SOCIAL

Le capital social est fixé à la somme de ${values.capital_social || '[CAPITAL]'} FCFA.

Il est divisé en ${values.nombre_parts || '[NOMBRE]'} parts sociales de ${values.valeur_part || '[VALEUR]'} FCFA chacune, numérotées de 1 à ${values.nombre_parts || '[NOMBRE]'}, entièrement souscrites et libérées, attribuées aux associés proportionnellement à leurs apports.

═══════════════════════════════════════════════════════════════════
                    TITRE III - GÉRANCE
═══════════════════════════════════════════════════════════════════

ARTICLE 8 - GÉRANCE

La société est administrée par un ou plusieurs gérants, personnes physiques, associés ou non, nommés par les associés.

Le gérant est investi des pouvoirs les plus étendus pour agir en toutes circonstances au nom de la société, sous réserve des pouvoirs que la loi attribue expressément aux associés.

ARTICLE 9 - NOMINATION DU PREMIER GÉRANT

Est nommé gérant de la société pour une durée de ${values.gerant_duree || '4'} ans :

M. ${values.gerant_nom || '[NOM GÉRANT]'}

═══════════════════════════════════════════════════════════════════
                    TITRE IV - DISPOSITIONS DIVERSES
═══════════════════════════════════════════════════════════════════

ARTICLE 10 - EXERCICE SOCIAL

L'exercice social commence le 1er janvier et finit le 31 décembre de chaque année.

ARTICLE 11 - AFFECTATION DES RÉSULTATS

Sur le bénéfice de l'exercice diminué, le cas échéant, des pertes antérieures, il est prélevé 10% pour constituer le fonds de réserve légale. Ce prélèvement cesse d'être obligatoire lorsque le fonds de réserve atteint le cinquième du capital social.

Le bénéfice distribuable est constitué par le bénéfice de l'exercice diminué des pertes antérieures et des sommes portées en réserve.

═══════════════════════════════════════════════════════════════════

Fait à ${values.lieu_signature || 'Abidjan'}, le ${values.date_signature || '[DATE]'}

En autant d'exemplaires que de parties plus un pour l'enregistrement.

Les Associés :

_____________________
${values.associe1_nom || '[NOM ASSOCIÉ]'}
    `,
  },
];
