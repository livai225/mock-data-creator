import { services, taxInfo, type Service, type TaxInfo } from "@/lib/mock-data";

export type ServicesContent = {
  header: {
    title: string;
    description: string;
  };
  services: Service[];
  investor: {
    badge: string;
    title: string;
    description: string;
    items: string[];
    ctaLabel: string;
    packTitle: string;
    packDescription: string;
    packItems: string[];
    packPrice: string;
    packCtaLabel: string;
  };
  cta: {
    title: string;
    description: string;
    callLabel: string;
    contactLabel: string;
  };
};

export type FiscaliteContent = {
  header: {
    badge: string;
    title: string;
    description: string;
  };
  tabs: {
    impots: string;
    regimes: string;
    calendrier: string;
    cnps: string;
  };
  taxes: TaxInfo[];
  additionalTaxes: Array<{
    id: string;
    title: string;
    rate: string;
    description: string;
    applicableTo: string[];
  }>;
  regimes: Array<{
    id: string;
    name: string;
    description: string;
    obligations: string[];
    applicable: string;
  }>;
  calendrier: {
    title: string;
    description: string;
    items: Array<{
      mois: string;
      obligations: string[];
    }>;
  };
  cnps: {
    employeur: {
      title: string;
      description: string;
      items: Array<{ label: string; value: string }>;
      totalLabel: string;
      totalValue: string;
    };
    salarie: {
      title: string;
      description: string;
      items: Array<{ label: string; value: string }>;
      totalLabel: string;
      totalValue: string;
    };
    info: {
      title: string;
      description: string;
    };
  };
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
};

export const defaultServicesContent: ServicesContent = {
  header: {
    title: "Nos Services d'Excellence",
    description:
      "ARCH EXCELLENCE SARL vous accompagne dans tous les aspects comptables, fiscaux, juridiques et administratifs de votre entreprise en Côte d'Ivoire.",
  },
  services: services,
  investor: {
    badge: "Pour les investisseurs étrangers",
    title: "Accompagnement Investisseurs Internationaux",
    description:
      "Vous souhaitez investir en Côte d'Ivoire ? Notre équipe spécialisée vous accompagne dans toutes vos démarches administratives et juridiques.",
    items: [
      "Obtention de la carte de résident",
      "Déclaration d'existence fiscale",
      "Ouverture de compte bancaire professionnel",
      "Demande d'agréments sectoriels",
      "Accompagnement démarches CEPICI",
      "Conseil fiscal et juridique",
    ],
    ctaLabel: "Demander un accompagnement",
    packTitle: "Pack Investisseur Premium",
    packDescription:
      "Solution tout-en-un pour les investisseurs souhaitant s'implanter en Côte d'Ivoire.",
    packItems: [
      "Création d'entreprise complète",
      "Accompagnement administratif",
      "Conseil juridique personnalisé",
      "Suivi pendant 3 mois",
      "Expert dédié",
    ],
    packPrice: "500 000 FCFA",
    packCtaLabel: "Nous contacter",
  },
  cta: {
    title: "Besoin d'un conseil personnalisé ?",
    description: "Nos experts sont disponibles pour répondre à vos questions.",
    callLabel: "Appeler maintenant",
    contactLabel: "Formulaire de contact",
  },
};

