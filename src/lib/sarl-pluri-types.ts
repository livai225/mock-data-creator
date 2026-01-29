// Types pour le formulaire SARL Pluripersonnelle

export interface AssocieInfo {
  id: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  profession: string;
  adresseDomicile: string;
  typeIdentite: 'CNI' | 'Passeport' | 'Carte de séjour' | 'Carte de résident';
  numeroIdentite: string;
  dateDelivranceId: string;
  dateValiditeId: string;
  lieuDelivranceId: string;
  nombreParts: number;
  valeurParts: number;
  apportNumeraire: number;
}

export interface SARLPluriFormData {
  // Société
  denominationSociale: string;
  sigle: string;
  formeJuridique: string;
  capitalSocial: number;
  capitalEnLettres: string;
  objetSocial: string;
  dureeAnnees: number;
  dateConstitution: string;
  chiffreAffairesPrev: string;
  banque: string; // Nom de la banque pour le dépôt du capital
  
  // Siège social
  adresseSiege: string;
  commune: string;
  quartier: string;
  lot: string;
  ilot: string;
  nomImmeuble: string;
  numeroEtage: string;
  numeroPorte: string;
  section: string;
  parcelle: string;
  tfNumero: string;
  ville: string;
  boitePostale: string;
  telephone: string;
  fax: string;
  adressePostale: string;
  email: string;
  
  // Bailleur (contrat de bail)
  bailleurNom: string;
  bailleurPrenom: string;
  bailleurAdresse: string;
  bailleurContact: string;
  loyerMensuel: number;
  cautionMois: number;
  dureeBailAnnees: number;
  
  // Déclarant (consultant comptable)
  declarantNom: string;
  declarantQualite: string;
  declarantAdresse: string;
  declarantNumeroCompte: string;
  declarantTelephone: string;
  declarantFax: string;
  declarantMobile: string;
  declarantEmail: string;
  
  // Projections sur 3 ans (pour formulaire CEPICI)
  investissementAnnee1: number;
  investissementAnnee2: number;
  investissementAnnee3: number;
  emploisAnnee1: number;
  emploisAnnee2: number;
  emploisAnnee3: number;
  
  // Associés (tableau - minimum 2)
  associes: AssocieInfo[];
  
  // Gérants (tableau - minimum 1)
  gerants: GerantInfo[];
}

export interface GerantInfo {
  id: string;
  isFromAssociate: boolean; // true si le gérant est sélectionné parmi les associés
  associateId?: string; // ID de l'associé si isFromAssociate est true
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  profession: string;
  adresse: string;
  typeIdentite: 'CNI' | 'Passeport' | 'Carte de séjour' | 'Carte de résident';
  numeroIdentite: string;
  dateDelivranceId: string;
  dateValiditeId: string;
  lieuDelivranceId: string;
  pereNom: string;
  mereNom: string;
  dureeMandat: 'determinee' | 'indeterminee';
  dureeMandatAnnees?: number;
}

export const defaultAssocieInfo: AssocieInfo = {
  id: '',
  nom: '',
  prenoms: '',
  dateNaissance: '',
  lieuNaissance: '',
  nationalite: 'Ivoirienne',
  profession: '',
  adresseDomicile: '',
  typeIdentite: 'CNI',
  numeroIdentite: '',
  dateDelivranceId: '',
  dateValiditeId: '',
  lieuDelivranceId: '',
  nombreParts: 0,
  valeurParts: 10000,
  apportNumeraire: 0,
};

export const defaultGerantInfo: GerantInfo = {
  id: '',
  isFromAssociate: false,
  associateId: undefined,
  nom: '',
  prenoms: '',
  dateNaissance: '',
  lieuNaissance: '',
  nationalite: 'Ivoirienne',
  profession: '',
  adresse: '',
  typeIdentite: 'CNI',
  numeroIdentite: '',
  dateDelivranceId: '',
  dateValiditeId: '',
  lieuDelivranceId: '',
  pereNom: '',
  mereNom: '',
  dureeMandat: 'indeterminee',
  dureeMandatAnnees: undefined,
};

export const defaultSARLPluriFormData: SARLPluriFormData = {
  denominationSociale: '',
  sigle: '',
  formeJuridique: 'SARL',
  capitalSocial: 1000000,
  capitalEnLettres: '',
  objetSocial: '',
  dureeAnnees: 99,
  dateConstitution: new Date().toISOString().split('T')[0],
  chiffreAffairesPrev: '',
  banque: '',
  
  adresseSiege: '',
  commune: '',
  quartier: '',
  lot: '',
  ilot: '',
  nomImmeuble: '',
  numeroEtage: '',
  numeroPorte: '',
  section: '',
  parcelle: '',
  tfNumero: '',
  ville: 'Abidjan',
  boitePostale: '',
  telephone: '',
  fax: '',
  adressePostale: '',
  email: '',
  
  bailleurNom: '',
  bailleurPrenom: '',
  bailleurAdresse: '',
  bailleurContact: '',
  loyerMensuel: 0,
  cautionMois: 2,
  dureeBailAnnees: 3,
  
  declarantNom: '',
  declarantQualite: 'CONSULTANT COMPTABLE',
  declarantAdresse: '',
  declarantNumeroCompte: '',
  declarantTelephone: '',
  declarantFax: '',
  declarantMobile: '',
  declarantEmail: '',
  
  investissementAnnee1: 0,
  investissementAnnee2: 0,
  investissementAnnee3: 0,
  emploisAnnee1: 0,
  emploisAnnee2: 0,
  emploisAnnee3: 0,
  
  associes: [
    { ...defaultAssocieInfo, id: '1' },
    { ...defaultAssocieInfo, id: '2' },
  ],
  
  gerants: [
    { ...defaultGerantInfo, id: '1' }
  ],
};

export type SARLPluriStep = 'societe' | 'siege' | 'associes' | 'gerant' | 'cepici' | 'recap';

export const sarlPluriSteps: { id: SARLPluriStep; label: string }[] = [
  { id: 'societe', label: 'Société' },
  { id: 'siege', label: 'Siège & Bail' },
  { id: 'associes', label: 'Associés' },
  { id: 'gerant', label: 'Gérant' },
  { id: 'cepici', label: 'CEPICI' },
  { id: 'recap', label: 'Récapitulatif' },
];
