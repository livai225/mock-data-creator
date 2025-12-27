/**
 * Générateur de PDF avec Puppeteer
 * Solution professionnelle et robuste pour la génération de documents PDF
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Instance du navigateur (réutilisée pour de meilleures performances)
let browserInstance = null;

/**
 * Obtenir ou créer une instance de navigateur
 */
const getBrowser = async () => {
  if (!browserInstance) {
    console.log('🚀 Lancement de Puppeteer...');
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log('✅ Puppeteer lancé avec succès');
  }
  return browserInstance;
};

/**
 * Fermer le navigateur (à appeler lors de l'arrêt du serveur)
 */
export const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log('🔒 Navigateur Puppeteer fermé');
  }
};

/**
 * Styles CSS communs pour tous les documents
 */
const getCommonStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
  }
  
  body {
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    background: white;
  }
  
  .document {
    max-width: 100%;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #1a365d;
  }
  
  .header h1 {
    font-size: 16pt;
    font-weight: bold;
    color: #1a365d;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .header .subtitle {
    font-size: 10pt;
    color: #666;
  }
  
  .main-title {
    text-align: center;
    font-size: 18pt;
    font-weight: bold;
    margin: 30px 0 20px 0;
    color: #1a365d;
    text-transform: uppercase;
  }
  
  .company-name {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 15px 0;
    padding: 10px 20px;
    background-color: #FFF3CD;
    border-radius: 5px;
    display: inline-block;
  }
  
  .company-name-container {
    text-align: center;
    margin: 20px 0;
  }
  
  .section-title {
    font-size: 12pt;
    font-weight: bold;
    margin: 25px 0 10px 0;
    color: #1a365d;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
  }
  
  .article-title {
    font-size: 11pt;
    font-weight: bold;
    margin: 20px 0 8px 0;
    color: #2c3e50;
  }
  
  .article-content {
    text-align: justify;
    margin-bottom: 10px;
  }
  
  .info-row {
    display: flex;
    margin: 8px 0;
  }
  
  .info-label {
    font-weight: bold;
    min-width: 200px;
    color: #333;
  }
  
  .info-value {
    flex: 1;
  }
  
  .signature-section {
    margin-top: 40px;
    page-break-inside: avoid;
  }
  
  .signature-row {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }
  
  .signature-box {
    text-align: center;
    width: 45%;
  }
  
  .signature-line {
    border-top: 1px solid #333;
    margin-top: 50px;
    padding-top: 5px;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .text-center {
    text-align: center;
  }
  
  .text-bold {
    font-weight: bold;
  }
  
  .mt-20 {
    margin-top: 20px;
  }
  
  .mb-10 {
    margin-bottom: 10px;
  }
  
  .separator {
    border-top: 1px solid #ccc;
    margin: 15px 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  table th, table td {
    border: 1px solid #333;
    padding: 8px;
    text-align: left;
  }
  
  table th {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9pt;
    color: #666;
    padding: 10px 0;
    border-top: 1px solid #ccc;
  }
`;

/**
 * Formater une date au format français
 */
const formatDate = (dateString) => {
  if (!dateString) return '[DATE]';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Convertir un nombre en lettres
 */
const numberToWords = (num) => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  if (num === 0) return 'zéro';
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (ten === 7 || ten === 9) {
      return tens[ten] + (one > 0 ? '-' + ones[10 + one] : '');
    }
    return tens[ten] + (one > 0 ? '-' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return (hundred === 1 ? 'cent' : ones[hundred] + ' cent') + 
           (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (thousand === 1 ? 'mille' : numberToWords(thousand) + ' mille') + 
           (remainder > 0 ? ' ' + numberToWords(remainder) : '');
  }
  return num.toString();
};

/**
 * Échapper les caractères HTML
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Template HTML: Statuts SARL
 */
const generateStatutsHTML = (company, associates, managers) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital)).toUpperCase();
  const duree = company.duree_societe || 99;
  
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || 'CNI';
  const gerantNumId = gerant?.numero_identite || '[NUMÉRO]';
  const gerantDateDelivranceId = gerant?.date_delivrance_id ? formatDate(gerant.date_delivrance_id) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = gerant?.date_validite_id ? formatDate(gerant.date_validite_id) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || 'la république de Côte d\'Ivoire';
  
  const isUnipersonnelle = !associates || associates.length <= 1;
  const nombreParts = associates?.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) || Math.floor(capital / 5000);
  const valeurPart = capital / nombreParts;
  
  const annee = new Date().getFullYear();
  const dateActuelle = formatDate(new Date().toISOString());
  
  // Construire l'objet social
  const objetSocial = company.activity || '[OBJET SOCIAL]';
  
  // Liste des associés pour le tableau
  let associesTableRows = '';
  let totalApports = 0;
  
  if (associates && associates.length > 0) {
    associates.forEach((associe, index) => {
      const parts = parseInt(associe.parts) || 0;
      const apport = (capital * parts) / nombreParts;
      totalApports += apport;
      associesTableRows += `
        <tr>
          <td>${escapeHtml(associe.name || '[NOM ASSOCIÉ]')}</td>
          <td>${parts} parts</td>
          <td>${apport.toLocaleString('fr-FR')} FCFA</td>
        </tr>
      `;
    });
  } else {
    totalApports = capital;
    associesTableRows = `
      <tr>
        <td>${escapeHtml(gerantNom)}</td>
        <td>${nombreParts} parts</td>
        <td>${capital.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="document">
        <h1 class="main-title">STATUTS</h1>
        <p class="text-center text-bold">SOCIÉTÉ À RESPONSABILITÉ LIMITÉE</p>
        
        <div class="company-name-container">
          <span class="company-name">« ${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')} »</span>
        </div>
        
        ${company.sigle ? `<p class="text-center">Sigle : ${escapeHtml(company.sigle)}</p>` : ''}
        
        <p class="text-center mt-20">
          AYANT SON SIÈGE SOCIAL À ${escapeHtml((company.address || '[ADRESSE]').toUpperCase())}, ${escapeHtml((company.city || 'ABIDJAN').toUpperCase())}
        </p>
        
        <div class="separator"></div>
        
        <p class="text-center">L'An ${numberToWords(annee)},</p>
        <p class="text-center">Le ${dateActuelle}</p>
        
        <p class="mt-20">Le soussigné${isUnipersonnelle ? '' : 's'},</p>
        
        <p class="mt-20">
          <strong>M. ${escapeHtml(gerantNom)}</strong>, ${escapeHtml(gerantProfession)}, résident à ${escapeHtml(gerantAdresse)} 
          de nationalité ${escapeHtml(gerantNationalite)} né(e) le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)} 
          et titulaire de la ${gerantTypeId} ${escapeHtml(gerantNumId)} délivré(e) le ${gerantDateDelivranceId} 
          et valable ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}.
        </p>
        
        <p class="mt-20">
          ${isUnipersonnelle ? 'A établi' : 'Ont établi'} par les présentes, les statuts de la Société à Responsabilité Limitée dont la teneur suit :
        </p>
        
        <h2 class="section-title">TITRE I : DISPOSITIONS GÉNÉRALES</h2>
        
        <h3 class="article-title">ARTICLE 1 - FORME</h3>
        <p class="article-content">
          Il est constitué par ${isUnipersonnelle ? 'le soussigné' : 'les soussignés'}, une Société à Responsabilité Limitée 
          devant exister entre ${isUnipersonnelle ? 'lui' : 'eux'} et tous propriétaires de parts sociales ultérieures, 
          qui sera régie par l'Acte Uniforme révisé de l'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales 
          et du Groupement d'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires 
          applicables et les présents statuts.
        </p>
        
        <h3 class="article-title">ARTICLE 2 - DÉNOMINATION</h3>
        <p class="article-content">
          La société a pour dénomination : <strong>${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')}</strong>
        </p>
        <p class="article-content">
          La dénomination sociale doit figurer sur tous les actes et documents émanant de la société et destinés aux tiers, 
          notamment les lettres, les factures, les annonces et publications diverses. Elle doit être précédée ou suivie 
          immédiatement en caractère lisible de l'indication Société à Responsabilité Limitée ou SARL, du montant de son 
          capital social, de l'adresse de son siège social et de la mention de son immatriculation au registre du commerce 
          et du Crédit Mobilier.
        </p>
        
        <h3 class="article-title">ARTICLE 3 - OBJET</h3>
        <p class="article-content">La société a pour objet en CÔTE D'IVOIRE :</p>
        <p class="article-content">${escapeHtml(objetSocial)}</p>
        <p class="article-content">- l'acquisition, la location et la vente de tous biens meubles et immeubles.</p>
        <p class="article-content">- l'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.</p>
        <p class="article-content">- la prise en location gérance de tous fonds de commerce.</p>
        <p class="article-content">- la prise de participation dans toute société existante ou devant être créée</p>
        <p class="article-content">- et généralement, toute opérations financières, commerciales, industrielles, mobilières et immobilière, se rapportant directement ou indirectement à l'objet social ou pouvant en faciliter l'extension ou le développement.</p>
        
        <h3 class="article-title">ARTICLE 4 - SIÈGE SOCIAL</h3>
        <p class="article-content">
          Le siège social est fixé à : <strong>${escapeHtml(company.address || '[ADRESSE]')}, ${escapeHtml(company.city || 'Abidjan')}</strong>
        </p>
        <p class="article-content">
          Il peut être transféré dans les limites du territoire de la République de CÔTE D'IVOIRE par décision de la gérance 
          qui modifie en conséquence les statuts, sous réserve de la ratification de cette décision par la plus prochaine 
          Assemblée Générale Ordinaire.
        </p>
        
        <h3 class="article-title">ARTICLE 5 - DURÉE</h3>
        <p class="article-content">
          La durée de la société est de <strong>${numberToWords(duree)} (${duree}) années</strong>, sauf dissolution anticipée ou prorogation.
        </p>
        
        <h3 class="article-title">ARTICLE 6 - EXERCICE SOCIAL</h3>
        <p class="article-content">
          L'exercice social commence le premier janvier et se termine le trente et-un décembre de chaque année.
        </p>
        
        <h3 class="article-title">ARTICLE 7 - APPORTS</h3>
        <p class="article-content"><strong>Apports en numéraires</strong></p>
        <p class="article-content">
          Lors de la constitution, ${isUnipersonnelle ? 'le soussigné a fait' : 'les soussignés ont fait'} apport à la société, à savoir :
        </p>
        
        <table>
          <thead>
            <tr>
              <th>Identité des apporteurs</th>
              <th>Nombre de parts</th>
              <th>Montant apport en numéraire</th>
            </tr>
          </thead>
          <tbody>
            ${associesTableRows}
          </tbody>
          <tfoot>
            <tr>
              <th>TOTAL</th>
              <th>${nombreParts} parts</th>
              <th>${totalApports.toLocaleString('fr-FR')} FCFA</th>
            </tr>
          </tfoot>
        </table>
        
        <h3 class="article-title">ARTICLE 8 - CAPITAL SOCIAL</h3>
        <p class="article-content">
          Le capital social est fixé à la somme de <strong>${capitalWords} FRANCS CFA (${capital.toLocaleString('fr-FR')} FCFA)</strong> 
          divisé en ${nombreParts} parts sociales de ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA, 
          entièrement souscrites et libérées intégralement, numérotées de 1 à ${nombreParts}.
        </p>
        
        <div class="page-break"></div>
        
        <h2 class="section-title">TITRE II : FONCTIONNEMENT - DISSOLUTION</h2>
        
        <h3 class="article-title">ARTICLE 9 - GÉRANCE</h3>
        <p class="article-content">
          La société est gérée par une ou plusieurs personnes physiques. Le gérant est nommé pour une durée indéterminée.
        </p>
        <p class="article-content">
          <strong>Est nommé gérant de la société :</strong>
        </p>
        <p class="article-content">
          M. ${escapeHtml(gerantNom)}, ${escapeHtml(gerantProfession)}, résident à ${escapeHtml(gerantAdresse)} 
          de nationalité ${escapeHtml(gerantNationalite)} né(e) le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)} 
          et titulaire de la ${gerantTypeId} ${escapeHtml(gerantNumId)} délivré(e) le ${gerantDateDelivranceId} 
          et valable ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}, qui accepte.
        </p>
        
        <h3 class="article-title">ARTICLE 10 - POUVOIRS DU GÉRANT</h3>
        <p class="article-content">
          Le gérant peut faire tous les actes de gestion dans l'intérêt de la société. Dans les rapports avec les tiers, 
          le gérant est investi des pouvoirs les plus étendus pour agir en toute circonstance, au nom de la société.
        </p>
        
        <h3 class="article-title">ARTICLE 11 - DISSOLUTION</h3>
        <p class="article-content">
          La société à responsabilité limitée est dissoute pour les causes communes à toutes les sociétés. 
          La dissolution de la société entraîne sa mise en liquidation.
        </p>
        
        <div class="signature-section">
          <p class="text-center">Fait à ${escapeHtml(company.city || 'Abidjan')}, le ${dateActuelle}</p>
          <p class="text-center mt-20">EN QUATRE (4) EXEMPLAIRES ORIGINAUX</p>
          
          <div class="signature-row">
            <div class="signature-box">
              <p><strong>${isUnipersonnelle ? 'L\'Associé Unique' : 'Les Associés'}</strong></p>
              <div class="signature-line">${escapeHtml(gerantNom)}</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Contrat de Bail Commercial
 */