export const defaultFiscaliteContent: FiscaliteContent = {
  header: {
    badge: "Guide Complet",
    title: "Fiscalité Ivoirienne",
    description:
      "Découvrez toutes les informations essentielles sur les impôts, taxes et obligations fiscales des entreprises en Côte d'Ivoire.",
  },
  tabs: {
    impots: "Impôts & Taxes",
    regimes: "Régimes Fiscaux",
    calendrier: "Calendrier Fiscal",
    cnps: "CNPS & Social",
  },
  taxes: taxInfo,
  additionalTaxes: [
    {
      id: "ir",
      title: "Impôt sur le Revenu (IR)",
      rate: "0-60%",
      description:
        "Impôt progressif sur les revenus des personnes physiques, applicable aux entrepreneurs individuels.",
      applicableTo: ["Entreprises individuelles", "Professions libérales"],
    },
    {
      id: "isynth",
      title: "Impôt Synthétique",
      rate: "Variable",
      description:
        "Impôt forfaitaire unique pour les micro-entreprises, remplaçant l'IS, la TVA et la patente.",
      applicableTo: ["CA < 50M FCFA"],
    },
  ],
  regimes: [
    {
      id: "reel-normal",
      name: "Régime Réel Normal",
      description: "Pour les entreprises avec un CA supérieur à 150 millions FCFA",
      obligations: [
        "Tenue d'une comptabilité complète",
        "Déclarations mensuelles TVA",
        "Acomptes IS trimestriels",
        "États financiers annuels SYSCOA",
      ],
      applicable: "CA > 150 000 000 FCFA",
    },
    {
      id: "reel-simplifie",
      name: "Régime Réel Simplifié",
      description: "Pour les PME avec un CA entre 50 et 150 millions FCFA",
      obligations: [
        "Comptabilité simplifiée",
        "Déclaration annuelle TVA",
        "Acomptes IS semestriels",
        "Bilan simplifié",
      ],
      applicable: "50 000 000 < CA ≤ 150 000 000 FCFA",
    },
    {
      id: "micro",
      name: "Régime de la Micro-Entreprise",
      description: "Pour les très petites entreprises avec CA inférieur à 50 millions FCFA",
      obligations: [
        "Livre des recettes",
        "Impôt synthétique",
        "Pas de TVA",
        "Déclaration annuelle simplifiée",
      ],
      applicable: "CA ≤ 50 000 000 FCFA",
    },
  ],
  calendrier: {
    title: "Calendrier des Obligations Fiscales",
    description: "Les principales échéances fiscales pour les entreprises au régime réel normal.",
    items: [
      { mois: "Janvier", obligations: ["Déclaration TVA décembre", "Patente (1er versement)"] },
      { mois: "Février", obligations: ["Déclaration TVA janvier"] },
      { mois: "Mars", obligations: ["Déclaration TVA février", "1er acompte IS"] },
      { mois: "Avril", obligations: ["Déclaration TVA mars", "États financiers N-1"] },
      { mois: "Mai", obligations: ["Déclaration TVA avril"] },
      { mois: "Juin", obligations: ["Déclaration TVA mai", "2ème acompte IS"] },
      { mois: "Juillet", obligations: ["Déclaration TVA juin", "Patente (2ème versement)"] },
      { mois: "Août", obligations: ["Déclaration TVA juillet"] },
      { mois: "Septembre", obligations: ["Déclaration TVA août", "3ème acompte IS"] },
      { mois: "Octobre", obligations: ["Déclaration TVA septembre"] },
      { mois: "Novembre", obligations: ["Déclaration TVA octobre"] },
      { mois: "Décembre", obligations: ["Déclaration TVA novembre", "4ème acompte IS"] },
    ],
  },
  cnps: {
    employeur: {
      title: "Cotisations CNPS Employeur",
      description: "Cotisations sociales obligatoires à la charge de l'employeur.",
      items: [
        { label: "Prestations familiales", value: "5,75%" },
        { label: "Accidents du travail", value: "2% à 5%" },
        { label: "Retraite", value: "7,7%" },
      ],
      totalLabel: "Total employeur",
      totalValue: "15,45% - 18,45%",
    },
    salarie: {
      title: "Cotisations Salarié",
      description: "Part des cotisations prélevées sur le salaire brut.",
      items: [{ label: "Retraite", value: "6,3%" }],
      totalLabel: "Total salarié",
      totalValue: "6,3%",
    },
    info: {
      title: "Important",
      description:
        "Les cotisations CNPS doivent être versées avant le 15 du mois suivant. Le non-respect des délais entraîne des pénalités de 10% par mois de retard.",
    },
  },
  cta: {
    title: "Besoin d'un accompagnement fiscal ?",
    description:
      "Nos experts fiscalistes sont à votre disposition pour vous aider à optimiser votre situation fiscale en toute légalité.",
    primaryLabel: "Découvrir nos services",
    secondaryLabel: "Télécharger nos guides",
  },
};

