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
    color: #000;
    background: white;
  }
  
  .document {
    max-width: 100%;
  }
  
  /* Page de garde - Encadré OHADA */
  .cover-box {
    border: 2px solid #000;
    padding: 15px 20px;
    margin: 30px auto;
    max-width: 90%;
    text-align: center;
    font-size: 10pt;
  }
  
  .cover-box p {
    margin: 8px 0;
  }
  
  .cover-box .title {
    font-weight: bold;
    text-decoration: underline;
    margin: 15px 0;
  }
  
  .nb-section {
    text-align: left;
    margin: 30px 0;
    font-size: 10pt;
  }
  
  .nb-section .nb-title {
    text-decoration: underline;
    margin-bottom: 10px;
  }
  
  .nb-section ol {
    margin-left: 20px;
  }
  
  .nb-section li {
    margin-bottom: 8px;
  }
  
  .type-societe {
    text-align: center;
    margin: 60px 0 40px 0;
    font-size: 14pt;
    font-weight: bold;
  }
  
  .page-number {
    text-align: right;
    font-size: 10pt;
    margin-top: 50px;
  }
  
  /* Page 2 - Titre principal */
  .main-header {
    border: 3px solid #000;
    padding: 15px;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .main-header h1 {
    font-size: 14pt;
    font-weight: bold;
    text-decoration: underline;
    margin-bottom: 10px;
  }
  
  .main-header .company-name {
    font-size: 16pt;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .main-header .capital-info {
    font-size: 11pt;
    margin-top: 10px;
  }
  
  .date-section {
    margin: 30px 0;
  }
  
  .associe-item {
    margin: 20px 0;
    text-align: justify;
  }
  
  .associe-number {
    font-weight: bold;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }
  
  .header h1 {
    font-size: 16pt;
    font-weight: bold;
    color: #000;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .header .subtitle {
    font-size: 10pt;
    color: #333;
  }
  
  .main-title {
    text-align: center;
    font-size: 18pt;
    font-weight: bold;
    margin: 30px 0 20px 0;
    color: #000;
    text-transform: uppercase;
  }
  
  .company-name-simple {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin: 15px 0;
  }
  
  .company-name-container {
    text-align: center;
    margin: 20px 0;
  }
  
  .section-title {
    font-size: 12pt;
    font-weight: bold;
    margin: 25px 0 10px 0;
    color: #000;
    text-decoration: underline;
  }
  
  .article-title {
    font-size: 11pt;
    font-weight: bold;
    margin: 20px 0 8px 0;
    color: #000;
    text-decoration: underline;
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
    color: #000;
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
    border-top: 1px solid #000;
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
  
  .text-underline {
    text-decoration: underline;
  }
  
  .mt-20 {
    margin-top: 20px;
  }
  
  .mt-40 {
    margin-top: 40px;
  }
  
  .mb-10 {
    margin-bottom: 10px;
  }
  
  .separator {
    border-top: 1px solid #000;
    margin: 15px 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  table th, table td {
    border: 1px solid #000;
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
    color: #333;
    padding: 10px 0;
    border-top: 1px solid #000;
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
 * Template HTML: Statuts SARL - Format professionnel OHADA
 */
const generateStatutsHTML = (company, associates, managers) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital)).toUpperCase();
  const duree = company.duree_societe || 99;
  const dureeWords = numberToWords(duree);
  
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || gerant?.address || '[ADRESSE]';
  const gerantVilleResidence = gerant?.ville_residence || gerant?.villeResidence || company.city || 'ABIDJAN';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = (gerant?.date_naissance || gerant?.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'CNI';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '[NUMÉRO]';
  const gerantDateDelivranceId = (gerant?.date_delivrance_id || gerant?.dateDelivranceId) ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = (gerant?.date_validite_id || gerant?.dateValiditeId) ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || gerant?.lieuDelivranceId || 'la République de Côte d\'Ivoire';
  
  const isUnipersonnelle = !associates || associates.length <= 1;
  const nombreParts = associates?.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) || Math.floor(capital / 5000);
  const valeurPart = capital / nombreParts;
  
  const annee = new Date().getFullYear();
  const dateActuelle = formatDate(new Date().toISOString());
  
  // Construire l'objet social
  const objetSocial = company.activity || '[OBJET SOCIAL]';
  
  // Récupérer le nom de la banque
  const banque = company.banque || '[NOM DE LA BANQUE]';
  
  // Construire l'adresse complète
  const adresseComplete = `${(company.address || '[ADRESSE]').toUpperCase()}${company.commune ? ' COMMUNE DE ' + company.commune.toUpperCase() : ''}${company.quartier ? ', ' + company.quartier.toUpperCase() : ''}, ${(company.city || 'ABIDJAN').toUpperCase()}${company.lot ? ' LOT ' + company.lot : ''}${company.ilot ? ', ILOT ' + company.ilot : ''}`;
  
  // Générer la liste des associés numérotée
  let associesListHTML = '';
  let associesTableRows = '';
  let totalApports = 0;
  let repartitionParts = '';
  let signaturesHTML = '';
  
  if (associates && associates.length > 0) {
    associates.forEach((associe, index) => {
      const parts = parseInt(associe.parts) || 0;
      const apport = (capital * parts) / nombreParts;
      totalApports += apport;
      
      // Récupérer les infos de l'associé
      const assocNom = associe.name || `[NOM ASSOCIÉ ${index + 1}]`;
      const assocProfession = associe.profession || '[PROFESSION]';
      const assocAdresse = associe.adresse || associe.address || gerantVilleResidence;
      const assocNationalite = associe.nationalite || associe.nationality || '[NATIONALITÉ]';
      const assocDateNaissance = associe.date_naissance || associe.dateNaissance ? formatDate(associe.date_naissance || associe.dateNaissance) : '[DATE]';
      const assocLieuNaissance = associe.lieu_naissance || associe.lieuNaissance || '[LIEU]';
      const assocTypeId = associe.type_identite || associe.typeIdentite || 'passeport';
      const assocNumId = associe.numero_identite || associe.numeroIdentite || '[N°]';
      const assocDateDelivrance = associe.date_delivrance_id || associe.dateDelivranceId ? formatDate(associe.date_delivrance_id || associe.dateDelivranceId) : '[DATE]';
      const assocDateValidite = associe.date_validite_id || associe.dateValiditeId ? formatDate(associe.date_validite_id || associe.dateValiditeId) : '[DATE]';
      const assocLieuDelivrance = associe.lieu_delivrance_id || associe.lieuDelivranceId || 'la République de Côte d\'Ivoire';
      
      // Liste numérotée des associés pour la page 2
      associesListHTML += `
        <div class="associe-item">
          <span class="associe-number">${index + 1}- M. ${escapeHtml(assocNom.toUpperCase())}</span>, ${escapeHtml(assocProfession)} résidant à ${escapeHtml(assocAdresse.toUpperCase())} de nationalité ${escapeHtml(assocNationalite)}, né le ${assocDateNaissance} à ${escapeHtml(assocLieuNaissance.toUpperCase())}, ${assocTypeId === 'CNI' ? 'TAMIL NADU (INDE)' : ''} et titulaire du ${assocTypeId} N°${escapeHtml(assocNumId)} délivrée le ${assocDateDelivrance} et valable jusqu'au ${assocDateValidite} par ${escapeHtml(assocLieuDelivrance)}.
        </div>
      `;
      
      // Tableau des apports
      associesTableRows += `
        <tr>
          <td>${escapeHtml(assocNom)}</td>
          <td>${parts} parts</td>
          <td>${apport.toLocaleString('fr-FR')} FCFA</td>
        </tr>
      `;
      
      // Répartition des parts
      const debutParts = index === 0 ? 1 : associates.slice(0, index).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0) + 1;
      const finParts = associates.slice(0, index + 1).reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0);
      repartitionParts += `
        <tr><td>M. ${escapeHtml(assocNom)}</td><td>${parts} parts sociales numérotées de ${debutParts} à ${finParts}</td></tr>
      `;
      
      // Signatures
      signaturesHTML += `
        <div class="signature-box">
          <p>Associé ${index + 1}</p>
          <div class="signature-line">${escapeHtml(assocNom)}</div>
        </div>
      `;
    });
  } else {
    totalApports = capital;
    associesListHTML = `
      <div class="associe-item">
        <span class="associe-number">1- M. ${escapeHtml(gerantNom.toUpperCase())}</span>, ${escapeHtml(gerantProfession)} résidant à ${escapeHtml(gerantAdresse.toUpperCase())} de nationalité ${escapeHtml(gerantNationalite)}, né le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance.toUpperCase())} et titulaire de la ${gerantTypeId} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}.
      </div>
    `;
    associesTableRows = `
      <tr>
        <td>${escapeHtml(gerantNom)}</td>
        <td>${nombreParts} parts</td>
        <td>${capital.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    `;
    repartitionParts = `<tr><td>M. ${escapeHtml(gerantNom)}</td><td>${nombreParts} parts sociales numérotées de 1 à ${nombreParts}</td></tr>`;
    signaturesHTML = `
      <div class="signature-box">
        <p>L'Associé Unique</p>
        <div class="signature-line">${escapeHtml(gerantNom)}</div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}
        
        /* Styles spécifiques pour Statuts SARL */
        .statuts-cover {
          text-align: center;
          padding-top: 150px;
        }
        .statuts-cover h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 50px;
        }
        .statuts-cover .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #c00000;
          margin-bottom: 30px;
        }
        .statuts-cover .capital {
          font-size: 20px;
          font-weight: bold;
          color: #c00000;
        }
        .ohada-box {
          border: 1px solid #000;
          padding: 15px 20px;
          margin: 40px auto;
          max-width: 85%;
          text-align: center;
          font-size: 11pt;
        }
        .ohada-box p {
          margin: 5px 0;
        }
        .ohada-box .title-underline {
          font-weight: bold;
          text-decoration: underline;
          margin: 15px 0;
        }
        .nb-section {
          text-align: left;
          margin: 30px 20px;
          font-size: 10pt;
        }
        .nb-section .nb-title {
          text-decoration: underline;
          margin-bottom: 10px;
        }
        .nb-section p.italic {
          font-style: italic;
          margin-bottom: 10px;
        }
        .nb-section ol {
          margin-left: 30px;
        }
        .nb-section ol li {
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <!-- PAGE 1 : PAGE DE COUVERTURE -->
        <div class="statuts-cover">
          <h1>STATUTS DE LA SOCIETE</h1>
          <p class="company-name">«${escapeHtml((company.company_name || '[NOM SOCIÉTÉ]').toUpperCase())} SARL »</p>
          <p class="capital">AU CAPITAL DE ${capital.toLocaleString('fr-FR').replace(/\s/g, '.')} FCFA</p>
        </div>
        
        <!-- PAGE 2 : INFORMATIONS OHADA -->
        <div class="page-break"></div>
        
        <div class="ohada-box">
          <p>Modèle Type utilisable et adaptable, conforme aux dispositions en vigueur</p>
          <p>de l'Acte uniforme révisé de l'OHADA du 30 janvier 2014 relatif au</p>
          <p>Droit des Sociétés commerciales et du Groupement d'Intérêt Économique</p>
          <p class="title-underline">STATUT TYPE SOUS SEING PRIVE</p>
          <p>Cas d'une Société à Responsabilité Limitée comportant plusieurs</p>
          <p>associés et constituée exclusivement par apports en numéraire</p>
        </div>
        
        <div class="nb-section">
          <p class="nb-title"><u>N.B : Indications d'utilisation</u></p>
          <p class="italic">Ce cas de figure courant a été conçu pour faciliter et encadrer le processus de création d'entreprise pour une meilleure sécurisation des opérateurs économiques.</p>
          <ol>
            <li>les espaces en pointillé sont des champs à remplir et à adapter à partir des informations décrites dans les parenthèses qui suivent ;</li>
            <li>établir les statuts en nombre suffisant pour la remise d'un exemplaire original à chaque associé, le dépôt d'un exemplaire au siège social, et l'accomplissement des formalités de constitution.</li>
          </ol>
        </div>
        
        <!-- PAGE 3 : STATUTS -->
        <div class="page-break"></div>
        
        <div class="main-header" style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 14pt; font-weight: bold;">STATUTS DE LA SOCIÉTÉ A RESPONSABILITÉ LIMITÉE DÉNOMMÉE</h1>
          <p style="font-size: 14pt; font-weight: bold; margin: 15px 0;">«${escapeHtml((company.company_name || '[NOM SOCIÉTÉ]').toUpperCase())}${company.sigle ? ' ' + company.sigle : ''} SARL»</p>
          <p style="font-size: 11pt;">Au capital de ${capital.toLocaleString('fr-FR')} FCFA, située à ${adresseComplete}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>L'An Deux Mil ${numberToWords(annee % 100).charAt(0).toUpperCase() + numberToWords(annee % 100).slice(1)},</p>
          <p>Le ${dateActuelle}</p>
        </div>
        
        ${associesListHTML}
        
        <p class="mt-20">
          ${isUnipersonnelle ? 'A établi' : 'Ont établi'} ainsi qu'il suit les statuts de la société à responsabilité limitée devant exister entre ${isUnipersonnelle ? 'lui' : 'eux'}.
        </p>
        
        <!-- ARTICLES -->
        <h3 class="article-title">ARTICLE 1 - FORME JURIDIQUE</h3>
        <p class="article-content">
          Il est formé entre les soussignés une société à responsabilité limitée qui sera régie par l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales et du groupement d'intérêt économique, ainsi que par les présents statuts.
        </p>
        
        <h3 class="article-title">ARTICLE 2 - OBJET SOCIAL</h3>
        <p class="article-content">La société a pour objet, en Côte d'Ivoire et à l'Étranger, directement ou indirectement :</p>
        <p class="article-content">${escapeHtml(objetSocial)}</p>
        <p class="article-content">et généralement, toutes opérations industrielles, commerciales, financières, civiles, mobilières ou immobilières pouvant se rattacher directement ou indirectement à l'objet social ou à tous objets similaires ou connexes ou susceptibles d'en faciliter l'extension ou le développement.</p>
        <p class="article-content">En outre, la Société peut également participer par tous moyens, directement ou indirectement, dans toutes opérations pouvant se rattacher à son objet.</p>
        <p class="article-content">- l'acquisition, la location et la vente de tous biens meubles et immeubles.</p>
        <p class="article-content">- l'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.</p>
        <p class="article-content">- la prise en location gérance de tous fonds de commerce.</p>
        <p class="article-content">- la prise de participation dans toute société existante ou devant être créée</p>
        <p class="article-content">- et généralement, toutes opérations financières, commerciales, industrielles, mobilières et immobilières, se rapportant directement ou indirectement à l'objet social ou pouvant en faciliter l'extension ou le développement.</p>
        
        <h3 class="article-title">ARTICLE 3 - DÉNOMINATION SOCIALE</h3>
        <p class="article-content">
          La société prend la dénomination de : <strong>${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')}</strong>
        </p>
        <p class="article-content">
          Dans tous les actes et documents émanant de la société, la dénomination sociale devra toujours être précédée ou suivie des mots "Société à Responsabilité Limitée" ou des initiales "SARL" et de l'énonciation du capital social.
        </p>
        
        <h3 class="article-title">ARTICLE 4 - SIÈGE SOCIAL</h3>
        <p class="article-content">
          Le siège social est fixé à : <strong>${adresseComplete}</strong>, République de Côte d'Ivoire.
        </p>
        <p class="article-content">
          Il pourra être transféré en tout autre endroit de la même ville par simple décision des associés, et en tout autre lieu par décision collective extraordinaire des associés, et en tout autre lieu par décision collective extraordinaire des associés.
        </p>
        
        <h3 class="article-title">ARTICLE 5 - DURÉE</h3>
        <p class="article-content">
          La durée de la société est fixée à <strong>${dureeWords} (${duree}) ans</strong>, à compter de son immatriculation au Registre du Commerce et du Crédit Mobilier.
        </p>
        
        <h3 class="article-title">ARTICLE 6 - CAPITAL SOCIAL</h3>
        <p class="article-content">
          Le capital social est fixé à la somme de <strong>${capitalWords} (${capital.toLocaleString('fr-FR')}) de francs CFA</strong>, divisé en ${nombreParts} parts sociales entièrement souscrites et libérées intégralement.
        </p>
        
        <h3 class="article-title">ARTICLE 7 - APPORTS</h3>
        <p class="article-content"><strong>Apports en numéraire</strong></p>
        <p class="article-content">Lors de la constitution, les soussignés ont fait apport à la société, à savoir :</p>
        <table>
          <thead>
            <tr>
              <th>IDENTITÉ DES APPORTEURS</th>
              <th>MONTANT APPORT EN NUMÉRAIRE</th>
            </tr>
          </thead>
          <tbody>
            ${associates && associates.length > 0 ? associates.map((a, i) => {
              const parts = parseInt(a.parts) || 0;
              const apport = (capital * parts) / nombreParts;
              return `<tr><td>${escapeHtml(a.name || '[NOM]')}</td><td>${apport.toLocaleString('fr-FR')} FCFA</td></tr>`;
            }).join('') : `<tr><td>${escapeHtml(gerantNom)}</td><td>${capital.toLocaleString('fr-FR')} FCFA</td></tr>`}
          </tbody>
          <tfoot>
            <tr>
              <th>Total des apports en numéraire</th>
              <th>${capital.toLocaleString('fr-FR')} FCFA</th>
            </tr>
          </tfoot>
        </table>
        <p class="article-content">
          Les apports en numéraire de ${capitalWords} de francs CFA (${capital.toLocaleString('fr-FR')} FCFA) correspondent à ${nombreParts} parts sociales de ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA entièrement souscrites et libérées intégralement. La somme correspondante a été déposée pour le compte de la société et conformément à la loi, dans un compte ouvert à ${escapeHtml(banque)}.
        </p>
        
        <h3 class="article-title">ARTICLE 8 - CAPITAL SOCIAL</h3>
        <p class="article-content">
          Le capital social est fixé à la somme de ${capital.toLocaleString('fr-FR')} FCFA divisé en ${nombreParts} parts sociales de ${valeurPart.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA, entièrement souscrites et libérées intégralement, numérotées de 1 à ${nombreParts}, attribuées aux associés, à savoir :
        </p>
        <table>
          <thead>
            <tr>
              <th>IDENTITÉ DES ASSOCIÉS</th>
              <th>CONCURRENCE DES PARTS</th>
            </tr>
          </thead>
          <tbody>
            ${repartitionParts}
          </tbody>
          <tfoot>
            <tr>
              <th>TOTAL</th>
              <th>${nombreParts} parts sociales</th>
            </tr>
          </tfoot>
        </table>
        
        <div class="page-break"></div>
        
        <h3 class="article-title">ARTICLE 9 - AUGMENTATION ET RÉDUCTION DU CAPITAL</h3>
        <p class="article-content">
          Le capital social peut être augmenté ou réduit dans les conditions prévues par l'Acte Uniforme relatif au droit des sociétés commerciales et du groupement d'intérêt économique.
        </p>
        <p class="article-content">
          L'augmentation du capital est décidée par les associés représentant au moins la moitié des parts sociales. Si cette majorité n'est pas obtenue, et sauf stipulation contraire des statuts, les associés sont, selon les cas, convoqués ou consultés une seconde fois et les décisions sont prises à la majorité des votes émis, quel que soit le nombre des votants.
        </p>
        <p class="article-content">
          La réduction du capital est autorisée par l'assemblée des associés statuant dans les conditions exigées pour la modification des statuts.
        </p>
        
        <h3 class="article-title">ARTICLE 10 - PARTS SOCIALES</h3>
        <p class="article-content">
          Les parts sociales ne peuvent être représentées par des titres négociables. Les droits de chaque associé dans la société résultent seulement des statuts, des actes modificatifs et des cessions de parts régulièrement notifiées et publiées.
        </p>
        
        <h3 class="article-title">ARTICLE 11 - INDIVISIBILITÉ DES PARTS</h3>
        <p class="article-content">
          Les parts sociales sont indivisibles à l'égard de la société qui ne reconnaît qu'un seul propriétaire pour chaque part. Les copropriétaires indivis de parts sociales sont tenus de désigner l'un d'entre eux pour les représenter auprès de la société. À défaut d'entente, il appartient à l'un des indivisaires de demander au président de la juridiction compétente, statuant à bref délai, la désignation d'un mandataire chargé de les représenter.
        </p>
        
        <h3 class="article-title">ARTICLE 12 - DROITS DES ASSOCIÉS</h3>
        <p class="article-content">
          Chaque part sociale confère à son propriétaire un droit égal dans les bénéfices de la société et dans tout l'actif social. Elle donne droit à une voix dans tous les votes et délibérations.
        </p>
        
        <h3 class="article-title">ARTICLE 13 - RESPONSABILITÉ DES ASSOCIÉS</h3>
        <p class="article-content">
          Les associés ne supportent les pertes qu'à concurrence de leurs apports. Au-delà, tout appel de fonds est interdit.
        </p>
        
        <h3 class="article-title">ARTICLE 14 - CESSION DE PARTS SOCIALES</h3>
        <p class="article-content">
          Les parts sociales sont librement cessibles entre associés. Elles ne peuvent être cédées à des tiers étrangers à la société qu'avec le consentement de la majorité des associés représentant au moins les trois quarts (3/4) des parts sociales, déduction faite des parts de l'associé cédant.
        </p>
        <p class="article-content">
          Le projet de cession est notifié à la société et à chacun des associés par acte extrajudiciaire ou par tout moyen écrit. Si la société n'a pas fait connaître sa décision dans le délai de trois mois à compter de la dernière des notifications, le consentement à la cession est réputé acquis.
        </p>
        
        <h3 class="article-title">ARTICLE 15 - TRANSMISSION DES PARTS</h3>
        <p class="article-content">
          En cas de décès d'un associé, la société continue entre les associés survivants et les héritiers et ayants droit de l'associé décédé, et éventuellement son conjoint survivant, qui acquièrent la qualité d'associé.
        </p>
        <p class="article-content">
          Toutefois, les héritiers et ayants droit devront, pour exercer les droits attachés aux parts sociales, justifier de leur qualité dans les trois mois du décès par la production de l'expédition d'un acte de notoriété ou d'un extrait d'intitulé d'inventaire.
        </p>
        
        <h3 class="article-title">ARTICLE 16 - NANTISSEMENT DES PARTS SOCIALES</h3>
        <p class="article-content">
          Les parts sociales peuvent faire l'objet d'un nantissement constaté par acte authentique ou par acte sous seing privé signifié à la société ou accepté par elle dans un acte authentique.
        </p>
        
        <div class="page-break"></div>
        
        <h3 class="article-title">ARTICLE 17 - GÉRANCE</h3>
        <p class="article-content">
          La société est gérée par une ou plusieurs personnes physiques, associées ou non. Le gérant est nommé par les associés pour une durée indéterminée.
        </p>
        <p class="article-content"><strong>Est nommé gérant de la société :</strong></p>
        <p class="article-content">
          M. <strong>${escapeHtml(gerantNom.toUpperCase())}</strong>, ${escapeHtml(gerantProfession)}, résidant à ${escapeHtml(gerantAdresse.toUpperCase())} de nationalité ${escapeHtml(gerantNationalite)}, né(e) le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance.toUpperCase())} et titulaire de la ${gerantTypeId} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}, qui accepte.
        </p>
        
        <h3 class="article-title">ARTICLE 18 - POUVOIRS DU GÉRANT</h3>
        <p class="article-content">
          Le gérant peut faire tous les actes de gestion dans l'intérêt de la société. Dans les rapports avec les tiers, le gérant est investi des pouvoirs les plus étendus pour agir en toute circonstance au nom de la société, sous réserve des pouvoirs que la loi attribue expressément aux associés.
        </p>
        <p class="article-content">
          La société est engagée même par les actes du gérant qui ne relèvent pas de l'objet social, à moins qu'elle ne prouve que le tiers savait que l'acte dépassait cet objet ou qu'il ne pouvait l'ignorer compte tenu des circonstances.
        </p>
        
        <h3 class="article-title">ARTICLE 19 - RÉMUNÉRATION DU GÉRANT</h3>
        <p class="article-content">
          En rémunération de ses fonctions, le gérant pourra recevoir un traitement fixe ou proportionnel, ou à la fois fixe et proportionnel au bénéfice ou au chiffre d'affaires, dont le montant et les modalités de paiement seront déterminés par décision collective des associés.
        </p>
        
        <h3 class="article-title">ARTICLE 20 - RÉVOCATION DU GÉRANT</h3>
        <p class="article-content">
          Le gérant peut être révoqué par décision des associés représentant plus de la moitié des parts sociales. Si la révocation est décidée sans juste motif, elle peut donner lieu à des dommages et intérêts.
        </p>
        
        <h3 class="article-title">ARTICLE 21 - DÉCISIONS COLLECTIVES</h3>
        <p class="article-content">
          Les décisions collectives sont prises en assemblée ou par consultation écrite. Toutefois, la réunion d'une assemblée est obligatoire pour statuer sur l'approbation des comptes de chaque exercice.
        </p>
        <p class="article-content">
          Les décisions collectives ordinaires sont adoptées par un ou plusieurs associés représentant plus de la moitié des parts sociales. Si cette majorité n'est pas obtenue, les associés sont, selon les cas, convoqués ou consultés une seconde fois et les décisions sont prises à la majorité des votes émis, quel que soit le nombre des votants.
        </p>
        
        <h3 class="article-title">ARTICLE 22 - DÉCISIONS EXTRAORDINAIRES</h3>
        <p class="article-content">
          Les décisions extraordinaires, notamment celles portant modification des statuts, sont prises par les associés représentant au moins les trois quarts (3/4) des parts sociales.
        </p>
        <p class="article-content">
          Toutefois, l'augmentation du capital par incorporation de bénéfices ou de réserves est décidée par les associés représentant au moins la moitié des parts sociales.
        </p>
        
        <h3 class="article-title">ARTICLE 23 - EXERCICE SOCIAL</h3>
        <p class="article-content">
          L'exercice social commence le premier janvier et se termine le trente et un décembre de chaque année. Par exception, le premier exercice sera clos le trente et un décembre de l'année suivante si la société commence ses activités au-delà des six premiers mois de l'année en cours.
        </p>
        
        <div class="page-break"></div>
        
        <h3 class="article-title">ARTICLE 24 - INVENTAIRE - COMPTES ANNUELS</h3>
        <p class="article-content">
          À la clôture de chaque exercice, le gérant dresse l'inventaire des divers éléments de l'actif et du passif existant à cette date. Il dresse également le bilan, le compte de résultat et l'annexe, en se conformant aux dispositions légales.
        </p>
        <p class="article-content">
          Il établit un rapport de gestion contenant les indications fixées par les textes en vigueur.
        </p>
        
        <h3 class="article-title">ARTICLE 25 - AFFECTATION ET RÉPARTITION DES BÉNÉFICES</h3>
        <p class="article-content">
          Le bénéfice distribuable est constitué par le bénéfice de l'exercice, diminué des pertes antérieures et des sommes portées en réserve en application de la loi ou des statuts, et augmenté du report bénéficiaire.
        </p>
        <p class="article-content">
          Après approbation des comptes et constatation de l'existence d'un bénéfice distribuable, l'assemblée générale détermine la part attribuée aux associés sous forme de dividendes.
        </p>
        <p class="article-content">
          Tout dividende distribué en violation de ces règles constitue un dividende fictif.
        </p>
        
        <h3 class="article-title">ARTICLE 26 - DISSOLUTION - LIQUIDATION</h3>
        <p class="article-content">
          La société à responsabilité limitée est dissoute pour les causes communes à toutes les sociétés et, en outre, dans les cas prévus par l'Acte Uniforme.
        </p>
        <p class="article-content">
          La dissolution de la société entraîne sa mise en liquidation. La personnalité morale de la société subsiste pour les besoins de la liquidation et jusqu'à la clôture de celle-ci.
        </p>
        <p class="article-content">
          Si toutes les parts sociales sont réunies en une seule main, l'expiration de la société ou sa dissolution pour quelque cause que ce soit, entraîne la transmission universelle du patrimoine social à l'associé unique, sans qu'il y ait lieu à liquidation, sous réserve du droit d'opposition des créanciers.
        </p>
        
        <h3 class="article-title">ARTICLE 27 - CONTESTATIONS ENTRE ASSOCIÉS OU ENTRE UN OU PLUSIEURS ASSOCIÉS ET LA SOCIÉTÉ</h3>
        <p class="article-content"><u>Variante 1. Droit commun</u></p>
        <p class="article-content">
          Les contestations relatives aux affaires de la société survenant pendant la vie de la société ou au cours de sa liquidation, entre les associés ou entre un ou plusieurs associés et la société, sont soumises au tribunal chargé des affaires commerciales.
        </p>
        <p class="article-content"><u>Variante 2. Arbitrage</u></p>
        <p class="article-content">
          Les contestations relatives aux affaires, survenant pendant la durée de société ou au cours de sa liquidation, entre les associés ou entre un ou plusieurs associés et la société, sont soumises à l'arbitrage conformément aux dispositions de l'Acte Uniforme de l'OHADA s'y rapportant.
        </p>
        
        <h3 class="article-title">ARTICLE 28 - ENGAGEMENTS POUR LE COMPTE DE LA SOCIÉTÉ</h3>
        <p class="article-content">
          Un état des actes accomplis par les fondateurs pour le compte de la société en formation, avec indication de l'engagement qui en résulterait, sera présenté à la société qui s'engage à les reprendre.
        </p>
        
        <div class="page-break"></div>
        
        <h3 class="article-title">ARTICLE 29 - MANDAT</h3>
        <p class="article-content">
          En outre, les soussignés donnent mandat à 1- M. <strong>${escapeHtml(gerantNom.toUpperCase())}</strong>, à l'effet de prendre les engagements suivants au nom et pour le compte de la société.
        </p>
        
        <h3 class="article-title">ARTICLE 30 - FRAIS</h3>
        <p class="article-content">
          Les frais, droits et honoraires des présents Statuts sont à la charge de la société.
        </p>
        
        <h3 class="article-title">ARTICLE 31 - ÉLECTION DE DOMICILE</h3>
        <p class="article-content">
          Pour l'exécution des présentes et de leurs suites, les parties déclarent faire élection de domicile au siège sociale.
        </p>
        
        <h3 class="article-title">ARTICLE 32 - POUVOIRS</h3>
        <p class="article-content">
          Les associés donnent tous pouvoirs à 1- M. <strong>${escapeHtml(gerantNom.toUpperCase())}</strong>, ${escapeHtml(gerantProfession)} résidant à ${escapeHtml(gerantAdresse.toUpperCase())} de nationalité ${escapeHtml(gerantNationalite)}, né(e) le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance.toUpperCase())} et titulaire du ${gerantTypeId} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}, à l'effet de procéder à l'enregistrement des présents statuts, accomplir les formalités d'immatriculation au Registre du Commerce et du Crédit Mobilier, et pour les besoins des formalités, de signer tout acte et en donner bonne et valable décharge.
        </p>
        
        <p class="article-content mt-40 text-center"><strong>En Deux (2) exemplaires originaux</strong></p>
        
        <p class="article-content text-center mt-20">Fait à ${escapeHtml(company.city || 'ABIDJAN')}, le ${dateActuelle}</p>
        
        <table class="mt-40">
          <thead>
            <tr>
              <th style="width: 50%;">NOMS DES ASSOCIÉS</th>
              <th style="width: 50%;">SIGNATURES</th>
            </tr>
          </thead>
          <tbody>
            ${associates && associates.length > 0 ? associates.map((a, i) => {
              return `<tr><td>M. ${escapeHtml((a.name || '[NOM]').toUpperCase())}</td><td style="height: 50px;"></td></tr>`;
            }).join('') : `<tr><td>M. ${escapeHtml(gerantNom.toUpperCase())}</td><td style="height: 50px;"></td></tr>`}
          </tbody>
        </table>
        
        <div class="page-number" style="margin-top: 30px;">16</div>
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
  
  // Debug: Afficher les données du gérant
  if (gerant) {
    console.log('🔍 [Liste Gérants] Données gérant:', {
      nom: gerant.nom,
      prenoms: gerant.prenoms,
      nationalite: gerant.nationalite,
      lieu_naissance: gerant.lieu_naissance,
      lieuNaissance: gerant.lieuNaissance,
      adresse: gerant.adresse,
      address: gerant.address,
      profession: gerant.profession,
      date_naissance: gerant.date_naissance,
      dateNaissance: gerant.dateNaissance
    });
  }
  
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
  } else if (gerant?.dureeMandat) {
    if (typeof gerant.dureeMandat === 'number') {
      dureeMandatAnnees = gerant.dureeMandat;
      dureeMandatText = `${numberToWords(gerant.dureeMandat)} (${gerant.dureeMandat}) ans`;
    } else if (gerant.dureeMandat === 'determinee' && gerant.dureeMandatAnnees) {
      dureeMandatAnnees = gerant.dureeMandatAnnees;
      dureeMandatText = `${numberToWords(gerant.dureeMandatAnnees)} (${gerant.dureeMandatAnnees}) ans`;
    }
  } else {
    // Par défaut, 4 ans
    dureeMandatAnnees = 4;
    dureeMandatText = `${numberToWords(4)} (4) ans`;
  }
  
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || gerant?.address || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance || gerant?.dateNaissance ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU NAISSANCE]';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'CNI';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '[NUMÉRO]';
  const gerantDateDelivranceId = gerant?.date_delivrance_id || gerant?.dateDelivranceId ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '[DATE DÉLIVRANCE]';
  const gerantDateValiditeId = gerant?.date_validite_id || gerant?.dateValiditeId ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '[DATE VALIDITÉ]';
  const gerantLieuDelivranceId = gerant?.lieu_delivrance_id || gerant?.lieuDelivranceId || 'la république de Côte d\'Ivoire';
  
  // Récupérer lot et îlot
  const lotNumero = additionalData.lot || company.lot || '';
  const ilotNumero = additionalData.ilot || company.ilot || '';
  
  // Construire l'adresse complète en majuscules avec commune, quartier, lot et îlot
  const communeText = company.commune ? ` COMMUNE DE ${company.commune.toUpperCase()}` : '';
  const quartierText = company.quartier ? ` ${company.quartier.toUpperCase()}` : '';
  const lotText = lotNumero ? ` LOT ${lotNumero}` : '';
  const ilotText = ilotNumero ? `, ILOT ${ilotNumero}` : '';
  const adresseComplete = `${(company.city || 'ABIDJAN').toUpperCase()}${communeText}${quartierText}, ${(company.address || '[ADRESSE]').toUpperCase()}${lotText}${ilotText}`;

  // Format selon le générateur : "quatre ans (4 ans)" en gras
  const dureeTextGras = dureeMandatAnnees ? `<strong>${numberToWords(dureeMandatAnnees)} ans (${dureeMandatAnnees} ans)</strong>` : dureeMandatText;
  
  // Format selon le générateur : une seule ligne avec toutes les infos
  const gerantInfoLine = `M. ${escapeHtml(gerantNom)}, ${escapeHtml(gerantProfession)} résidant à ${escapeHtml(gerantAdresse)} de nationalité ${escapeHtml(gerantNationalite)}, né le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)} et titulaire du ${gerantTypeId} N° ${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}`;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}
        .company-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 40px 0 30px 0;
        }
        .company-subtitle {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          margin: 0 20px 20px 20px;
          line-height: 1.5;
        }
        .dashed-separator {
          text-align: center;
          margin: 20px 0;
          letter-spacing: 2px;
        }
        .section-title-underlined {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          text-decoration: underline;
          margin: 40px 0 30px 0;
        }
        .gerant-paragraph {
          font-size: 14px;
          text-align: justify;
          margin: 20px 40px;
          line-height: 1.6;
        }
        .signature-underlined {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          text-decoration: underline;
          margin-top: 60px;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <p class="company-title">«${escapeHtml((company.company_name || '[NOM SOCIÉTÉ]').toUpperCase())}»</p>
        
        <p class="company-subtitle">
          Au capital de ${(company.capital || 0).toLocaleString('fr-FR')} FCFA, située à ${adresseComplete}
        </p>
        
        <p class="dashed-separator">------------------------------------------------------------------------</p>
        
        <p class="section-title-underlined">LISTE DE DIRIGEANT</p>
        
        <p class="gerant-paragraph">
          Est nommé Gérant pour une durée de ${dureeTextGras}
        </p>
        
        <p class="gerant-paragraph">
          <strong>M. ${escapeHtml(gerantNom.toUpperCase())},</strong> ${escapeHtml(gerantProfession)} résidant à ${escapeHtml(gerantAdresse.toUpperCase())} de nationalité ${escapeHtml(gerantNationalite)}, né le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance.toUpperCase())} et titulaire du ${gerantTypeId.toLowerCase()} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId} par ${escapeHtml(gerantLieuDelivranceId)}
        </p>
        
        <p class="signature-underlined">Signature</p>
        
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
  
  const gerantNom = gerant?.nom || '[NOM]';
  const gerantPrenoms = gerant?.prenoms || '[PRÉNOMS]';
  const gerantPereNom = gerant?.pere_nom || gerant?.pereNom || '[NOM DU PÈRE]';
  const gerantMereNom = gerant?.mere_nom || gerant?.mereNom || '[NOM DE LA MÈRE]';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '[NATIONALITÉ]';
  const gerantDateNaissance = gerant?.date_naissance || gerant?.dateNaissance ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE NAISSANCE]';
  const gerantDomicile = gerant?.adresse || gerant?.address || '[DOMICILE]';
  const dateActuelle = formatDate(new Date().toISOString());
  const lieu = company.city || 'Abidjan';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}
        
        .declaration-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          text-decoration: underline;
          margin: 40px 0 30px 0;
        }
        .declaration-subtitle {
          font-size: 12px;
          text-align: center;
          margin-bottom: 40px;
        }
        .declaration-field {
          font-size: 12px;
          margin: 15px 0;
          line-height: 1.6;
        }
        .declaration-field strong {
          font-weight: bold;
        }
        .declaration-text {
          font-size: 12px;
          text-align: justify;
          margin: 20px 0;
          line-height: 1.6;
        }
        .declaration-footer {
          font-size: 12px;
          text-align: center;
          margin-top: 50px;
        }
        .declaration-signature {
          font-size: 12px;
          text-align: right;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <h1 class="declaration-title">DECLARATION SUR L'HONNEUR</h1>
        
        <p class="declaration-subtitle">(Article 47 de l'Acte Uniforme relatif au Droit commercial général adopté le 15 décembre 2010)</p>
        
        <p class="declaration-field"><strong>NOM :</strong> ${escapeHtml(gerantNom.toUpperCase())}</p>
        
        <p class="declaration-field"><strong>PRENOMS :</strong> ${escapeHtml(gerantPrenoms.toUpperCase())}</p>
        
        <p class="declaration-field"><strong>DE :</strong> ${escapeHtml(gerantPereNom.toUpperCase())}</p>
        
        <p class="declaration-field"><strong>Et DE :</strong> ${escapeHtml(gerantMereNom.toUpperCase())}</p>
        
        <p class="declaration-field"><strong>DATE DE NAISSANCE :</strong> ${gerantDateNaissance}</p>
        
        <p class="declaration-field"><strong>NATIONALITE :</strong> ${escapeHtml(gerantNationalite.toUpperCase())}</p>
        
        <p class="declaration-field"><strong>DOMICILE :</strong> ${escapeHtml(gerantDomicile.toUpperCase())}</p>
        
        <p class="declaration-field"><strong>QUALITE :</strong> GERANT</p>
        
        <p class="declaration-text">
          Déclare, conformément à l'article 47 de l'Acte Uniforme relatif au Droit Commercial Général adopté le 15 décembre 2010, au titre du Registre de commerce et du Crédit Mobilier,
        </p>
        
        <p class="declaration-text">
          N'avoir fait l'objet d'aucune condamnation pénale, ni de sanction professionnelle ou administrative de nature à m'interdire de gérer, administrer ou diriger une société ou l'exercice d'une activité commerciale.
        </p>
        
        <p class="declaration-text">
          M'engage dans un délai de 75 jours à compter de l'immatriculation à fournir mon casier judiciaire ou tout autre document en tenant lieu.
        </p>
        
        <p class="declaration-text">
          Je prends acte de ce qu'à défaut de produire l'extrait du casier judiciaire ou tout document en tenant lieu dans le délai de soixante-quinze (75) jours, il sera procédé au retrait de mon immatriculation et à ma radiation.
        </p>
        
        <p class="declaration-footer">Fait à ${escapeHtml(lieu)}, le ${dateActuelle}</p>
        
        <p class="declaration-signature">Lu et approuvé</p>
        
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: DSV - Format officiel avec page de garde (sans couleurs)
 */
const generateDSVHTML = (company, associates, managers, additionalData = {}) => {
  const capital = parseFloat(company.capital) || 0;
  const capitalWords = numberToWords(Math.floor(capital));
  
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  
  const totalParts = associates && associates.length > 0 
    ? associates.reduce((sum, a) => sum + (parseInt(a.parts) || 0), 0)
    : Math.floor(capital / 5000);
  const valeurPart = totalParts > 0 ? capital / totalParts : 5000;
  
  const dateActuelle = formatDate(new Date().toISOString());
  const annee = new Date().getFullYear();
  const sigle = company.sigle || '';
  const banque = company.banque || additionalData.banque || additionalData.bank || '[NOM DE LA BANQUE]';
  const dureeSociete = company.duree_societe || company.dureeSociete || 99;
  const lotNumero = additionalData.lot || company.lot || '';
  const ilotNumero = additionalData.ilot || company.ilot || '';
  const siegeAdresseParts = [
    escapeHtml(company.address || '[ADRESSE]'),
    lotNumero ? `LOT ${escapeHtml(lotNumero)}` : '',
    ilotNumero ? `ILOT ${escapeHtml(ilotNumero)}` : '',
    escapeHtml(company.city || 'Abidjan')
  ].filter(Boolean);
  const siegeAdresse = siegeAdresseParts.join(', ');
  
  // Variables pour la localisation
  const commune = additionalData.commune || company.commune || '';
  const quartier = additionalData.quartier || company.quartier || '';
  const nomImmeuble = additionalData.nomImmeuble || company.nomImmeuble || '';
  const numeroEtage = additionalData.numeroEtage || company.numeroEtage || '';
  const numeroPorte = additionalData.numeroPorte || company.numeroPorte || '';
  const section = additionalData.section || company.section || '';
  const parcelle = additionalData.parcelle || company.parcelle || '';
  const tfNumero = additionalData.tfNumero || company.tfNumero || '';
  const fax = additionalData.fax || company.fax || '';
  const adressePostale = additionalData.adressePostale || company.adressePostale || '';
  
  // Récupérer les infos du gérant
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : company.gerant || '[NOM GÉRANT]';
  const gerantProfession = gerant?.profession || '[PROFESSION]';
  const gerantAdresse = gerant?.adresse || gerant?.address || '[ADRESSE]';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || 'Ivoirienne';
  const gerantDateNaissance = (gerant?.date_naissance || gerant?.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '[DATE]';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '[LIEU]';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'CNI';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '[NUMÉRO]';
  const gerantDateDelivranceId = (gerant?.date_delivrance_id || gerant?.dateDelivranceId) ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '[DATE]';
  const gerantDateValiditeId = (gerant?.date_validite_id || gerant?.dateValiditeId) ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '[DATE]';
  
  // Construire l'objet social
  const objetSocial = company.activity || '[OBJET SOCIAL]';
  
  // Déterminer si c'est une SARL unipersonnelle ou pluripersonnelle
  const isUnipersonnelle = !associates || associates.length <= 1;
  
  // Construire le tableau des associés et les signatures
  let tableauSouscription = '';
  let signaturesHTML = '';
  let repartitionParts = '';
  
  if (associates && associates.length > 0) {
    let debutParts = 1;
    associates.forEach((associe, index) => {
      const assocNom = associe.name || `${associe.nom || ''} ${associe.prenoms || ''}`.trim() || '[NOM ASSOCIÉ]';
      const parts = parseInt(associe.parts) || 0;
      const montant = parts * valeurPart;
      const finParts = debutParts + parts - 1;
      
      tableauSouscription += `
        <tr>
          <td style="text-align: left; padding: 8px; border: 1px solid #000;">M. ${escapeHtml(assocNom.toUpperCase())}</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #000;">${parts} parts sociales numérotées de ${debutParts} à ${finParts}</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #000;">${valeurPart.toLocaleString('fr-FR')} FCFA</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #000;">${montant.toLocaleString('fr-FR')} FCFA</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #000;">${montant.toLocaleString('fr-FR')} FCFA</td>
        </tr>
      `;
      
      repartitionParts += `<p style="margin: 5px 0;">- M. ${escapeHtml(assocNom.toUpperCase())} : ${parts} parts sociales numérotées de ${debutParts} à ${finParts}</p>`;
      
      debutParts = finParts + 1;
    });
    
    // Signatures pour plusieurs associés
    signaturesHTML = '<div style="display: flex; justify-content: space-around; margin-top: 80px;">';
    associates.forEach((associe, index) => {
      const assocNom = associe.name || `${associe.nom || ''} ${associe.prenoms || ''}`.trim() || '[NOM]';
      signaturesHTML += `
        <div style="text-align: center;">
          <p style="font-weight: bold;">L'associé ${index + 1}</p>
          <p style="margin-top: 80px; font-weight: bold;">M. ${escapeHtml(assocNom.toUpperCase())}</p>
        </div>
      `;
    });
    signaturesHTML += '</div>';
  } else {
    // SARL Unipersonnelle
    tableauSouscription = `
      <tr>
        <td style="text-align: left; padding: 8px; border: 1px solid #000;">M. ${escapeHtml(gerantNom.toUpperCase())}</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #000;">${totalParts} parts sociales numérotées de 1 à ${totalParts}</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #000;">${valeurPart.toLocaleString('fr-FR')} FCFA</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #000;">${capital.toLocaleString('fr-FR')} FCFA</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #000;">${capital.toLocaleString('fr-FR')} FCFA</td>
      </tr>
    `;
    
    repartitionParts = `<p style="margin: 5px 0;">- M. ${escapeHtml(gerantNom.toUpperCase())} : ${totalParts} parts sociales numérotées de 1 à ${totalParts}</p>`;
    
    signaturesHTML = `
      <div style="text-align: left; margin-top: 80px;">
        <p style="font-weight: bold;">L'associé Unique</p>
        <p style="margin-top: 80px; font-weight: bold;">M. ${escapeHtml(gerantNom.toUpperCase())}</p>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 2cm 2cm 2.5cm 2cm;
          @bottom-right {
            content: counter(page);
            font-size: 10pt;
          }
        }
        
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        /* Page de garde DSV */
        .dsv-cover {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          page-break-after: always;
        }
        
        .dsv-cover-decoration {
          position: absolute;
          left: 0;
          top: 50px;
          width: 200px;
          height: 60px;
          background: linear-gradient(90deg, #3B5998 0%, #5B7FC0 100%);
          clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%);
        }
        
        .dsv-cover-sidebar {
          position: absolute;
          left: 0;
          top: 0;
          width: 15px;
          height: 100%;
          background: #3B5998;
        }
        
        .dsv-cover-title {
          font-size: 28pt;
          font-weight: bold;
          font-style: italic;
          color: #000;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .dsv-cover-company {
          font-size: 20pt;
          font-weight: bold;
          font-style: italic;
          color: #5B7FC0;
          text-align: center;
        }
        
        .dsv-cover-grass {
          position: absolute;
          bottom: 50px;
          left: 30px;
          width: 150px;
          height: 200px;
        }
        
        /* Contenu DSV */
        .dsv-content {
          padding: 0;
        }
        
        .dsv-title {
          text-align: center;
          font-weight: bold;
          font-size: 14pt;
          text-decoration: underline;
          margin-bottom: 10px;
        }
        
        .dsv-subtitle {
          text-align: center;
          font-style: italic;
          font-size: 10pt;
          margin-bottom: 30px;
        }
        
        .dsv-section {
          margin: 20px 0;
        }
        
        .dsv-section-title {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 15px;
        }
        
        .dsv-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        .dsv-table th, .dsv-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
        }
        
        .dsv-table th {
          font-weight: bold;
          background: #fff;
        }
        
        .page-number {
          position: fixed;
          bottom: 20px;
          right: 40px;
          font-size: 10pt;
        }
      </style>
    </head>
    <body>
      <!-- PAGE DE GARDE -->
      <div class="dsv-cover">
        <div class="dsv-cover-sidebar"></div>
        <div class="dsv-cover-decoration"></div>
        
        <h1 class="dsv-cover-title">DSV DE LA SOCIETE</h1>
        <p class="dsv-cover-company">«${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')},<br>en Abrégée ${escapeHtml(sigle || company.company_name || '')}»</p>
        
        <svg class="dsv-cover-grass" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,150 Q25,100 30,50 Q32,30 28,10" stroke="#3B5998" stroke-width="1" fill="none"/>
          <path d="M25,150 Q30,110 35,70 Q38,50 32,20" stroke="#5B7FC0" stroke-width="1" fill="none"/>
          <path d="M30,150 Q35,120 40,80 Q42,60 38,30" stroke="#8BA4D9" stroke-width="1" fill="none"/>
          <path d="M35,150 Q40,115 45,75 Q48,55 42,25" stroke="#3B5998" stroke-width="1" fill="none"/>
          <path d="M40,150 Q45,125 50,90 Q52,70 48,40" stroke="#5B7FC0" stroke-width="1" fill="none"/>
        </svg>
      </div>
      
      <!-- PAGE 2: CONTENU DSV -->
      <div class="dsv-content">
        <h1 class="dsv-title">DÉCLARATION DE SOUSCRIPTION ET DE VERSEMENT</h1>
        <p class="dsv-subtitle">(cf Art 314 de l'Acte uniforme révisé du 30 janvier 2014, Art 6 de l'Ordonnance N° 2014-161 du 02 avril 2014)</p>
        
        <div style="border-bottom: 2px solid #000; margin: 20px 0;"></div>
        
        <p style="text-align: center;">L'An ${numberToWords(annee)},</p>
        <p style="text-align: center;">Le ${dateActuelle}</p>
        
        <p style="margin-top: 20px;">Le soussigné,</p>
        
        <p style="margin: 15px 0; text-align: justify;">
          <strong>M. ${escapeHtml(gerantNom.toUpperCase())}</strong>, ${escapeHtml(gerantProfession)}, résident à ${escapeHtml(gerantAdresse)} 
          de nationalité ${escapeHtml(gerantNationalite)} né(e) le ${gerantDateNaissance} à ${escapeHtml(gerantLieuNaissance)} 
          et titulaire de la ${gerantTypeId} ${escapeHtml(gerantNumId)} délivré(e) le ${gerantDateDelivranceId} 
          et valable jusqu'au ${gerantDateValiditeId}.
        </p>
        
        <div class="dsv-section">
          <p class="dsv-section-title">EXPOSÉ PRÉALABLE</p>
          
          <p style="text-align: justify;">
            Par Acte sous seing Privé en date du ${dateActuelle}, ont établi les statuts de la Société à Responsabilité Limitée 
            dont les principales caractéristiques sont les suivantes :
          </p>
          
          <p style="margin: 15px 0;"><strong>1 - FORME :</strong> La société constituée est une société à Responsabilité Limitée régie par les dispositions de l'Acte uniforme révisé de l'OHADA du 30 janvier 2014 relatif au droit des Sociétés commerciales et du Groupement d'intérêt économique (GIE), ainsi que par toutes autres dispositions légales ou réglementaires applicables et ses présents statuts.</p>
          
          <p style="margin: 15px 0;"><strong>2 - DÉNOMINATION :</strong> <strong>${escapeHtml(company.company_name || '[NOM SOCIÉTÉ]')}</strong></p>
          
          <p style="margin: 15px 0;"><strong>3 - OBJET :</strong> La société a pour objet en CÔTE D'IVOIRE :</p>
          <p style="margin-left: 20px; text-align: justify;">${escapeHtml(objetSocial)}</p>
          <p style="margin-left: 20px;">- l'acquisition, la location et la vente de tous biens meubles et immeubles.</p>
          <p style="margin-left: 20px;">- l'emprunt de toutes sommes auprès de tous établissements financiers avec possibilité de donner en garantie tout ou partie des biens sociaux.</p>
          <p style="margin-left: 20px;">- la prise en location gérance de tous fonds de commerce.</p>
          <p style="margin-left: 20px;">- la prise de participation dans toute société existante ou devant être créée</p>
          <p style="margin-left: 20px;">- et généralement, toute opérations financières, commerciales, industrielles, mobilières et immobilière, se rapportant directement ou indirectement à l'objet social ou pouvant en faciliter l'extension ou le développement.</p>
          
          <p style="margin: 15px 0;"><strong>4 - SIÈGE SOCIAL :</strong> Le siège social est fixé à : ${siegeAdresse}</p>
          
          <p style="margin: 15px 0;"><strong>5 - DURÉE :</strong> La durée de la société est de ${numberToWords(dureeSociete)} (${dureeSociete}) années, sauf dissolution anticipée ou prorogation.</p>
          
          <p style="margin: 15px 0;"><strong>6 - CAPITAL SOCIAL :</strong> Le capital social est fixé à la somme de <strong>${capitalWords.toUpperCase()} FRANCS CFA (${capital.toLocaleString('fr-FR')} FCFA)</strong> divisé en ${totalParts} parts sociales de ${valeurPart.toLocaleString('fr-FR')} FCFA chacune, attribuées aux associés en proportion de leurs apports, à savoir :</p>
          
          ${repartitionParts}
          
          <p style="margin: 15px 0;"><strong>TOTAL :</strong> ${totalParts} parts sociales</p>
        </div>
        
        <div class="page-break"></div>
        
        <div class="dsv-section">
          <p class="dsv-section-title">II- CONSTATATION DE LA LIBÉRATION ET DU DÉPÔT DES FONDS</p>
          
          <p style="text-align: justify;">
            Les soussignés déclarent que les souscriptions et les versements des fonds provenant de la libération des parts sociales ont été effectués comme suit :
          </p>
          
          <table class="dsv-table">
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
              ${tableauSouscription}
            </tbody>
            <tfoot>
              <tr>
                <td style="font-weight: bold; text-align: left; padding: 8px; border: 1px solid #000;">TOTAL</td>
                <td style="font-weight: bold; padding: 8px; border: 1px solid #000;">${totalParts} parts</td>
                <td style="font-weight: bold; padding: 8px; border: 1px solid #000;">${valeurPart.toLocaleString('fr-FR')} FCFA</td>
                <td style="font-weight: bold; padding: 8px; border: 1px solid #000;">${capital.toLocaleString('fr-FR')} FCFA</td>
                <td style="font-weight: bold; padding: 8px; border: 1px solid #000;">${capital.toLocaleString('fr-FR')} FCFA</td>
              </tr>
            </tfoot>
          </table>
          
          <p style="margin: 20px 0; text-align: justify;">
            La somme correspondante à l'ensemble des souscriptions et versements effectués à ce jour, de 
            <strong>${capitalWords.toLowerCase()} (${capital.toLocaleString('fr-FR')} FCFA)</strong> a été déposée pour le compte 
            de la société et conformément à la loi, dans un compte ouvert à <strong>${escapeHtml(banque)}</strong>.
          </p>
        </div>
        
        <p style="font-weight: bold; margin: 30px 0;">En Foi de quoi, ils ont dressé la présente, pour servir et valoir ce que de droit</p>
        
        <div style="text-align: right; margin-top: 40px;">
          <p>Fait à ${escapeHtml(company.city || 'Abidjan')} le ${dateActuelle}</p>
          <p>En Deux (2) exemplaires originaux</p>
        </div>
        
        ${signaturesHTML}
        
      </div>
    </body>
    </html>
  `;
};

/**
 * Template HTML: Formulaire CEPICI - Format officiel
 */
const generateFormulaireCEPICIHTML = (company, managers, associates, additionalData = {}) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  
  // Debug: Afficher les données reçues
  console.log('🔍 [CEPICI] company:', JSON.stringify(company, null, 2));
  console.log('🔍 [CEPICI] additionalData:', JSON.stringify(additionalData, null, 2));
  
  const capital = parseFloat(company.capital) || 0;
  const capitalNumeraire = capital;
  const apportsNature = 0;
  const dureeSociete = company.duree_societe || company.dureeSociete || 99;
  
  const dateActuelle = formatDate(new Date().toISOString());
  
  // Récupérer les champs du gérant
  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : '';
  const gerantAdresse = gerant?.adresse || gerant?.address || '';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '';
  const gerantDateNaissance = (gerant?.date_naissance || gerant?.dateNaissance) ? formatDate(gerant.date_naissance || gerant.dateNaissance) : '';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '';
  const gerantTypeId = gerant?.type_identite || gerant?.typeIdentite || 'passeport';
  const gerantNumId = gerant?.numero_identite || gerant?.numeroIdentite || '';
  const gerantDateDelivranceId = (gerant?.date_delivrance_id || gerant?.dateDelivranceId) ? formatDate(gerant.date_delivrance_id || gerant.dateDelivranceId) : '';
  const gerantDateValiditeId = (gerant?.date_validite_id || gerant?.dateValiditeId) ? formatDate(gerant.date_validite_id || gerant.dateValiditeId) : '';
  
  // Récupérer les données du déclarant - vérifier plusieurs sources
  const declarant = additionalData.declarant || company.declarant || {};
  const declarantNom = declarant.nom || additionalData.declarant_nom || gerantNom || '';
  const declarantQualite = declarant.qualite || additionalData.declarant_qualite || '';
  const declarantAdresse = declarant.adresse || additionalData.declarant_adresse || gerantAdresse || '';
  const declarantTel = declarant.telephone || additionalData.declarant_telephone || company.telephone || '';
  const declarantFax = declarant.fax || additionalData.declarant_fax || '';
  const declarantMobile = declarant.mobile || additionalData.declarant_mobile || '';
  const declarantEmail = declarant.email || additionalData.declarant_email || company.email || '';
  
  // Récupérer les projections sur 3 ans - vérifier plusieurs sources
  const projections = additionalData.projections || company.projections || {};
  const investAnnee1 = projections.investissement_annee1 || projections.investissementAnnee1 || additionalData.investissement_annee1 || '';
  const investAnnee2 = projections.investissement_annee2 || projections.investissementAnnee2 || additionalData.investissement_annee2 || '';
  const investAnnee3 = projections.investissement_annee3 || projections.investissementAnnee3 || additionalData.investissement_annee3 || '';
  const emploisAnnee1 = projections.emplois_annee1 || projections.emploisAnnee1 || additionalData.emplois_annee1 || '';
  const emploisAnnee2 = projections.emplois_annee2 || projections.emploisAnnee2 || additionalData.emplois_annee2 || '';
  const emploisAnnee3 = projections.emplois_annee3 || projections.emploisAnnee3 || additionalData.emplois_annee3 || '';
  
  // Récupérer les champs de localisation - vérifier plusieurs sources (camelCase et snake_case)
  const commune = additionalData.commune || company.commune || '';
  const quartier = additionalData.quartier || company.quartier || '';
  const lotNumero = additionalData.lot || company.lot || '';
  const ilotNumero = additionalData.ilot || company.ilot || '';
  const nomImmeuble = additionalData.nomImmeuble || additionalData.nom_immeuble || company.nomImmeuble || company.nom_immeuble || '';
  const numeroEtage = additionalData.numeroEtage || additionalData.numero_etage || company.numeroEtage || company.numero_etage || '';
  const numeroPorte = additionalData.numeroPorte || additionalData.numero_porte || company.numeroPorte || company.numero_porte || '';
  const section = additionalData.section || company.section || '';
  const parcelle = additionalData.parcelle || company.parcelle || '';
  const tfNumero = additionalData.tfNumero || additionalData.tf_numero || company.tfNumero || company.tf_numero || '';
  const fax = additionalData.fax || company.fax || '';
  const adressePostale = additionalData.adressePostale || additionalData.adresse_postale || company.adressePostale || company.adresse_postale || '';
  
  console.log('🔍 [CEPICI] Projections:', { investAnnee1, investAnnee2, investAnnee3, emploisAnnee1, emploisAnnee2, emploisAnnee3 });
  console.log('🔍 [CEPICI] Declarant:', { declarantNom, declarantQualite, declarantAdresse });

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        ${getCommonStyles()}
        
        .cepici-page {
          font-family: 'Times New Roman', serif;
          font-size: 10pt;
          line-height: 1.4;
        }
        
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .header-left {
          text-align: center;
          width: 30%;
        }
        
        .header-center {
          text-align: center;
          width: 40%;
        }
        
        .header-right {
          text-align: center;
          width: 30%;
        }
        
        .armoiries {
          font-size: 9pt;
          margin-bottom: 10px;
        }
        
        .armoiries-title {
          font-weight: bold;
          font-size: 10pt;
        }
        
        .cepici-logo {
          font-weight: bold;
          font-size: 14pt;
        }
        
        .main-title-box {
          text-align: center;
          margin: 20px 0;
        }
        
        .main-title-box h1 {
          font-size: 12pt;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 5px;
        }
        
        .main-title-box h2 {
          font-size: 11pt;
          font-weight: normal;
        }
        
        .cadre-reserve {
          border: 1px solid #000;
          padding: 10px;
          margin: 15px 0;
          font-size: 9pt;
        }
        
        .cadre-reserve-title {
          text-align: center;
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 9pt;
        }
        
        .cadre-row {
          margin: 5px 0;
        }
        
        .declarant-box {
          border: 1px solid #000;
          padding: 10px;
          margin: 15px 0;
        }
        
        .declarant-title {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 10px;
          font-size: 9pt;
        }
        
        .declarant-row {
          margin: 3px 0;
          font-size: 9pt;
        }
        
        .section-title {
          font-weight: bold;
          text-decoration: underline;
          margin: 15px 0 10px 0;
          font-size: 10pt;
        }
        
        .projection-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 9pt;
        }
        
        .projection-table th,
        .projection-table td {
          border: 1px solid #000;
          padding: 5px 8px;
          text-align: center;
        }
        
        .projection-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .projection-table td:first-child {
          text-align: left;
          font-weight: bold;
        }
        
        .form-line {
          margin: 5px 0;
          font-size: 10pt;
        }
        
        .dotted-line {
          border-bottom: 1px dotted #000;
          display: inline-block;
          min-width: 150px;
        }
        
        .page-footer {
          font-size: 8pt;
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #000;
        }
        
        .signature-table {
          width: 100%;
          margin-top: 30px;
        }
        
        .signature-table td {
          width: 50%;
          text-align: center;
          vertical-align: top;
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div class="cepici-page">
        
        <!-- EN-TÊTE -->
        <div class="header-section">
          <div class="header-left">
            <div class="armoiries">
              <p class="armoiries-title">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
              <p style="font-style: italic;">Union - Discipline - Travail</p>
            </div>
          </div>
          <div class="header-center">
            <!-- Espace pour logo armoiries -->
          </div>
          <div class="header-right">
            <p style="font-size: 9pt;">Présidence de la République</p>
            <p class="cepici-logo">CEPICI</p>
            <p style="font-size: 8pt;">CENTRE DE PROMOTION DES INVESTISSEMENTS<br>EN CÔTE D'IVOIRE</p>
          </div>
        </div>
        
        <!-- TITRE PRINCIPAL -->
        <div class="main-title-box">
          <h1>FORMULAIRE UNIQUE</h1>
          <h2>D'IMMATRICULATION DES ENTREPRISES</h2>
          <p>(PERSONNES MORALES)</p>
        </div>
        
        <!-- CADRE RÉSERVÉ AU CEPICI -->
        <div class="cadre-reserve">
          <p class="cadre-reserve-title">CADRE RÉSERVÉ AU CEPICI</p>
          <div class="cadre-row">DOSSIER N° ………………………………………………</div>
          <div class="cadre-row">DATE DE RÉCEPTION ………………………………………………</div>
          <div class="cadre-row">NUMÉRO REGISTRE DE COMMERCE : <span style="margin-left: 20px;">/ / / / / / /</span></div>
          <div class="cadre-row">NUMÉRO COMPTE CONTRIBUABLE : <span style="margin-left: 20px;">/ / / / / / /</span></div>
          <div class="cadre-row">NUMÉRO CNPS ENTREPRISE : <span style="margin-left: 20px;">/ / / / / / /</span></div>
          <div class="cadre-row">CODE IMPORT-EXPORT : <span style="margin-left: 20px;">/ / / / / / /</span></div>
        </div>
        
        <!-- DÉCLARANT RESPONSABLE -->
        <div class="declarant-box">
          <p class="declarant-title">DÉCLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITÉS</p>
          <div class="declarant-row">DÉCLARATION ÉTABLIE PAR : <strong>M. ${escapeHtml(declarantNom.toUpperCase())}</strong></div>
          <div class="declarant-row">AGISSANT EN QUALITÉ DE : <strong>${escapeHtml(declarantQualite.toUpperCase())}</strong></div>
          <div class="declarant-row">NUMÉRO DE COMPTE CONTRIBUABLE : ………………………………………………</div>
          <div class="declarant-row">ADRESSE PERSONNELLE : ${escapeHtml(declarantAdresse.toUpperCase())}</div>
          <div class="declarant-row" style="margin-top: 8px;">
            TEL : ……………………………… FAX : ${escapeHtml(declarantFax)} MOBILE : ${escapeHtml(declarantMobile)}
          </div>
          <div class="declarant-row">E-MAIL : ${escapeHtml(declarantEmail)}</div>
        </div>
        
        <!-- I- IDENTIFICATION -->
        <p class="section-title">I- IDENTIFICATION</p>
        
        <table class="projection-table">
          <thead>
            <tr>
              <th></th>
              <th>ANNÉE 1</th>
              <th>ANNÉE 2</th>
              <th>ANNÉE 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Montant d'Investissement (projeté)</td>
              <td>${investAnnee1 ? parseInt(investAnnee1).toLocaleString('fr-FR') : ''}</td>
              <td>${investAnnee2 ? parseInt(investAnnee2).toLocaleString('fr-FR') : ''}</td>
              <td>${investAnnee3 ? parseInt(investAnnee3).toLocaleString('fr-FR') : ''}</td>
            </tr>
            <tr>
              <td>Nombre d'Emplois (projetés)</td>
              <td>${emploisAnnee1}</td>
              <td>${emploisAnnee2}</td>
              <td>${emploisAnnee3}</td>
            </tr>
          </tbody>
        </table>
        
        <p class="page-footer">
          CEPICI : BP V152 ABIDJAN 01 - ABIDJAN PLATEAU 2ème étage immeuble DJEKANOU Tel : (225) 20 30 23 85 - Fax : (225) 20 21 40 71 - Site web : www.cepici.gouv.ci
        </p>
        
        <!-- PAGE 2 -->
        <div class="page-break"></div>
        
        <div class="form-line">Dénomination sociale : ………… <strong>${escapeHtml(company.company_name || '')} SARL</strong> …………………………</div>
        <div class="form-line">Nom commercial : ………………………………………………………………………………………</div>
        <div class="form-line">Sigle : ………………………………</div>
        <div class="form-line">Durée : ……………………………… <strong>${dureeSociete}</strong> ANS………………………………………………</div>
        <div class="form-line">Forme juridique : ……………………………… <strong>SARL U</strong>………………………………………………</div>
        <div class="form-line">Montant du capital : ………… <strong>${capital.toLocaleString('fr-FR')}</strong> FCFA…… Dont : Montant en numéraire ………… <strong>${capitalNumeraire.toLocaleString('fr-FR')}</strong></div>
        <div class="form-line" style="margin-left: 200px;">Évaluation des apports en nature …………… <strong>${apportsNature}</strong>……………………</div>
        
        <!-- II- ACTIVITÉ -->
        <p class="section-title">II- ACTIVITÉ (renseignements sur la personne morale)</p>
        
        <div class="form-line">Activité principale : ${escapeHtml(company.activity || '')}</div>
        <div class="form-line">• L'installation de pompes hydrauliques, suppresseurs et équipements connexes</div>
        <div class="form-line">• L'étude, la conception et la réalisation de forages domestiques, agricoles ou industriels ;</div>
        <div class="form-line">• Les travaux de géotechnique, de sondage, d'essai de sol et d'analyse de terrain</div>
        <div class="form-line">Activités secondaires : ………………………………</div>
        <div class="form-line">Chiffre d'affaires prévisionnel …………… ${company.chiffre_affaires_prev ? company.chiffre_affaires_prev.toLocaleString('fr-FR') : '5 000 000'} FCFA / TAXE D'ÉTAT DE L'ENTREPRENEUR</div>
        <div class="form-line">Nombre d'employés : ………… 1 (UN)………… Date embauche 1er employé : ${dateActuelle}</div>
        <div class="form-line">Date de début d'activité : ………… ${dateActuelle}……………</div>
        
        <!-- III- LOCALISATION -->
        <p class="section-title">III- LOCALISATION DU SIÈGE SOCIAL / DE LA SUCCURSALE</p>
        
        <div class="form-line">Ville : ……<strong>${escapeHtml(company.city || 'ABIDJAN')}</strong>…… Commune : ……<strong>${escapeHtml(commune)}</strong>…… Quartier : ……<strong>${escapeHtml(quartier)}</strong>……</div>
        <div class="form-line">Rue : ……<strong>${escapeHtml(company.address || '')}</strong>…… Lot n° : ……<strong>${escapeHtml(lotNumero)}</strong>…… Ilot n° : ……<strong>${escapeHtml(ilotNumero)}</strong>……</div>
        <div class="form-line">Nom immeuble : ……<strong>${escapeHtml(nomImmeuble)}</strong>…… Numéro étage : ……<strong>${escapeHtml(numeroEtage)}</strong>…… Numéro porte : ……<strong>${escapeHtml(numeroPorte)}</strong>……</div>
        <div class="form-line">Section : ……<strong>${escapeHtml(section)}</strong>…… Parcelle : ……<strong>${escapeHtml(parcelle)}</strong>……</div>
        <div class="form-line">TF n° : ……<strong>${escapeHtml(tfNumero)}</strong>…… Tél. : ……<strong>${escapeHtml(company.telephone || '')}</strong>……</div>
        <div class="form-line">Fax : ……<strong>${escapeHtml(fax)}</strong>……</div>
        <div class="form-line">Adresse postale : ……<strong>${escapeHtml(adressePostale)}</strong>…… Email : ……<strong>${escapeHtml(company.email || '')}</strong>……</div>
        
        <!-- PAGE 3 - DIRIGEANTS -->
        <div class="page-break"></div>
        
        <p class="section-title">IV- INFORMATIONS SUR LES DIRIGEANTS</p>
        
        <p style="font-weight: bold; margin: 10px 0;">DIRIGEANT SOCIAL</p>
        
        <div class="form-line">Nom et Prénoms : <strong>${escapeHtml(gerantNom.toUpperCase())}</strong></div>
        <div class="form-line">Adresse : <strong>${escapeHtml(gerantAdresse.toUpperCase())}</strong></div>
        <div class="form-line">Nationalité : <strong>${escapeHtml(gerantNationalite)}</strong></div>
        <div class="form-line">Date de naissance : <strong>${gerantDateNaissance}</strong></div>
        <div class="form-line">Lieu de naissance : <strong>${escapeHtml(gerantLieuNaissance.toUpperCase())}</strong></div>
        <div class="form-line">Fonction : <strong>GÉRANT</strong></div>
        
        ${gerantTypeId && gerantNumId ? `
        <div class="form-line" style="margin-top: 15px;">
          Titulaire du ${escapeHtml(gerantTypeId)} N°${escapeHtml(gerantNumId)} délivrée le ${gerantDateDelivranceId} et valable jusqu'au ${gerantDateValiditeId}
        </div>
        ` : ''}
        
        <!-- SIGNATURE -->
        <div style="margin-top: 40px;">
          <p>Fait en deux exemplaires et de bonne foi.</p>
          <p style="margin-top: 20px;">À Abidjan, le ${dateActuelle}</p>
        </div>
        
        <div style="border: 1px solid #000; padding: 20px; margin-top: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; text-align: center; padding: 20px; vertical-align: top;">
                <p style="text-decoration: underline; margin-bottom: 60px;">Le Déclarant</p>
                <p>………………………………</p>
              </td>
              <td style="width: 50%; text-align: center; padding: 20px; vertical-align: top;">
                <p style="text-decoration: underline; margin-bottom: 60px;">Le Gérant</p>
                <p>………………………………</p>
              </td>
            </tr>
          </table>
        </div>
        
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
  'Déclaration de Souscription et Versement (DSV)': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers, additionalData),
  'DSV': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers, additionalData),
  'Déclaration Souscription/Versement': (company, associates, managers, additionalData) => generateDSVHTML(company, associates, managers, additionalData),
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

