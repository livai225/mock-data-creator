import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYSIS_FILE = path.join(__dirname, '../../analysis-results/analysis-results.json');

// Lire les résultats d'analyse
const analysis = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf-8'));

// Extraire tous les placeholders uniques pour SARL Unipersonnelle
const sarluPlaceholders = new Set();
const sarluDocs = analysis.sarlUnipersonnelle || {};

Object.values(sarluDocs).forEach(doc => {
  if (doc.structure && doc.structure.placeholders) {
    doc.structure.placeholders.forEach(p => {
      sarluPlaceholders.add(p.value.toUpperCase().trim());
    });
  }
});

// Mapping des placeholders vers les champs du formulaire
const placeholderToField = {
  'NOM': 'associeNom',
  'PRENOM': 'associePrenoms',
  'NOM ET PRENOM': 'associeNom + associePrenoms',
  'DENOMINATION': 'denominationSociale',
  'DENOMINATION SOCIALE': 'denominationSociale',
  'SIGLE': 'sigle',
  'CAPITAL': 'capitalSocial',
  'CAPITAL SOCIAL': 'capitalSocial',
  'CAPITAL EN LETTRES': 'capitalEnLettres',
  'OBJET SOCIAL': 'objetSocial',
  'ACTIVITE': 'objetSocial',
  'DUREE SOCIETE': 'dureeAnnees',
  'DATE CONSTITUTION': 'dateConstitution',
  'ADRESSE': 'adresseSiege',
  'ADRESSE SIEGE': 'adresseSiege',
  'VILLE': 'ville',
  'COMMUNE': 'commune',
  'QUARTIER': 'quartier',
  'LOT': 'lot',
  'ILOT': 'ilot',
  'TELEPHONE': 'telephone',
  'MOBILE': 'mobile',
  'EMAIL': 'email',
  'BAILLEUR': 'bailleurNom',
  'NOM BAILLEUR': 'bailleurNom',
  'PRENOM BAILLEUR': 'bailleurPrenom',
  'ADRESSE BAILLEUR': 'bailleurAdresse',
  'TELEPHONE BAILLEUR': 'bailleurContact',
  'LOYEUR': 'loyerMensuel',
  'LOYEUR MENSUEL': 'loyerMensuel',
  'CAUTION': 'cautionMois',
  'DUREE BAIL': 'dureeBailAnnees',
  'DATE DE NAISSANCE': 'associeDateNaissance',
  'LIEU DE NAISSANCE': 'associeLieuNaissance',
  'NATIONALITE': 'associeNationalite',
  'PROFESSION': 'associeProfession',
  'DOMICILE': 'associeAdresseDomicile',
  'RESIDENCE': 'associeVilleResidence',
  'CNI': 'associeTypeIdentite',
  'NUMERO IDENTITE': 'associeNumeroIdentite',
  'DATE DELIVRANCE': 'associeDateDelivranceId',
  'DATE VALIDITE': 'associeDateValiditeId',
  'LIEU DELIVRANCE': 'associeLieuDelivranceId',
  'PERE': 'associePereNom',
  'MERE': 'associeMereNom',
  'GERANT': 'associeNom + associePrenoms',
  'DIRIGEANT': 'associeNom + associePrenoms',
  'MANDAT': 'gerantDureeMandat'
};

// Champs actuels du formulaire SARLU
const currentFields = [
  'denominationSociale', 'sigle', 'capitalSocial', 'capitalEnLettres',
  'objetSocial', 'activiteSecondaire', 'dureeAnnees', 'dateConstitution',
  'chiffreAffairesPrev', 'adresseSiege', 'commune', 'quartier', 'ville',
  'lot', 'ilot', 'boitePostale', 'telephone', 'mobile', 'email',
  'bailleurNom', 'bailleurPrenom', 'bailleurAdresse', 'bailleurContact',
  'loyerMensuel', 'cautionMois', 'avanceMois', 'dureeBailAnnees',
  'dateDebutBail', 'dateFinBail', 'associeNom', 'associePrenoms',
  'associeDateNaissance', 'associeLieuNaissance', 'associeNationalite',
  'associeProfession', 'associeAdresseDomicile', 'associeVilleResidence',
  'associeTypeIdentite', 'associeNumeroIdentite', 'associeDateDelivranceId',
  'associeDateValiditeId', 'associeLieuDelivranceId', 'associePereNom',
  'associeMereNom', 'gerantDureeMandat'
];

// Analyser la conformité
const mappedPlaceholders = [];
const unmappedPlaceholders = [];
const missingFields = [];

Array.from(sarluPlaceholders).forEach(placeholder => {
  const field = placeholderToField[placeholder];
  if (field) {
    mappedPlaceholders.push({ placeholder, field });
  } else {
    unmappedPlaceholders.push(placeholder);
  }
});

// Vérifier les champs manquants dans le formulaire
Object.entries(placeholderToField).forEach(([placeholder, field]) => {
  if (Array.from(sarluPlaceholders).some(p => p === placeholder)) {
    if (field.includes('+')) {
      // Champ composé, vérifier les parties
      const parts = field.split('+').map(p => p.trim());
      parts.forEach(part => {
        if (!currentFields.includes(part) && !missingFields.includes(part)) {
          missingFields.push(part);
        }
      });
    } else if (!currentFields.includes(field) && !missingFields.includes(field)) {
      missingFields.push(field);
    }
  }
});

// Générer le rapport
console.log('📊 RAPPORT DE CONFORMITÉ - SARL UNIPERSONNELLE\n');
console.log('='.repeat(60));
console.log('\n📋 PLACEHOLDERS DÉTECTÉS DANS LES DOCUMENTS MODÈLES:');
console.log(`   Total: ${sarluPlaceholders.size} placeholders uniques\n`);

console.log('✅ PLACEHOLDERS CORRECTEMENT MAPPÉS:');
mappedPlaceholders.forEach(({ placeholder, field }) => {
  console.log(`   ✓ ${placeholder.padEnd(30)} → ${field}`);
});

if (unmappedPlaceholders.length > 0) {
  console.log('\n⚠️  PLACEHOLDERS NON MAPPÉS (à vérifier):');
  unmappedPlaceholders.forEach(p => {
    console.log(`   ⚠ ${p}`);
  });
}

if (missingFields.length > 0) {
  console.log('\n❌ CHAMPS MANQUANTS DANS LE FORMULAIRE:');
  missingFields.forEach(f => {
    console.log(`   ✗ ${f}`);
  });
} else {
  console.log('\n✅ TOUS LES CHAMPS REQUIS SONT PRÉSENTS DANS LE FORMULAIRE');
}

console.log('\n📄 PLACEHOLDERS PAR DOCUMENT:');
Object.entries(sarluDocs).forEach(([fileName, doc]) => {
  if (doc.structure && doc.structure.placeholders) {
    console.log(`\n   📄 ${fileName}:`);
    doc.structure.placeholders.forEach(p => {
      const field = placeholderToField[p.value.toUpperCase().trim()] || 'NON MAPPÉ';
      console.log(`      - ${p.value} (ligne ${p.line}) → ${field}`);
    });
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ Analyse terminée !\n');

