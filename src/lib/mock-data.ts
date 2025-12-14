// Types de sociétés disponibles
export type CompanyType = 
  | 'SARLU'
  | 'SARL_PLURI'
  | 'EI' 
  | 'SNC' 
  | 'SCS' 
  | 'GIE' 
  | 'SA' 
  | 'SAS' 
  | 'COOPERATIVE';

export interface CompanyTypeInfo {
  id: CompanyType;
  name: string;
  fullName: string;
  description: string;
  capitalMin: number;
  capitalMax?: number;
  requiresNotary: boolean;
  documentsGenerated: string[];
  estimatedTime: string;
  price: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface EBook {
  id: string;
  title: string;
  description: string;
  price: number;
  coverImage: string;
  category: string;
  pages: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface TaxInfo {
  id: string;
  title: string;
  description: string;
  rate?: string;
  applicableTo: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
}

// Données mockées
export const companyTypes: CompanyTypeInfo[] = [
  {
    id: 'SARLU',
    name: 'SARL Unipersonnelle',
    fullName: 'Société à Responsabilité Limitée Unipersonnelle',
    description: 'Pour un entrepreneur unique avec responsabilité limitée au capital. Idéale pour les projets individuels.',
    capitalMin: 100000,
    capitalMax: 10000000,
    requiresNotary: false,
    documentsGenerated: [
      'Statuts SARL',
      'Déclaration de Souscription et Versement (DSV)',
      'Contrat de bail commercial',
      'Formulaire unique CEPICI',
      'Liste des dirigeants/gérants',
      'Déclaration sur l\'honneur (greffe)'
    ],
    estimatedTime: '24-48h',
    price: 75000,
  },
  {
    id: 'SARL_PLURI',
    name: 'SARL Pluripersonnelle',
    fullName: 'Société à Responsabilité Limitée Pluripersonnelle',
    description: 'Pour 2 à 100 associés. Forme juridique la plus courante pour les PME en Côte d\'Ivoire.',
    capitalMin: 100000,
    capitalMax: 10000000,
    requiresNotary: false,
    documentsGenerated: [
      'Statuts SARL',
      'Contrat de bail commercial',
      'Formulaire unique CEPICI',
      'Liste des dirigeants/gérants',
      'Déclaration sur l\'honneur (greffe)'
    ],
    estimatedTime: '48-72h',
    price: 95000,
  },
  {
    id: 'EI',
    name: 'Entreprise Individuelle',
    fullName: 'Entreprise Individuelle',
    description: 'Idéale pour les entrepreneurs individuels. Formalités simplifiées et gestion souple.',
    capitalMin: 0,
    requiresNotary: false,
    documentsGenerated: ['Déclaration d\'existence', 'Formulaire CEPICI', 'Déclaration sur l\'honneur'],
    estimatedTime: '24h',
    price: 35000,
  },
  {
    id: 'SNC',
    name: 'SNC',
    fullName: 'Société en Nom Collectif',
    description: 'Pour les associés solidaires. Responsabilité illimitée mais grande flexibilité.',
    capitalMin: 0,
    requiresNotary: false,
    documentsGenerated: ['Statuts', 'DSV', 'Contrat de bail', 'Liste des dirigeants', 'PV de constitution'],
    estimatedTime: '48h',
    price: 85000,
  },
  {
    id: 'SCS',
    name: 'SCS',
    fullName: 'Société en Commandite Simple',
    description: 'Associés commandités et commanditaires avec responsabilités différenciées.',
    capitalMin: 0,
    requiresNotary: false,
    documentsGenerated: ['Statuts', 'DSV', 'Contrat de bail', 'Liste des dirigeants', 'PV de constitution'],
    estimatedTime: '48h',
    price: 95000,
  },
  {
    id: 'GIE',
    name: 'GIE',
    fullName: 'Groupement d\'Intérêt Économique',
    description: 'Pour mutualiser des moyens entre entreprises existantes.',
    capitalMin: 0,
    requiresNotary: false,
    documentsGenerated: ['Statuts', 'Contrat de groupement', 'Liste des membres', 'PV de constitution'],
    estimatedTime: '48-72h',
    price: 120000,
  },
  {
    id: 'SA',
    name: 'SA',
    fullName: 'Société Anonyme',
    description: 'Pour les grandes entreprises. Nécessite un notaire.',
    capitalMin: 10000000,
    requiresNotary: true,
    documentsGenerated: [],
    estimatedTime: 'Sur devis',
    price: 0,
  },
  {
    id: 'SAS',
    name: 'SAS',
    fullName: 'Société par Actions Simplifiée',
    description: 'Grande flexibilité statutaire. Intervention notariale requise.',
    capitalMin: 1000000,
    requiresNotary: true,
    documentsGenerated: [],
    estimatedTime: 'Sur devis',
    price: 0,
  },
  {
    id: 'COOPERATIVE',
    name: 'Coopérative',
    fullName: 'Société Coopérative',
    description: 'Organisation démocratique pour projets collectifs.',
    capitalMin: 0,
    requiresNotary: true,
    documentsGenerated: [],
    estimatedTime: 'Sur devis',
    price: 0,
  },
];

export const services: Service[] = [
  {
    id: 'comptabilite',
    title: 'Assistance Comptable',
    description: 'Tenue de comptabilité, établissement des états financiers et déclarations fiscales.',
    icon: 'Calculator',
    features: ['Tenue comptable mensuelle', 'Établissement du bilan', 'Déclarations fiscales', 'Conseil en gestion'],
  },
  {
    id: 'fiscalite',
    title: 'Assistance Fiscale',
    description: 'Optimisation fiscale légale et accompagnement dans vos obligations déclaratives.',
    icon: 'FileText',
    features: ['Audit fiscal', 'Optimisation fiscale', 'Contentieux fiscal', 'Veille réglementaire'],
  },
  {
    id: 'audit',
    title: 'Audit & Contrôle',
    description: 'Audit légal, audit contractuel et missions de contrôle sur mesure.',
    icon: 'Search',
    features: ['Audit légal', 'Audit contractuel', 'Due diligence', 'Contrôle interne'],
  },
  {
    id: 'creation',
    title: 'Création d\'Entreprise',
    description: 'Accompagnement complet dans vos formalités de création et immatriculation.',
    icon: 'Building2',
    features: ['Choix du statut', 'Rédaction des statuts', 'Formalités CEPICI', 'Immatriculation'],
  },
  {
    id: 'coaching',
    title: 'Coaching en Gestion',
    description: 'Formation et accompagnement pour optimiser la gestion de votre entreprise.',
    icon: 'Users',
    features: ['Tableaux de bord', 'Analyse financière', 'Business plan', 'Formation dirigeants'],
  },
  {
    id: 'investisseurs',
    title: 'Accompagnement Investisseurs',
    description: 'Service dédié aux investisseurs étrangers souhaitant s\'implanter en Côte d\'Ivoire.',
    icon: 'Globe',
    features: ['Carte de résident', 'Ouverture de compte', 'Agréments sectoriels', 'Démarches CEPICI'],
  },
];

export const ebooks: EBook[] = [
  {
    id: 'guide-fiscalite',
    title: 'Guide Complet de la Fiscalité Ivoirienne',
    description: 'Tout ce que vous devez savoir sur les impôts et taxes en Côte d\'Ivoire.',
    price: 15000,
    coverImage: '/ebooks/fiscalite.jpg',
    category: 'Fiscalité',
    pages: 120,
  },
  {
    id: 'guide-expatries',
    title: 'S\'installer en Côte d\'Ivoire - Guide Expatrié',
    description: 'Guide pratique pour les investisseurs et entrepreneurs étrangers.',
    price: 25000,
    coverImage: '/ebooks/expatries.jpg',
    category: 'Investisseurs',
    pages: 85,
  },
  {
    id: 'checklist-creation',
    title: 'Checklist Création d\'Entreprise',
    description: 'Toutes les étapes et documents pour créer votre entreprise.',
    price: 5000,
    coverImage: '/ebooks/checklist.jpg',
    category: 'Création',
    pages: 35,
  },
  {
    id: 'modeles-statuts',
    title: 'Pack Modèles de Statuts',
    description: 'Modèles de statuts personnalisables pour SARL, SNC, SCS.',
    price: 20000,
    coverImage: '/ebooks/modeles.jpg',
    category: 'Templates',
    pages: 50,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    description: 'Pour les entrepreneurs individuels',
    price: 35000,
    features: [
      'Génération documents EI',
      'Support email',
      'Guide fiscal offert',
      'Téléchargement PDF',
    ],
    cta: 'Commencer',
  },
  {
    id: 'professionnel',
    name: 'Professionnel',
    description: 'Pour les SARL et PME',
    price: 75000,
    popular: true,
    features: [
      'Tous documents SARL',
      'Support prioritaire',
      'Révision par expert',
      'Formats PDF & Word',
      '1 modification gratuite',
      'Assistance téléphonique',
    ],
    cta: 'Choisir ce plan',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Accompagnement complet',
    price: 150000,
    features: [
      'Tous types de sociétés',
      'Accompagnement dédié',
      'Dépôt CEPICI inclus',
      'Suivi jusqu\'à immatriculation',
      'Modifications illimitées',
      'RDV expert inclus',
    ],
    cta: 'Nous contacter',
  },
];

export const taxInfo: TaxInfo[] = [
  {
    id: 'is',
    title: 'Impôt sur les Sociétés (IS)',
    description: 'Impôt sur les bénéfices des sociétés de capitaux.',
    rate: '25%',
    applicableTo: ['SARL', 'SA', 'SAS'],
  },
  {
    id: 'tva',
    title: 'Taxe sur la Valeur Ajoutée (TVA)',
    description: 'Taxe sur la consommation applicable aux biens et services.',
    rate: '18%',
    applicableTo: ['Toutes entreprises'],
  },
  {
    id: 'patente',
    title: 'Contribution des Patentes',
    description: 'Impôt local dû par les entreprises exerçant une activité commerciale.',
    applicableTo: ['Toutes entreprises commerciales'],
  },
  {
    id: 'cnps',
    title: 'Cotisations CNPS',
    description: 'Cotisations sociales obligatoires pour les employeurs.',
    rate: '15.75% employeur',
    applicableTo: ['Employeurs'],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Aminata Koné',
    company: 'AK Fashion SARL',
    content: 'Service exceptionnel ! J\'ai créé ma SARL en moins de 48h. Les documents étaient conformes et j\'ai pu démarrer mon activité rapidement.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Jean-Pierre Dupont',
    company: 'Investisseur français',
    content: 'En tant qu\'étranger, l\'accompagnement d\'ARCH EXCELLENCE m\'a été précieux. Ils ont géré toutes mes démarches administratives.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Kouassi Yao',
    company: 'YK Consulting',
    content: 'Très professionnel. L\'équipe maîtrise parfaitement la législation ivoirienne. Je recommande vivement.',
    rating: 5,
  },
];

export const stats = [
  { label: 'Entreprises créées', value: '500+' },
  { label: 'Clients satisfaits', value: '98%' },
  { label: 'Années d\'expérience', value: '15+' },
  { label: 'Experts certifiés', value: '12' },
];