const generateContratBailHTML = (company, additionalData = {}) => {
  const gerant = company.managers && company.managers.length > 0 ? company.managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  
  // Récupérer les données du bailleur - vérifier plusieurs sources
  let bailleurNom = additionalData.bailleur_nom || '[NOM DU BAILLEUR]';
  let bailleurTel = additionalData.bailleur_telephone || additionalData.bailleur_contact || '[TÉLÉPHONE]';
  
  // Si bailleur est un objet dans additionalData
  if (additionalData.bailleur && typeof additionalData.bailleur === 'object') {
    const b = additionalData.bailleur;
    if (b.nom && b.prenom) {
      bailleurNom = `${b.nom} ${b.prenom}`.trim();
    } else if (b.nom) {
      bailleurNom = b.nom;
    }
    if (b.telephone) {
      bailleurTel = b.telephone;
    } else if (b.contact) {
      bailleurTel = b.contact;
    }
  }
  
  const loyerMensuel = additionalData.loyer_mensuel || 0;
  const cautionMois = additionalData.caution_mois || 2;
  const avanceMois = additionalData.avance_mois || 2;
  const dureeBail = additionalData.duree_bail || 1;
  const garantieTotale = loyerMensuel * (cautionMois + avanceMois);
  
  const lotNumero = additionalData.lot || company.lot || '';
  const ilotNumero = additionalData.ilot || company.ilot || '';
  
  // Calculer les dates de début et fin du bail
  const dateDebut = additionalData.date_debut ? formatDate(additionalData.date_debut) : formatDate(new Date().toISOString());
  let dateFin = additionalData.date_fin ? formatDate(additionalData.date_fin) : null;
  
  // Si pas de date de fin fournie, calculer à partir de la durée
  if (!dateFin && dureeBail) {
    const dateDebutObj = additionalData.date_debut ? new Date(additionalData.date_debut) : new Date();
    const dateFinObj = new Date(dateDebutObj);
    dateFinObj.setFullYear(dateFinObj.getFullYear() + dureeBail);
    dateFin = formatDate(dateFinObj.toISOString());
  }
  
  const dateActuelle = formatDate(new Date().toISOString());

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="document">
        <h1 class="main-title">CONTRAT DE BAIL COMMERCIAL</h1>
        
        <p class="mt-20"><strong>Entre les soussignés :</strong></p>
        
        <p class="mt-20">
          <strong>${escapeHtml(bailleurNom)}</strong>, Téléphone : <strong>${escapeHtml(bailleurTel)}</strong>, 
          Propriétaire, ci-après dénommé « <strong>le bailleur</strong> »
        </p>
        
        <p class="text-center mt-20">D'une part</p>
        
        <p class="text-center">Et</p>
        
        <p class="mt-20">
          La société dénommée « <strong>${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')}</strong> » 
          Représentée par son gérant Monsieur <strong>${escapeHtml(gerantNom)}</strong>, 
          locataire ci-après dénommé « <strong>le preneur</strong> »
        </p>
        
        <p class="text-center mt-20">D'autre part.</p>
        
        <div class="separator"></div>
        
        <p class="text-bold">Il a été dit et convenu ce qui suit :</p>
        
        <p class="article-content">
          Le bailleur loue et donne par les présentes au preneur, qui accepte, les locaux ci-après désignés sis à 
          ${escapeHtml(company.address || '[ADRESSE]')}${lotNumero ? `, LOT ${lotNumero}` : ''}${ilotNumero ? `, ILOT ${ilotNumero}` : ''} 
          en vue de l'exploitation de la « ${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')} ».
        </p>
        
        <h3 class="article-title">Article 1 : Désignation</h3>
        <p class="article-content">
          Il est précisé que l'emplacement est livré nu, et que le preneur devra supporter le coût et les frais d'eaux, 
          d'électricité, téléphone et en général, tous travaux d'aménagements.
        </p>
        <p class="article-content">
          Tel au surplus que le local se poursuit et se comporte sans plus ample description, le preneur déclarant avoir vu, 
          visité et parfaitement connaître les locaux loués, qu'il consent à occuper dans leur état actuel.
        </p>
        
        <h3 class="article-title">Article 2 : Durée</h3>
        <p class="article-content">
          Le présent bail est conclu pour une durée de <strong>${numberToWords(dureeBail)} (${String(dureeBail).padStart(2, '0')}) an${dureeBail > 1 ? 's' : ''}</strong> 
          allant du ${dateDebut}${dateFin ? ` au ${dateFin}` : ''}. 
          À son expiration, le bail se renouvellera par tacite reconduction, sauf dénonciation par acte extra judiciaire, 
          au plus tard TROIS (03) mois avant la date d'expiration de la période triennale concernée.
        </p>
        
        <h3 class="article-title">Article 3 : Renouvellement et cession</h3>
        <p class="article-content">
          - Le preneur qui a droit au renouvellement de son bail, doit demander le renouvellement de celui-ci au bailleur, 
          par écrit, au plus tard deux (2) mois avant la date d'expiration du bail.
        </p>
        <p class="article-content">
          - Le preneur qui n'a pas formé sa demande de renouvellement dans ce délai est déchu du droit de renouvellement du bail.
        </p>
        <p class="article-content">
          Le BAILLEUR qui n'a pas fait connaître sa réponse à la demande de renouvellement au plus tard UN (01) mois 
          avant l'expiration du bail est réputé avoir accepté le principe du renouvellement de ce bail.
        </p>
        
        <h3 class="article-title">Article 4 : Obligation du bailleur</h3>
        <p class="article-content">
          - Le bailleur fait procéder, à ses frais dans les locaux donnés à bail, à toutes les grosses réparations devenues nécessaires et urgentes.
        </p>
        <p class="article-content">
          - Le bailleur délivre les locaux en bon état.
        </p>
        <p class="article-content">
          - Le bailleur autorise le preneur à apposer sur les façades extérieures des locaux les enseignes et plaques indicatrices relatives à son commerce.
        </p>
        
        <h3 class="article-title">Article 5 : Obligation du preneur</h3>
        <p class="article-content">
          - Le preneur doit payer le loyer aux termes convenus, entre les mains du bailleur.
        </p>
        <p class="article-content">
          - Le preneur est tenu d'exploiter les locaux donnés à bail, en bon père de famille, et conformément à la destination prévue au bail.
        </p>
        <p class="article-content">
          - Le preneur est tenu des réparations d'entretien ; il répond des dégradations ou des pertes dues à un défaut d'entretien en cours de bail.
        </p>
        
        <h3 class="article-title">Article 6 : Loyer</h3>
        <p class="article-content">
          La présente location est consentie et acceptée moyennant un loyer mensuel de 
          <strong>${numberToWords(Math.floor(loyerMensuel)).toUpperCase()} (${loyerMensuel.toLocaleString('fr-FR')}) francs CFA</strong>, 
          payable à la fin du mois au plus tard le cinq (05) du mois suivant.
        </p>
        <p class="article-content">
          De plus une garantie de <strong>${numberToWords(Math.floor(garantieTotale)).toUpperCase()} (${garantieTotale.toLocaleString('fr-FR')} FCFA)</strong> 
          dont ${cautionMois} mois de caution et ${avanceMois} mois d'avance.
        </p>
        
        <h3 class="article-title">Article 7 : Sous-location</h3>
        <p class="article-content">
          Sauf stipulation contraire du bail, toute sous-location totale ou partielle est interdite.
        </p>
        
        <h3 class="article-title">Article 8 : Clause résolutoire</h3>
        <p class="article-content">
          À défaut de paiement d'un seul terme de loyer ou en cas d'inexécution d'une clause du bail, le bailleur pourra 
          demander à la juridiction compétente la résiliation du bail et l'expulsion du preneur.
        </p>
        
        <h3 class="article-title">Article 9 : Élection de domicile</h3>
        <p class="article-content">
          En cas de litige, si aucun accord amiable n'est trouvé, le tribunal d'Abidjan sera seul compétent.
        </p>
        
        <div class="signature-section">
          <p class="text-center">Fait en deux exemplaires et de bonne foi.</p>
          <p class="text-center">À ${escapeHtml(company.city || 'Abidjan')}, le ${dateActuelle}</p>
          
          <div class="signature-row">
            <div class="signature-box">
              <p><strong>Le Bailleur</strong></p>
              <div class="signature-line"></div>
            </div>
            <div class="signature-box">
              <p><strong>Le Preneur</strong></p>
              <div class="signature-line"></div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Liste des Gérants
 */
