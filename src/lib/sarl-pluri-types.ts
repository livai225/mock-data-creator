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
  typeIdentite: 'CNI' | 'Passeport';
  numeroIdentite: string;
  dateDelivranceId: string;
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
  
  // Siège social
  adresseSiege: string;
  commune: string;
  ville: string;
  boitePostale: string;
  telephone: string;
  email: string;
  
  // Bailleur (contrat de bail)
  bailleurNom: string;
  bailleurPrenom: string;
  bailleurAdresse: string;
  bailleurContact: string;
  loyerMensuel: number;
  cautionMois: number;
  dureeBailAnnees: number;
  
  // Associés (tableau - minimum 2)
  associes: AssocieInfo[];
  
  // Gérants (tableau - minimum 1)
  gerants: GerantInfo[];
}

export interface GerantInfo {
  id: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  adresse: string;
  typeIdentite: 'CNI' | 'Passeport';
  numeroIdentite: string;
  dateDelivranceId: string;
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
  lieuDelivranceId: '',
  nombreParts: 0,
  valeurParts: 10000,
  apportNumeraire: 0,
};

export const defaultGerantInfo: GerantInfo = {
  id: '',
  nom: '',
  prenoms: '',
  dateNaissance: '',
  lieuNaissance: '',
  nationalite: 'Ivoirienne',
  adresse: '',
  typeIdentite: 'CNI',
  numeroIdentite: '',
  dateDelivranceId: '',
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
  
  adresseSiege: '',
  commune: '',
  ville: 'Abidjan',
  boitePostale: '',
  telephone: '',
  email: '',
  
  bailleurNom: '',
  bailleurPrenom: '',
  bailleurAdresse: '',
  bailleurContact: '',
  loyerMensuel: 0,
  cautionMois: 2,
  dureeBailAnnees: 3,
  
  associes: [
    { ...defaultAssocieInfo, id: '1' },
    { ...defaultAssocieInfo, id: '2' },
  ],
  
  gerants: [
    { ...defaultGerantInfo, id: '1' }
  ],
};

export type SARLPluriStep = 'societe' | 'siege' | 'associes' | 'gerant' | 'recap';

export const sarlPluriSteps: { id: SARLPluriStep; label: string }[] = [
  { id: 'societe', label: 'Société' },
  { id: 'siege', label: 'Siège & Bail' },
  { id: 'associes', label: 'Associés' },
  { id: 'gerant', label: 'Gérant' },
  { id: 'recap', label: 'Récapitulatif' },
];