export const normalizeServicesContent = (value: unknown): ServicesContent => {
  const data = value && typeof value === "object" ? (value as Partial<ServicesContent>) : {};
  return {
    header: {
      title: data.header?.title ?? defaultServicesContent.header.title,
      description: data.header?.description ?? defaultServicesContent.header.description,
    },
    services: Array.isArray(data.services) ? data.services : defaultServicesContent.services,
    investor: {
      badge: data.investor?.badge ?? defaultServicesContent.investor.badge,
      title: data.investor?.title ?? defaultServicesContent.investor.title,
      description: data.investor?.description ?? defaultServicesContent.investor.description,
      items: Array.isArray(data.investor?.items) ? data.investor.items : defaultServicesContent.investor.items,
      ctaLabel: data.investor?.ctaLabel ?? defaultServicesContent.investor.ctaLabel,
      packTitle: data.investor?.packTitle ?? defaultServicesContent.investor.packTitle,
      packDescription: data.investor?.packDescription ?? defaultServicesContent.investor.packDescription,
      packItems: Array.isArray(data.investor?.packItems) ? data.investor.packItems : defaultServicesContent.investor.packItems,
      packPrice: data.investor?.packPrice ?? defaultServicesContent.investor.packPrice,
      packCtaLabel: data.investor?.packCtaLabel ?? defaultServicesContent.investor.packCtaLabel,
    },
    cta: {
      title: data.cta?.title ?? defaultServicesContent.cta.title,
      description: data.cta?.description ?? defaultServicesContent.cta.description,
      callLabel: data.cta?.callLabel ?? defaultServicesContent.cta.callLabel,
      contactLabel: data.cta?.contactLabel ?? defaultServicesContent.cta.contactLabel,
    },
  };
};

export const normalizeFiscaliteContent = (value: unknown): FiscaliteContent => {
  const data = value && typeof value === "object" ? (value as Partial<FiscaliteContent>) : {};
  return {
    header: {
      badge: data.header?.badge ?? defaultFiscaliteContent.header.badge,
      title: data.header?.title ?? defaultFiscaliteContent.header.title,
      description: data.header?.description ?? defaultFiscaliteContent.header.description,
    },
    tabs: {
      impots: data.tabs?.impots ?? defaultFiscaliteContent.tabs.impots,
      regimes: data.tabs?.regimes ?? defaultFiscaliteContent.tabs.regimes,
      calendrier: data.tabs?.calendrier ?? defaultFiscaliteContent.tabs.calendrier,
      cnps: data.tabs?.cnps ?? defaultFiscaliteContent.tabs.cnps,
    },
    taxes: Array.isArray(data.taxes) ? data.taxes : defaultFiscaliteContent.taxes,
    additionalTaxes: Array.isArray(data.additionalTaxes) ? data.additionalTaxes : defaultFiscaliteContent.additionalTaxes,
    regimes: Array.isArray(data.regimes) ? data.regimes : defaultFiscaliteContent.regimes,
    calendrier: {
      title: data.calendrier?.title ?? defaultFiscaliteContent.calendrier.title,
      description: data.calendrier?.description ?? defaultFiscaliteContent.calendrier.description,
      items: Array.isArray(data.calendrier?.items) ? data.calendrier.items : defaultFiscaliteContent.calendrier.items,
    },
    cnps: {
      employeur: {
        title: data.cnps?.employeur?.title ?? defaultFiscaliteContent.cnps.employeur.title,
        description: data.cnps?.employeur?.description ?? defaultFiscaliteContent.cnps.employeur.description,
        items: Array.isArray(data.cnps?.employeur?.items) ? data.cnps.employeur.items : defaultFiscaliteContent.cnps.employeur.items,
        totalLabel: data.cnps?.employeur?.totalLabel ?? defaultFiscaliteContent.cnps.employeur.totalLabel,
        totalValue: data.cnps?.employeur?.totalValue ?? defaultFiscaliteContent.cnps.employeur.totalValue,
      },
      salarie: {
        title: data.cnps?.salarie?.title ?? defaultFiscaliteContent.cnps.salarie.title,
        description: data.cnps?.salarie?.description ?? defaultFiscaliteContent.cnps.salarie.description,
        items: Array.isArray(data.cnps?.salarie?.items) ? data.cnps.salarie.items : defaultFiscaliteContent.cnps.salarie.items,
        totalLabel: data.cnps?.salarie?.totalLabel ?? defaultFiscaliteContent.cnps.salarie.totalLabel,
        totalValue: data.cnps?.salarie?.totalValue ?? defaultFiscaliteContent.cnps.salarie.totalValue,
      },
      info: {
        title: data.cnps?.info?.title ?? defaultFiscaliteContent.cnps.info.title,
        description: data.cnps?.info?.description ?? defaultFiscaliteContent.cnps.info.description,
      },
    },
    cta: {
      title: data.cta?.title ?? defaultFiscaliteContent.cta.title,
      description: data.cta?.description ?? defaultFiscaliteContent.cta.description,
      primaryLabel: data.cta?.primaryLabel ?? defaultFiscaliteContent.cta.primaryLabel,
      secondaryLabel: data.cta?.secondaryLabel ?? defaultFiscaliteContent.cta.secondaryLabel,
    },
  };
};