const generateListeGerantsHTML = (company, managers, additionalData = {}) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  
  // Gérer la durée du mandat correctement
  let dureeMandatText = 'Durée indéterminée';
  let dureeMandatAnnees = null;
  
  if (gerant?.duree_mandat) {
    if (typeof gerant.duree_mandat === 'number') {
      dureeMandatAnnees = gerant.duree_mandat;
      dureeMandatText = `${numberToWords(gerant.duree_mandat)} (${gerant.duree_mandat}) ans`;
    } else if (gerant.duree_mandat === 'determinee' && gerant.duree_mandat_annees) {
      dureeMandatAnnees = gerant.duree_mandat_annees;
      dureeMandatText = `${numberToWords(gerant.duree_mandat_annees)} (${gerant.duree_mandat_annees}) ans`;
    } else if (gerant.duree_mandat === 'indeterminee') {
      dureeMandatText = 'Durée indéterminée';
    }
  } else {
    // Par défaut, 4 ans
    dureeMandatAnnees = 4;
    dureeMandatText = `${numberToWords(4)} (4) ans`;
  }
  
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'CNI';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '[NUMÉRO]';
  const gerantDateDelivranceId = gerant?.date_delivrance_id || gerant?.dateDelivranceId ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = gerant?.date_validite_id || gerant?.dateValiditeId ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || gerant?.lieuDelivranceId || 'la république de Côte d\'Ivoire';
  
  // Récupérer lot et îlot
  const lotNumero = additionalData.lot || company.lot || '';
  const ilotNumero = additionalData.ilot || company.ilot || '';
  
  // Construire l'adresse complète avec lot et îlot si disponibles
  let adresseComplete = company.address || '[ADRESSE]';
  if (lotNumero || ilotNumero) {
    const parts = [];
    if (lotNumero) parts.push(`Lot ${lotNumero}`);
    if (ilotNumero) parts.push(`Îlot ${ilotNumero}`);
    adresseComplete = `${adresseComplete}${parts.length > 0 ? `, ${parts.join(', ')}` : ''}`;
  }

  // Format selon le générateur : "Est nommé Gérant pour une durée de X ans (X ans)"
  const dureeText = dureeMandatAnnees ? `${dureeMandatAnnees} ans (${dureeMandatAnnees} ans)` : dureeMandatText;
  
  // Format selon le générateur : une seule ligne avec toutes les infos
  const gerantInfoLine = `M. ${escapeHtml(gerantNom)}, ${escapeHtml(gerantProfession)} résidant à ${escapeHtml(gerantAdresse)} de nationalité ${escapeHtml(gerantNationalite)}, né le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)} et titulaire du ${gerantTypeId} N° ${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}`;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="document">
        <p class="article-content">« ${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')} »</p>
        
        <p class="article-content mt-10">
          Au capital de ${(company.capital || 0).toLocaleString('fr-FR')} FCFA, située à ${escapeHtml(adresseComplete)}
        </p>
        
        <div class="separator"></div>
        
        <h1 class="main-title">LISTE DE DIRIGEANT</h1>
        
        <div class="separator"></div>
        
        <p class="article-content mt-20">
          Est nommé Gérant pour une durée de ${dureeText}
        </p>
        
        <p class="article-content mt-20">
          ${gerantInfoLine}
        </p>
        
        <div class="separator"></div>
        
        <div class="signature-section">
          <p class="text-center mt-20"><strong>Signature</strong></p>
          <p class="text-center mt-20">_____________________</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Déclaration sur l'Honneur
 */
const generateDeclarationHonneurHTML = (company, managers) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNomComplet = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU NAISSANCE]';
  const gerantDomicile = gerant?.adresse || '[DOMICILE]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantFonction = 'Gérant'; // Fonction dans la société
  const societeNom = company.company_name || '[NOM SOCIÉTÉ]';
  const societeForme = company.company_type === 'SARLU' ? 'SARL U' : 'SARL';
  const societeSiege = company.address ? `${company.address}, ${company.city || 'Abidjan'}` : '[SIÈGE]';
  const dateActuelle = formatDate(new Date().toISOString());
  const lieu = company.city || 'Abidjan';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="document">
        <p class="text-center mb-10">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
        <p class="text-center mb-10">Union - Discipline - Travail</p>
        
        <div class="separator"></div>
        
        <h1 class="main-title">DÉCLARATION SUR L'HONNEUR</h1>
        
        <div class="separator"></div>
        
        <p class="article-content mt-20">Je soussigné(e),</p>
        
        <p class="article-content mt-10">
          <strong>${escapeHtml(gerantNomComplet)}</strong>
        </p>
        
        <p class="article-content mt-10">
          De nationalité ${escapeHtml(gerantNationalite)}
        </p>
        
        <p class="article-content mt-10">
          Né(e) le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)}
        </p>
        
        <p class="article-content mt-10">
          Domicilié(e) à ${escapeHtml(gerantDomicile)}
        </p>
        
        <p class="article-content mt-10">
          De profession ${escapeHtml(gerantProfession)}
        </p>
        
        <p class="article-content mt-10">
          Agissant en qualité de ${gerantFonction} de la société :
        </p>
        
        <p class="article-content mt-10">
          « ${escapeHtml(societeNom)} »
        </p>
        
        <p class="article-content mt-10">
          ${societeForme}
        </p>
        
        <p class="article-content mt-10">
          Siège social : ${escapeHtml(societeSiege)}
        </p>
        
        <div class="separator"></div>
        
        <p class="article-content mt-20 text-bold">DÉCLARE SUR L'HONNEUR :</p>
        
        <p class="article-content mt-10">
          1. N'avoir fait l'objet d'aucune condamnation pénale pour crime ou délit ;
        </p>
        
        <p class="article-content mt-10">
          2. N'avoir fait l'objet d'aucune mesure d'interdiction, de déchéance ou d'incapacité prévue par les textes en vigueur ;
        </p>
        
        <p class="article-content mt-10">
          3. Ne pas exercer de fonction incompatible avec l'exercice d'une activité commerciale ;
        </p>
        
        <p class="article-content mt-10">
          4. Que les informations fournies dans le cadre de cette déclaration sont exactes et sincères.
        </p>
        
        <div class="separator"></div>
        
        <p class="article-content mt-20">
          Je reconnais avoir été informé(e) des sanctions pénales encourues en cas de fausse déclaration.
        </p>
        
        <p class="article-content mt-10">
          Fait pour servir et valoir ce que de droit.
        </p>
        
        <div class="signature-section">
          <p class="mt-20">À ${escapeHtml(lieu)}, le ${dateActuelle}</p>
          <p class="mt-20">Signature précédée de la mention « Lu et approuvé »</p>
          <p class="text-center mt-20">_____________________</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: DSV
 */
