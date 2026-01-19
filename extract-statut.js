import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'models_ecriture', 'SARL PLURIPERSONEL', "STATUT Friends forage Cote D'ivoire.docx");

mammoth.extractRawText({path: filePath})
  .then(result => {
    fs.writeFileSync('statut_original.txt', result.value, 'utf8');
    console.log('Fichier extrait avec succès!');
    console.log('Longueur:', result.value.length, 'caractères');
  })
  .catch(err => {
    console.error('Erreur:', err);
  });
