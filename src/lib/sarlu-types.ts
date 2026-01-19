// Types pour le formulaire SARL Unipersonnelle

export interface SARLUFormData {
  // Société
  denominationSociale: string;
  sigle: string;
  formeJuridique: string;
  capitalSocial: number;
  capitalEnLettres: string;
  nombreParts: number;
  valeurPart: number;
  objetSocial: string;
  activiteSecondaire: string;
  dureeAnnees: number;
  dateConstitution: string;
  chiffreAffairesPrev: string;
  
  // Siège social
  adresseSiege: string;
  commune: string;
  quartier: string;
  ville: string;
  lot: string;
  ilot: string;
  boitePostale: string;
  telephone: string;
  mobile: string;
  email: string;
  
  // Bailleur (contrat de bail)
  bailleurNom: string;
  bailleurPrenom: string;
  bailleurAdresse: string;
  bailleurContact: string;
  loyerMensuel: number;
  cautionMois: number;
  avanceMois: number;
  dureeBailAnnees: number;
  dateDebutBail: string;
  dateFinBail: string;
  
  // Associé unique (qui est aussi le gérant)
  associeNom: string;
  associePrenoms: string;
  associeDateNaissance: string;
  associeLieuNaissance: string;
  associeNationalite: string;
  associeProfession: string;
  associeAdresseDomicile: string;
  associeVilleResidence: string;
  associeTypeIdentite: 'CNI' | 'Passeport';
  associeNumeroIdentite: string;
  associeDateDelivranceId: string;
  associeDateValiditeId: string;
  associeLieuDelivranceId: string;
  associePereNom: string;
  associeMereNom: string;
  
  // Déclarant (peut être le même que l'associé)
  declarantEstAssocie: boolean;
  declarantNom: string;
  declarantQualite: string;
  declarantAdresse: string;
  declarantContact: string;
  declarantEmail: string;
  declarantNumeroCompte: string;
  declarantTelephone: string;
  declarantFax: string;
  declarantMobile: string;
  
  // Projections sur 3 ans (pour formulaire CEPICI)
  investissementAnnee1: number;
  investissementAnnee2: number;
  investissementAnnee3: number;
  emploisAnnee1: number;
  emploisAnnee2: number;
  emploisAnnee3: number;
  
  // Durée du mandat du gérant
  gerantDureeMandat: number;
}

export const defaultSARLUFormData: SARLUFormData = {
  denominationSociale: '',
  sigle: '',
  formeJuridique: 'SARL Unipersonnelle',
  capitalSocial: 1000000,
  capitalEnLettres: '',
  nombreParts: 100,
  valeurPart: 10000,
  objetSocial: '',
  activiteSecondaire: '',
  dureeAnnees: 99,
  dateConstitution: new Date().toISOString().split('T')[0],
  chiffreAffairesPrev: '',
  
  adresseSiege: '',
  commune: '',
  quartier: '',
  ville: 'Abidjan',
  lot: '',
  ilot: '',
  boitePostale: '',
  telephone: '',
  mobile: '',
  email: '',
  
  bailleurNom: '',
  bailleurPrenom: '',
  bailleurAdresse: '',
  bailleurContact: '',
  loyerMensuel: 0,
  cautionMois: 2,
  avanceMois: 2,
  dureeBailAnnees: 1,
  dateDebutBail: new Date().toISOString().split('T')[0],
  dateFinBail: '',
  
  associeNom: '',
  associePrenoms: '',
  associeDateNaissance: '',
  associeLieuNaissance: '',
  associeNationalite: 'Ivoirienne',
  associeProfession: '',
  associeAdresseDomicile: '',
  associeVilleResidence: '',
  associeTypeIdentite: 'CNI',
  associeNumeroIdentite: '',
  associeDateDelivranceId: '',
  associeDateValiditeId: '',
  associeLieuDelivranceId: '',
  associePereNom: '',
  associeMereNom: '',
  
  declarantEstAssocie: true,
  declarantNom: '',
  declarantQualite: 'Gérant',
  declarantAdresse: '',
  declarantContact: '',
  declarantEmail: '',
  declarantNumeroCompte: '',
  declarantTelephone: '',
  declarantFax: '',
  declarantMobile: '',
  
  investissementAnnee1: 0,
  investissementAnnee2: 0,
  investissementAnnee3: 0,
  emploisAnnee1: 0,
  emploisAnnee2: 0,
  emploisAnnee3: 0,
  
  gerantDureeMandat: 99,
};

export type SARLUStep = 'societe' | 'siege' | 'associe' | 'bail' | 'recap';

export const sarluSteps: { id: SARLUStep; label: string }[] = [
  { id: 'societe', label: 'Société' },
  { id: 'siege', label: 'Siège social' },
  { id: 'associe', label: 'Associé unique' },
  { id: 'bail', label: 'Contrat de bail' },
  { id: 'recap', label: 'Récapitulatif' },
];
