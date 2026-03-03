// Types pour le formulaire Entreprise Individuelle (Personne Physique)

export interface EIFormData {
  // Propriétaire (personne physique)
  proprietaireNom: string;
  proprietairePrenoms: string;
  proprietaireDateNaissance: string;
  proprietaireLieuNaissance: string;
  proprietaireDomicile: string;
  proprietaireNationalite: string;
  proprietaireSituationMatrimoniale: string;
  proprietairePereNom: string;
  proprietaireMereNom: string;

  // Conjoint
  conjointNom: string;
  conjointPrenoms: string;
  conjointDateNaissance: string;
  conjointLieuNaissance: string;
  conjointNationalite: string;
  conjointDomicile: string;
  conjointRegimeMatrimonial: string;

  // Entreprise
  nomCommercial: string;
  sigle: string;
  activitesExercees: string;
  formeExploitation: string;
  chiffreAffairesPrev: string;
  dateDebutExploitation: string;
  nombreEmployes: string;
  dateEmbauchePremierEmploye: string;

  // Localisation
  nomImmeuble: string;
  numeroEtage: string;
  numeroPorte: string;
  adresseSiege: string;
  ville: string;
  commune: string;
  quartier: string;
  lot: string;
  ilot: string;
  section: string;
  parcelle: string;
  tfNumero: string;
  adressePostale: string;
  telephone: string;
  fax: string;
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

  // Déclarant
  declarantNom: string;
  declarantQualite: string;
  declarantNumeroCompte: string;
  declarantAdresse: string;
  declarantTelephone: string;
  declarantFax: string;
  declarantMobile: string;
  declarantEmail: string;

  // Projections
  investissementAnnee1: number;
  investissementAnnee2: number;
  investissementAnnee3: number;
  emploisAnnee1: number;
  emploisAnnee2: number;
  emploisAnnee3: number;
}

export const defaultEIFormData: EIFormData = {
  proprietaireNom: '',
  proprietairePrenoms: '',
  proprietaireDateNaissance: '',
  proprietaireLieuNaissance: '',
  proprietaireDomicile: '',
  proprietaireNationalite: 'Ivoirienne',
  proprietaireSituationMatrimoniale: '',
  proprietairePereNom: '',
  proprietaireMereNom: '',

  conjointNom: '',
  conjointPrenoms: '',
  conjointDateNaissance: '',
  conjointLieuNaissance: '',
  conjointNationalite: '',
  conjointDomicile: '',
  conjointRegimeMatrimonial: '',

  nomCommercial: '',
  sigle: '',
  activitesExercees: '',
  formeExploitation: '',
  chiffreAffairesPrev: '',
  dateDebutExploitation: new Date().toISOString().split('T')[0],
  nombreEmployes: '',
  dateEmbauchePremierEmploye: '',

  nomImmeuble: '',
  numeroEtage: '',
  numeroPorte: '',
  adresseSiege: '',
  ville: 'Abidjan',
  commune: '',
  quartier: '',
  lot: '',
  ilot: '',
  section: '',
  parcelle: '',
  tfNumero: '',
  adressePostale: '',
  telephone: '',
  fax: '',
  email: '',

  bailleurNom: '',
  bailleurPrenom: '',
  bailleurAdresse: '',
  bailleurContact: '',
  loyerMensuel: 0,
  cautionMois: 2,
  avanceMois: 2,
  dureeBailAnnees: 1,
  dateDebutBail: '',
  dateFinBail: '',

  declarantNom: '',
  declarantQualite: 'CONSULTANT COMPTABLE',
  declarantNumeroCompte: '',
  declarantAdresse: '',
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
};

export type EIStep = 'proprietaire' | 'conjoint' | 'entreprise' | 'localisation' | 'bail' | 'declarant' | 'recap';

export const eiSteps: { id: EIStep; label: string }[] = [
  { id: 'proprietaire', label: 'Propriétaire' },
  { id: 'conjoint', label: 'Conjoint' },
  { id: 'entreprise', label: 'Entreprise' },
  { id: 'localisation', label: 'Localisation' },
  { id: 'bail', label: 'Bail' },
  { id: 'declarant', label: 'Déclarant' },
  { id: 'recap', label: 'Récapitulatif' },
];