const generateDSVHTML = (company, associates, managers) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital));
  
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance ? formatDate(gerant.date_naissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || 'CNI';
  const gerantNumId = gerant?.numero_identite || '[NUMÉRO]';
  const gerantDateDelivranceId = gerant?.date_delivrance_id ? formatDate(gerant.date_delivrance_id) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = gerant?.date_validite_id ? formatDate(gerant.date_validite_id) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || 'la république de Côte d\'Ivoire';
  
  const totalParts = associates && associates.length > 0 
    ? associates.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0)
    : Math.floor(capital / 5000);
  const valeurPart = capital / totalParts;
  
  const annee = new Date().getFullYear();
  const dateActuelle = formatDate(new Date().toISOString());
  
  // Construire l'objet social complet avec le texte additionnel
  const objetSocial = company.activity || '[OBJET SOCIAL]';
  const objetSocialComplet = `${objetSocial}

- l'acquisition, la location et la vente de tous biens meubles et immeubles.

- l'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.

- la prise en location gérance de tous fonds de commerce.

- la prise de participation dans toute société existante ou devant être créée

- et généralement, toute opérations financières, commerciales, industrielles, mobilières et immobilière, se rapportant directement ou indirectement à l'objet social ou pouvant en faciliter l'extension ou le développement.`;
  
  // Tableau des associés avec numérotation des parts
  let associesTableRows = '';
  let totalSouscrit = 0;
  let totalVerse = 0;
  
  if (associates && associates.length > 0) {
    associates.forEach((associe, index) => {
      const parts = parseInt(associe.parts) || 0;
      const montant = (capital * parts) / totalParts;
      totalSouscrit += montant;
      totalVerse += montant;
      const debutParts = index === 0 ? 1 : associates.slice(0, index).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) + 1;
      const finParts = associates.slice(0, index + 1).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0);
      
      associesTableRows += `
        <tr>
          <td>${escapeHtml(associe.name || '[NOM ASSOCIÉ]')}</td>
          <td>${parts} parts numérotées de ${debutParts} à ${finParts} inclus</td>
          <td>${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</td>
          <td>${montant.toLocaleString('fr-FR')} FCFA</td>
          <td>${montant.toLocaleString('fr-FR')} FCFA</td>
        </tr>
      `;
    });
  } else {
    totalSouscrit = capital;
    totalVerse = capital;
    associesTableRows = `
      <tr>
        <td>${escapeHtml(gerantNom)}</td>
        <td>${totalParts} parts numérotées de 1 à ${totalParts} inclus</td>
        <td>${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</td>
        <td>${capital.toLocaleString('fr-FR')} FCFA</td>
        <td>${capital.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      <div class="document">
        <div class="company-name-container">
          <span class="company-name">DSV DE LA SOCIÉTÉ « ${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')} »</span>
        </div>
        
        <h1 class="main-title">DÉCLARATION DE SOUSCRIPTION ET DE VERSEMENT</h1>
        
        <p class="text-center mb-10">
          <em>(cf Art 314 de l'Acte uniforme révisé du 30 janvier 2014, Art 6 de l'Ordonnance N° 2014-161 du 02 avril 2014)</em>
        </p>
        
        <div class="separator"></div>
        
        <p class="text-center">L'An ${numberToWords(annee)},</p>
        <p class="text-center">Le ${dateActuelle}</p>
        
        <p class="mt-20">Le soussigné,</p>
        
        <p class="article-content mt-20">
          <strong>M. ${escapeHtml(gerantNom)}</strong>, ${escapeHtml(gerantProfession)}, résident à ${escapeHtml(gerantAdresse)} 
          de nationalité ${escapeHtml(gerantNationalite)} né(e) le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)} 
          et titulaire de la ${gerantTypeId} ${escapeHtml(gerantNumId)} délivré(e) le ${gerantDateDelivranceId} 
          et valable ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}.
        </p>
        
        <h2 class="section-title">EXPOSÉ PRÉALABLE</h2>
        
        <p class="article-content">
          Par Acte sous seing Privé en date du ${dateActuelle}, ont établi les statuts de la Société à Responsabilité Limitée 
          dont les principales caractéristiques sont les suivantes :
        </p>
        
        <div class="info-row mt-20">
          <span class="info-label">1 - FORME :</span>
          <span class="info-value">La société constituée est une société à Responsabilité Limitée régie par les dispositions de l'Acte uniforme révisé de l'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et ses présents statuts.</span>
        </div>
        
        <div class="info-row mt-20">
          <span class="info-label">2 - DÉNOMINATION :</span>
          <span class="info-value"><strong>${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')}</strong></span>
        </div>
        
        <div class="info-row mt-20">
          <span class="info-label">3 - OBJET :</span>
          <span class="info-value">La société a pour objet en CÔTE D'IVOIRE :<br><br>${escapeHtml(objetSocialComplet).replace(/\n/g, '<br>')}</span>
        </div>
        
        <div class="info-row mt-20">
          <span class="info-label">4 - SIÈGE SOCIAL :</span>
          <span class="info-value">Le siège social est fixé à : ${escapeHtml(company.address || '[ADRESSE]')}, ${escapeHtml(company.city || 'Abidjan')}</span>
        </div>
        
        <div class="info-row mt-20">
          <span class="info-label">5 - DURÉE :</span>
          <span class="info-value">La durée de la société est de ${numberToWords(company.duree_societe || 99)} (${company.duree_societe || 99}) années, sauf dissolution anticipée ou prorogation.</span>
        </div>
        
        <div class="info-row mt-20">
          <span class="info-label">6 - CAPITAL SOCIAL :</span>
          <span class="info-value">Le capital social est fixé à la somme de <strong>${capitalWords.toUpperCase()} FRANCS CFA (${capital.toLocaleString('fr-FR')} FCFA)</strong> divisé en ${totalParts} parts sociales de ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</span>
        </div>
        
        <h2 class="section-title">II- CONSTATATION DE LA LIBÉRATION ET DU DÉPÔT DES FONDS</h2>
        
        <p class="article-content">
          Les soussignés déclarent que les souscriptions et les versements des fonds provenant de la libération des parts sociales ont été effectués comme suit :
        </p>
        
        <table>
          <thead>
            <tr>
              <th>Identité des associés</th>
              <th>Nombre de parts</th>
              <th>Montant nominal</th>
              <th>Montant souscrit</th>
              <th>Versement effectué</th>
            </tr>
          </thead>
          <tbody>
            ${associesTableRows}
          </tbody>
          <tfoot>
            <tr>
              <th>TOTAL</th>
              <th>${totalParts} parts</th>
              <th>${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</th>
              <th>${totalSouscrit.toLocaleString('fr-FR')} FCFA</th>
              <th>${totalVerse.toLocaleString('fr-FR')} FCFA</th>
            </tr>
          </tfoot>
        </table>
        
        <p class="article-content mt-20">
          La somme correspondante à l'ensemble des souscriptions et versements effectués à ce jour, de 
          <strong>${numberToWords(Math.floor(totalVerse)).toLowerCase()} (${totalVerse.toLocaleString('fr-FR')} FCFA)</strong> a été déposée pour le compte 
          de la société et conformément à la loi, dans un compte ouvert à [NOM BANQUE].
        </p>
        
        <p class="article-content text-bold">
          En Foi de quoi, ils ont dressé la présente, pour servir et valoir ce que de droit.
        </p>
        
        <div class="signature-section">
          <p>Fait à ${escapeHtml(company.city || 'Abidjan')}, le ${dateActuelle}</p>
          <p class="mt-20">En Deux (2) exemplaires originaux</p>
          <p class="mt-20"><strong>L'Associé</strong></p>
          <p class="text-center mt-20">${escapeHtml(gerantNom)}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Formulaire CEPICI
 */
const generateFormulaireCEPICIHTML = (company, managers, associates, additionalData = {}) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const capital = parseFloat(company.capital) || 0;
  const dureeSociete = company.duree_societe || 99;
  
  const dateActuelle = formatDate(new Date().toISOString());

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}
        .cepici-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .cepici-header h1 {
          font-size: 14pt;
          margin-bottom: 5px;
        }
        .cepici-header p {
          font-size: 10pt;
          color: #666;
        }
        .form-section {
          border: 1px solid #333;
          padding: 15px;
          margin: 15px 0;
        }
        .form-section h3 {
          background: #f0f0f0;
          padding: 8px;
          margin: -15px -15px 15px -15px;
          border-bottom: 1px solid #333;
        }
        .form-row {
          display: flex;
          margin: 10px 0;
          align-items: flex-start;
        }
        .form-label {
          min-width: 180px;
          font-weight: bold;
          padding-right: 10px;
        }
        .form-value {
          flex: 1;
          border-bottom: 1px dotted #999;
          min-height: 20px;
          padding-left: 5px;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <div class="cepici-header">
          <h1>RÉPUBLIQUE DE CÔTE D'IVOIRE</h1>
          <p>Union - Discipline - Travail</p>
          <h2 style="margin-top: 15px; color: #1a365d;">CEPICI</h2>
          <p>Centre de Promotion des Investissements en Côte d'Ivoire</p>
          <h3 style="margin-top: 15px;">GUICHET UNIQUE - Création d'Entreprise</h3>
        </div>
        
        <h1 class="main-title" style="font-size: 14pt;">FORMULAIRE UNIQUE DE DEMANDE DE CRÉATION D'ENTREPRISE</h1>
        
        <div class="form-section">
          <h3>SECTION A : IDENTIFICATION DE L'ENTREPRISE</h3>
          
          <div class="form-row">
            <span class="form-label">Dénomination sociale :</span>
            <span class="form-value">${escapeHtml(company.company_name || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Nom commercial :</span>
            <span class="form-value">${escapeHtml(company.company_name || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Sigle :</span>
            <span class="form-value">${escapeHtml(company.sigle || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Durée :</span>
            <span class="form-value">${dureeSociete} ANS</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Forme juridique :</span>
            <span class="form-value">${escapeHtml(company.company_type || 'SARL')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Montant du capital :</span>
            <span class="form-value">${capital.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
        
        <div class="form-section">
          <h3>SECTION B : ACTIVITÉ</h3>
          
          <div class="form-row">
            <span class="form-label">Activité principale :</span>
            <span class="form-value">${escapeHtml(company.activity || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Activités secondaires :</span>
            <span class="form-value"></span>
          </div>
          
          <div class="form-row">
            <span class="form-label">CA prévisionnel :</span>
            <span class="form-value">${company.chiffre_affaires_prev ? company.chiffre_affaires_prev.toLocaleString('fr-FR') + ' FCFA' : '-'}</span>
          </div>
        </div>
        
        <div class="form-section">
          <h3>SECTION C : LOCALISATION DU SIÈGE SOCIAL</h3>
          
          <div class="form-row">
            <span class="form-label">Ville :</span>
            <span class="form-value">${escapeHtml(company.city || 'ABIDJAN')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Commune :</span>
            <span class="form-value">${escapeHtml(additionalData.commune || company.commune || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Quartier :</span>
            <span class="form-value">${escapeHtml(additionalData.quartier || company.quartier || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Adresse :</span>
            <span class="form-value">${escapeHtml(company.address || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Lot n° :</span>
            <span class="form-value" style="max-width: 100px;">${escapeHtml(additionalData.lot || company.lot || '')}</span>
            <span class="form-label" style="min-width: 80px; margin-left: 20px;">Îlot n° :</span>
            <span class="form-value" style="max-width: 100px;">${escapeHtml(additionalData.ilot || company.ilot || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Téléphone :</span>
            <span class="form-value">${escapeHtml(additionalData.telephone || company.telephone || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Email :</span>
            <span class="form-value">${escapeHtml(additionalData.email || company.email || '')}</span>
          </div>
        </div>
        
        <div class="form-section">
          <h3>SECTION D : INFORMATIONS SUR LES DIRIGEANTS</h3>
          
          <p class="text-bold mb-10">DIRIGEANT SOCIAL</p>
          
          <div class="form-row">
            <span class="form-label">Nom et Prénoms :</span>
            <span class="form-value">${gerant ? escapeHtml(`${gerant.nom || ''} ${gerant.prenoms || ''}`.trim()) : ''}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Adresse :</span>
            <span class="form-value">${escapeHtml(gerant?.adresse || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Nationalité :</span>
            <span class="form-value">${escapeHtml(gerant?.nationalite || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Date de naissance :</span>
            <span class="form-value">${gerant?.date_naissance ? formatDate(gerant.date_naissance) : ''}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Lieu de naissance :</span>
            <span class="form-value">${escapeHtml(gerant?.lieu_naissance || '')}</span>
          </div>
          
          <div class="form-row">
            <span class="form-label">Fonction :</span>
            <span class="form-value">GÉRANT</span>
          </div>
        </div>
        
        <div class="signature-section">
          <p>Fait à Abidjan, le ${dateActuelle}</p>
          <p class="mt-20"><strong>Signature</strong></p>
          <p class="text-center mt-20">_____________________</p>
        </div>
        
        <div class="separator mt-20"></div>
        <p class="text-center" style="font-size: 9pt; color: #666;">
          CEPICI : BP V152 ABIDJAN 01 - ABIDJAN PLATEAU 2ème étage immeuble DJEKANOU<br>
          Tél : (225) 20 30 23 85 - Fax : (225) 20 21 40 71 - Site web : www.cepici.gouv.ci
        </p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Générer un PDF à partir du HTML avec Puppeteer
 */
export const generatePDFWithPuppeteer = async (htmlContent, outputPath) => {
  console.log(`📄 [Puppeteer] Génération PDF: ${outputPath}`);
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    });
    
    console.log(`✅ [Puppeteer] PDF généré avec succès: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ [Puppeteer] Erreur génération PDF:`, error);
    throw error;
  } finally {
    await page.close();
  }
};

/**
 * Mapper les noms de documents vers les fonctions de génération HTML
 */
const htmlGenerators = {
  'Statuts SARL': (company, associates, managers, additionalData) => generateStatutsHTML(company, associates, managers),
  'Statuts': (company, associates, managers, additionalData) => generateStatutsHTML(company, associates, managers),
  'Contrat de bail commercial': (company, associates, managers, additionalData) => generateContratBailHTML(company, additionalData),
  'Contrat de bail': (company, associates, managers, additionalData) => generateContratBailHTML(company, additionalData),
  'Formulaire unique CEPICI': (company, associates, managers, additionalData) => generateFormulaireCEPICIHTML(company, managers, associates, additionalData),
  'Formulaire CEPICI': (company, associates, managers, additionalData) => generateFormulaireCEPICIHTML(company, managers, associates, additionalData),
  'Liste des dirigeants/gérants': (company, associates, managers, additionalData) => generateListeGerantsHTML(company, managers, additionalData),
  'Liste de Gérant': (company, associates, managers, additionalData) => generateListeGerantsHTML(company, managers, additionalData),
  'Liste des gérants': (company, associates, managers, additionalData) => generateListeGerantsHTML(company, managers, additionalData),
  "Déclaration sur l'honneur (greffe)": (company, associates, managers, additionalData) => generateDeclarationHonneurHTML(company, managers),
  "Déclaration sur l'honneur": (company, associates, managers, additionalData) => generateDeclarationHonneurHTML(company, managers),
  'Déclaration de Souscription et Versement (DSV)': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers),
  'DSV': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers),
  'Déclaration Souscription/Versement': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers),
};

/**
 * Générer un document PDF avec Puppeteer
 */
export const generateDocumentPDF = async (docName, company, associates = [], managers = [], additionalData = {}, outputPath) => {
  console.log(`\n🔧 [Puppeteer] Génération document: "${docName}"`);
  
  // Trouver le générateur HTML approprié
  let generator = htmlGenerators[docName];
  
  if (!generator) {
    // Essayer de trouver par correspondance partielle
    for (const [key, gen] of Object.entries(htmlGenerators)) {
      if (docName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(docName.toLowerCase())) {
        generator = gen;
        console.log(`   📝 Correspondance trouvée: "${key}"`);
        break;
      }
    }
  }
  
  if (!generator) {
    throw new Error(`Template HTML non trouvé pour: ${docName}`);
  }
  
  // Générer le HTML
  const htmlContent = generator(company, associates, managers, additionalData);
  
  // Générer le PDF
  await generatePDFWithPuppeteer(htmlContent, outputPath);
  
  return outputPath;
};

export default {
  generateDocumentPDF,
  generatePDFWithPuppeteer,
  closeBrowser
};

