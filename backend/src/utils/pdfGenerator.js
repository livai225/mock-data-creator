import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFGenerator {
  // Générer les statuts d'une SARL
  static async generateStatuts(company, associates) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `statuts_${company.company_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../../generated', fileName);
        
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // En-tête
        doc.fontSize(20).font('Helvetica-Bold').text('STATUTS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`${company.company_name}`, { align: 'center' });
        doc.fontSize(12).text(`Société à Responsabilité Limitée (SARL)`, { align: 'center' });
        doc.moveDown(2);

        // Article 1 - Forme
        doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 1 - FORME');
        doc.fontSize(11).font('Helvetica').text(
          `Il est formé entre les soussignés une Société à Responsabilité Limitée (SARL) régie par les lois et règlements en vigueur en République de Côte d'Ivoire, notamment par l'Acte Uniforme OHADA relatif au droit des sociétés commerciales et du groupement d'intérêt économique, ainsi que par les présents statuts.`
        );
        doc.moveDown();

        // Article 2 - Dénomination
        doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 2 - DÉNOMINATION');
        doc.fontSize(11).font('Helvetica').text(
          `La société a pour dénomination sociale : "${company.company_name}"`
        );
        doc.moveDown();

        // Article 3 - Siège social
        doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 3 - SIÈGE SOCIAL');
        doc.fontSize(11).font('Helvetica').text(
          `Le siège social est fixé à : ${company.address}, ${company.city}, Côte d'Ivoire.`
        );
        doc.moveDown();

        // Article 4 - Objet
        doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 4 - OBJET SOCIAL');
        doc.fontSize(11).font('Helvetica').text(
          `La société a pour objet : ${company.activity}`
        );
        doc.moveDown();

        // Article 5 - Durée
        doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 5 - DURÉE');
        doc.fontSize(11).font('Helvetica').text(
          `La durée de la société est fixée à quatre-vingt-dix-neuf (99) ans à compter de son immatriculation au Registre du Commerce et du Crédit Mobilier (RCCM), sauf dissolution anticipée ou prorogation.`
        );
        doc.moveDown();

        // Article 6 - Capital social
        doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 6 - CAPITAL SOCIAL');
        doc.fontSize(11).font('Helvetica').text(
          `Le capital social est fixé à la somme de ${parseInt(company.capital).toLocaleString('fr-FR')} FCFA (${this.numberToWords(company.capital)} francs CFA), divisé en ${associates.length > 0 ? associates.reduce((sum, a) => sum + parseInt(a.parts), 0) : 100} parts sociales de valeur nominale égale.`
        );
        doc.moveDown();

        // Article 7 - Répartition du capital
        if (associates.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 7 - RÉPARTITION DU CAPITAL');
          doc.fontSize(11).font('Helvetica').text('Le capital social est réparti comme suit :');
          doc.moveDown(0.5);
          
          associates.forEach((associate, index) => {
            doc.fontSize(10).text(
              `${index + 1}. ${associate.name} : ${associate.parts} parts sociales (${associate.percentage}%)`
            );
          });
          doc.moveDown();
        }

        // Article 8 - Gérance
        doc.fontSize(14).font('Helvetica-Bold').text('ARTICLE 8 - GÉRANCE');
        doc.fontSize(11).font('Helvetica').text(
          `La société est gérée par ${company.gerant || 'un ou plusieurs gérants'} nommé(s) par l'assemblée des associés.`
        );
        doc.moveDown();

        // Pied de page
        doc.moveDown(2);
        doc.fontSize(10).text(`Fait à ${company.city}, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
        doc.moveDown();
        doc.text('Les associés', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({ fileName, filePath });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Générer la DSV (Déclaration de Souscription et de Versement)
  static async generateDSV(company, associates) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `dsv_${company.company_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../../generated', fileName);
        
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // En-tête
        doc.fontSize(18).font('Helvetica-Bold').text('DÉCLARATION DE SOUSCRIPTION ET DE VERSEMENT', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(12).font('Helvetica').text(
          `Je soussigné(e), ${company.gerant || 'le gérant'}, agissant en qualité de gérant de la société "${company.company_name}", SARL au capital de ${parseInt(company.capital).toLocaleString('fr-FR')} FCFA, dont le siège social est situé à ${company.address}, ${company.city}, déclare que :`
        );
        doc.moveDown();

        doc.fontSize(11).text('1. Le capital social a été intégralement souscrit ;');
        doc.moveDown(0.5);
        doc.text('2. Les parts sociales ont été réparties comme suit :');
        doc.moveDown(0.5);

        if (associates.length > 0) {
          associates.forEach((associate, index) => {
            doc.fontSize(10).text(
              `   - ${associate.name} : ${associate.parts} parts (${associate.percentage}%)`
            );
          });
        }

        doc.moveDown();
        doc.fontSize(11).text('3. Les fonds correspondant aux apports en numéraire ont été déposés.');
        doc.moveDown(2);

        doc.text(`Fait à ${company.city}, le ${new Date().toLocaleDateString('fr-FR')}`);
        doc.moveDown(2);
        doc.text('Le Gérant');

        doc.end();

        stream.on('finish', () => {
          resolve({ fileName, filePath });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Convertir un nombre en lettres (simplifié)
  static numberToWords(num) {
    // Implémentation simplifiée - à améliorer pour la production
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (num === 0) return 'zéro';
    if (num < 10) return units[num];
    
    // Pour les grands nombres, retourner le nombre tel quel
    return num.toString();
  }

  // Générer tous les documents pour une entreprise
  static async generateAllDocuments(company, associates) {
    const documents = [];

    try {
      // Générer les statuts
      const statuts = await this.generateStatuts(company, associates);
      documents.push({
        type: 'statuts',
        name: 'Statuts',
        ...statuts
      });

      // Générer la DSV
      const dsv = await this.generateDSV(company, associates);
      documents.push({
        type: 'dsv',
        name: 'Déclaration de Souscription et de Versement',
        ...dsv
      });

      return documents;
    } catch (error) {
      throw new Error(`Erreur lors de la génération des documents: ${error.message}`);
    }
  }
}

export default PDFGenerator;
