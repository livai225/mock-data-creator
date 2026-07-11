/**
 * Générateur HTML/CSS pour le formulaire CEPICI
 * Utilise Puppeteer pour convertir en PDF - rendu pixel-perfect
 */

import fs from 'fs';
import path from 'path';

const readImageAsDataUri = (fileName) => {
  try {
    const imagePath = path.resolve(process.cwd(), 'public', 'images', fileName);
    if (!fs.existsSync(imagePath)) {
      console.log(`[CEPICI] Image non trouvée: ${imagePath}`);
      return '';
    }
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(fileName).slice(1).toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`[CEPICI] Erreur lecture image ${fileName}:`, error.message);
    return '';
  }
};

const formatDateDMY = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(dateStr);
  }
};

const formatNumber = (n) => {
  if (n == null || n === '') return '';
  const num = Number(n);
  if (isNaN(num)) return String(n);
  return Math.trunc(num).toLocaleString('fr-FR');
};

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const upper = (str) => escapeHtml(str).toUpperCase();

// Tronque le texte pour qu'il tienne dans une case CEPICI (une seule ligne)
const truncateCepici = (str, max = 80) => {
  if (!str) return '';
  const s = String(str);
  return s.length > max ? s.slice(0, max).trimEnd() + '...' : s;
};

/**
 * Normalise les données pour le formulaire CEPICI
 */
const normalizeCepiciData = (company, managers = [], associates = [], additionalData = {}) => {
  const gerant = managers && managers.length > 0 ? managers[0] : null;
  const declarant = additionalData.declarant || company.declarant || {};
  const projections = additionalData.projections || company.projections || {};

  const capital = Number(company.capital || 0) || 0;
  const dureeSociete = company.duree_societe || company.dureeSociete || 99;

  const gerantNom = gerant ? `${gerant.nom || ''} ${gerant.prenoms || ''}`.trim() : '';
  const gerantAdresse = gerant?.adresse || gerant?.address || '';
  const gerantNationalite = gerant?.nationalite || gerant?.nationality || '';
  const gerantDateNaissance = gerant?.date_naissance || gerant?.dateNaissance || '';
  const gerantLieuNaissance = gerant?.lieu_naissance || gerant?.lieuNaissance || '';
  const gerantRegimeMatrimonial = gerant?.regime_matrimonial || gerant?.regimeMatrimonial || '';

  return {
    companyName: company.company_name || '',
    nomCommercial: company.nom_commercial || '',
    sigle: company.sigle || '',
    dureeSociete: String(dureeSociete),
    capital: formatNumber(capital),
    capitalNumeraire: formatNumber(capital),
    apportsNature: '0',
    formeJuridique: (!associates || associates.length <= 1) ? 'SARL unipersonnelle' : 'SARL pluripersonnelle',
    activitePrincipale: company.activity || '',
    activitesSecondaires: company.activites_secondaires || additionalData.activites_secondaires || '',
    chiffreAffairesPrev: formatNumber(company.chiffre_affaires_prev || additionalData.chiffre_affaires_prev || ''),
    nombreEmployes: additionalData.nombre_employes || '1',
    dateEmbauchePremier: formatDateDMY(additionalData.date_embauche_premier || new Date().toISOString()),
    dateDebutActivite: formatDateDMY(additionalData.date_debut_activite || new Date().toISOString()),

    declarantNom: declarant.nom || additionalData.declarant_nom || gerantNom,
    declarantQualite: declarant.qualite || additionalData.declarant_qualite || 'CONSULTANT COMPTABLE',
    declarantNumCC: declarant.num_cc || additionalData.declarant_num_cc || '',
    declarantAdresse: declarant.adresse || additionalData.declarant_adresse || gerantAdresse,
    declarantTel: declarant.telephone || additionalData.declarant_telephone || company.telephone || '',
    declarantFax: declarant.fax || additionalData.declarant_fax || '',
    declarantMobile: declarant.mobile || additionalData.declarant_mobile || '',
    declarantEmail: declarant.email || additionalData.declarant_email || company.email || '',

    investAnnee1: formatNumber(projections.investissement_annee1 || projections.investissementAnnee1 || additionalData.investissement_annee1 || ''),
    investAnnee2: formatNumber(projections.investissement_annee2 || projections.investissementAnnee2 || additionalData.investissement_annee2 || ''),
    investAnnee3: formatNumber(projections.investissement_annee3 || projections.investissementAnnee3 || additionalData.investissement_annee3 || ''),
    emploisAnnee1: projections.emplois_annee1 || projections.emploisAnnee1 || additionalData.emplois_annee1 || '',
    emploisAnnee2: projections.emplois_annee2 || projections.emploisAnnee2 || additionalData.emplois_annee2 || '',
    emploisAnnee3: projections.emplois_annee3 || projections.emploisAnnee3 || additionalData.emplois_annee3 || '',

    ville: company.city || 'ABIDJAN',
    commune: additionalData.commune || company.commune || '',
    quartier: additionalData.quartier || company.quartier || '',
    rue: company.address || '',
    lot: additionalData.lot || company.lot || '',
    ilot: additionalData.ilot || company.ilot || '',
    nomImmeuble: additionalData.nomImmeuble || additionalData.nom_immeuble || company.nomImmeuble || '',
    numeroEtage: additionalData.numeroEtage || additionalData.numero_etage || company.numeroEtage || '',
    numeroPorte: additionalData.numeroPorte || additionalData.numero_porte || company.numeroPorte || '',
    section: additionalData.section || company.section || '',
    parcelle: additionalData.parcelle || company.parcelle || '',
    tfNumero: additionalData.tfNumero || additionalData.tf_numero || company.tfNumero || '',
    telephone: company.telephone || '',
    fax: additionalData.fax || company.fax || '',
    adressePostale: additionalData.adressePostale || additionalData.adresse_postale || company.adressePostale || '',
    email: company.email || '',

    gerantNom,
    gerantNationalite,
    gerantDateNaissance: formatDateDMY(gerantDateNaissance),
    gerantLieuNaissance,
    gerantAdresse,
    gerantRegimeMatrimonial,

    associates: (associates || []).map(a => ({
      nom: `${a.nom || ''} ${a.prenoms || ''}`.trim() || a.name || '',
      adresse: a.adresse || a.address || a.adresseDomicile || '',
      nationalite: a.nationalite || a.nationality || '',
      dateNaissance: formatDateDMY(a.date_naissance || a.dateNaissance || ''),
      lieuNaissance: a.lieu_naissance || a.lieuNaissance || '',
      regimeMatrimonial: a.regime_matrimonial || a.regimeMatrimonial || '',
      villeResidence: a.ville_residence || a.villeResidence || ''
    })),

    managers: (managers || []).map(m => ({
      nom: `${m.nom || ''} ${m.prenoms || ''}`.trim() || m.name || '',
      nomJeuneFille: m.nom_jeune_fille || m.nomJeuneFille || '',
      dateNaissance: formatDateDMY(m.date_naissance || m.dateNaissance || ''),
      lieuNaissance: m.lieu_naissance || m.lieuNaissance || '',
      fonction: m.fonction || 'GÉRANT',
      domicile: m.adresse || m.address || m.domicile || '',
      telephone: m.telephone || '',
      adressePostale: m.adresse_postale || m.adressePostale || '',
      situationMatrimoniale: m.regime_matrimonial || m.regimeMatrimonial || ''
    }))
  };
};

/**
 * Génère le HTML complet du formulaire CEPICI
 */
export const generateCepiciHtml = (company, managers = [], associates = [], additionalData = {}) => {
  const d = normalizeCepiciData(company, managers, associates, additionalData);
  
  const today = new Date();
  const dateSignature = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  // Charger les images une seule fois
  const logoCepici = readImageAsDataUri('logo_cepici.png');
  const armoiries = readImageAsDataUri('armoiries-ci.png');

  // Génération des lignes du tableau associés
  const assoc1 = d.associates[0] || {};
  const assoc2 = d.associates[1] || {};
  const assoc3 = d.associates[2] || {};

  // Génération des lignes du tableau dirigeants
  const dir1 = d.managers[0] || {};
  const dir2 = d.managers[1] || {};
  const dir3 = d.managers[2] || {};

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CEPICI — Formulaire unique d'immatriculation (Personnes morales)</title>

  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Times New Roman", Times, serif;
      color: #111;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 100%;
      page-break-after: always;
      page-break-inside: avoid;
      padding: 0;
    }
    .page:last-child { page-break-after: auto; }

    .small { font-size: 11px; }
    .muted { color: #555; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }
    .u { text-decoration: underline; }
    h1, h2, h3 { margin: 0; }
    .title-1 { font-size: 18px; font-weight: 700; letter-spacing: .3px; }
    .title-2 { font-size: 16px; font-weight: 700; letter-spacing: .2px; }
    .subtitle { font-size: 14px; font-weight: 700; }

    .header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
      gap: 8mm;
      margin-top: 4mm;
    }
    .logoBox {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .logo {
      width: 140px;
      height: 52px;
      border: 1px solid #ddd;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #777;
    }
    .coat {
      width: 70px;
      height: 70px;
      border: 1px solid #ddd;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #777;
      margin-left: auto;
    }
    .gov {
      text-align: center;
      line-height: 1.15;
      font-size: 12px;
    }

    .box {
      border: 1px solid #bbb;
      padding: 10px 10px 8px;
      margin-top: 10mm;
    }
    .boxTitle {
      text-align: center;
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 6px;
      text-transform: uppercase;
      color: #666;
    }

    .thickBox {
      border: 2px solid #000;
      margin-top: 12mm;
    }
    .thickBox .thickTitle {
      border-bottom: 2px solid #000;
      padding: 6px 8px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: center;
      font-size: 12px;
    }
    .thickBox .thickBody {
      padding: 10px 10px 8px;
      font-size: 12px;
    }

    .lineRow {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px;
      align-items: end;
      margin: 6px 0;
    }
    .dots {
      border-bottom: 1px dotted #000;
      height: 14px;
      width: 100%;
      padding-left: 4px;
      font-weight: 600;
    }
    .inlineDots {
      display: inline-block;
      border-bottom: 1px dotted #000;
      height: 14px;
      vertical-align: bottom;
      padding-left: 4px;
      font-weight: 600;
    }

    .slashGrid {
      display: inline-grid;
      grid-auto-flow: column;
      grid-auto-columns: 14px;
      gap: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .slashCell {
      width: 14px;
      height: 16px;
      border-bottom: 1px solid #000;
      transform: skewX(-20deg);
      border-right: 1px solid transparent;
    }

    .section {
      margin-top: 6mm;
      font-size: 12.5px;
    }
    .sectionTitle {
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 3mm;
    }
    .sectionTitle .roman {
      margin-right: 6px;
    }

    .fieldLine {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 10px;
      align-items: end;
      margin: 6px 0;
    }
    .fieldLine .label { white-space: nowrap; }

    .fieldLineWide {
      display: grid;
      grid-template-columns: 1fr;
      margin: 6px 0;
    }

    table { border-collapse: collapse; width: 100%; }
    .gridTable th, .gridTable td {
      border: 1px solid #000;
      padding: 6px 6px;
      font-size: 12px;
      vertical-align: top;
    }
    .gridTable th {
      text-align: center;
      font-weight: 700;
    }
    .leftHead { width: 38%; font-weight: 700; }
    .colNum { width: 20.666%; text-align: center; }

    .projTable th, .projTable td {
      border: 1px solid #000;
      padding: 8px 8px;
      font-size: 12px;
    }
    .projTable th { text-transform: uppercase; font-weight: 700; }

    .signatureArea {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12mm;
      align-items: start;
      margin-top: 22mm;
      font-size: 12px;
    }
    .sigBox {
      width: 90mm;
      height: 55mm;
      border: 1px solid #000;
      margin-left: auto;
      display: grid;
      place-items: start center;
      padding-top: 10mm;
      font-weight: 700;
    }

    .footer {
      display: none;
    }

    .mt-6 { margin-top: 6mm; }
    .mt-10 { margin-top: 10mm; }
    .mt-14 { margin-top: 14mm; }
    .mb-2 { margin-bottom: 2mm; }
    
    .value { font-weight: 600; }
  </style>
</head>

<body>

  <!-- PAGE 1 -->
  <section class="page">

    <div class="header">
      <div class="logoBox">
        ${logoCepici ? `<img src="${logoCepici}" style="height: 45px; width: auto;" />` : '<div class="logo">LOGO CEPICI</div>'}
      </div>

      <div class="gov">
        <div class="bold">RÉPUBLIQUE DE CÔTE D'IVOIRE</div>
        <div class="small">Union - Discipline - Travail</div>
        ${armoiries ? `<img src="${armoiries}" style="height: 60px; width: auto; margin-top: 5px;" />` : '<div class="coat">Armoiries</div>'}
      </div>
    </div>

    <div class="center mt-10">
      <div class="title-1">FORMULAIRE UNIQUE</div>
      <div class="title-2">D'IMMATRICULATION DES ENTREPRISES</div>
      <div class="subtitle">(PERSONNES MORALES)</div>
    </div>

    <div class="box">
      <div class="boxTitle">CADRE RÉSERVÉ AU CEPICI</div>

      <div class="lineRow">
        <div class="label small">DOSSIER N°</div>
        <div class="dots"></div>
      </div>

      <div class="lineRow">
        <div class="label small">DATE DE RÉCEPTION</div>
        <div class="dots"></div>
      </div>

      <div class="mt-6 small">
        <div class="lineRow" style="grid-template-columns: 220px 1fr;">
          <div class="label">NUMÉRO REGISTRE DE COMMERCE</div>
          <div>
            <span class="slashGrid">
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
            </span>
          </div>
        </div>

        <div class="lineRow" style="grid-template-columns: 220px 1fr;">
          <div class="label">NUMÉRO COMPTE CONTRIBUABLE</div>
          <div>
            <span class="slashGrid">
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
            </span>
          </div>
        </div>

        <div class="lineRow" style="grid-template-columns: 220px 1fr;">
          <div class="label">NUMÉRO CNPS ENTREPRISE</div>
          <div>
            <span class="slashGrid">
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
            </span>
          </div>
        </div>

        <div class="lineRow" style="grid-template-columns: 220px 1fr;">
          <div class="label">CODE IMPORT-EXPORT</div>
          <div>
            <span class="slashGrid">
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
              <span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span><span class="slashCell"></span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="thickBox mt-10">
      <div class="thickTitle">DÉCLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITÉS</div>
      <div class="thickBody">
        <div class="lineRow">
          <div class="label bold">DÉCLARATION ÉTABLIE PAR :</div>
          <div class="dots">${upper(d.declarantNom)}</div>
        </div>
        <div class="lineRow">
          <div class="label bold">AGISSANT EN QUALITÉ DE :</div>
          <div class="dots">${upper(d.declarantQualite)}</div>
        </div>
        <div class="lineRow">
          <div class="label bold">NUMÉRO DE COMPTE CONTRIBUABLE :</div>
          <div class="dots">${escapeHtml(d.declarantNumCC)}</div>
        </div>

        <div class="lineRow">
          <div class="label bold">ADRESSE PERSONNELLE :</div>
          <div class="dots">${upper(d.declarantAdresse)}</div>
        </div>
        <div class="lineRow" style="grid-template-columns: 0 1fr;">
          <div></div><div class="dots"></div>
        </div>

        <div class="lineRow" style="grid-template-columns: 60px 1fr 60px 1fr;">
          <div class="label bold">TEL :</div><div class="dots">${escapeHtml(d.declarantTel)}</div>
          <div class="label bold">FAX :</div><div class="dots">${escapeHtml(d.declarantFax)}</div>
        </div>
        <div class="lineRow" style="grid-template-columns: 60px 1fr 80px 1fr;">
          <div class="label bold">MOBILE :</div><div class="dots">${escapeHtml(d.declarantMobile)}</div>
          <div class="label bold">E-MAIL :</div><div class="dots">${escapeHtml(d.declarantEmail)}</div>
        </div>
      </div>
    </div>

    <div class="mt-10">
      <table class="projTable">
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
            <td class="bold">Montant d'Investissement (projeté)</td>
            <td style="height: 18mm;" class="value">${escapeHtml(d.investAnnee1)}</td>
            <td class="value">${escapeHtml(d.investAnnee2)}</td>
            <td class="value">${escapeHtml(d.investAnnee3)}</td>
          </tr>
          <tr>
            <td class="bold">Nombre d'Emplois (projetés)</td>
            <td style="height: 18mm;" class="value">${escapeHtml(d.emploisAnnee1)}</td>
            <td class="value">${escapeHtml(d.emploisAnnee2)}</td>
            <td class="value">${escapeHtml(d.emploisAnnee3)}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </section>

  <!-- PAGE 2 -->
  <section class="page">

    <div class="section">
      <div class="sectionTitle"><span class="roman">I-</span> IDENTIFICATION</div>

      <div class="fieldLine">
        <div class="label">Dénomination sociale :</div><div class="dots">${upper(d.companyName)} ${escapeHtml(d.formeJuridique)}</div>
      </div>
      <div class="fieldLine">
        <div class="label">Nom commercial :</div><div class="dots">${upper(d.nomCommercial)}</div>
      </div>
      <div class="fieldLine">
        <div class="label">Sigle :</div><div class="dots">${upper(d.sigle)}</div>
      </div>
      <div class="fieldLine">
        <div class="label">Durée :</div><div class="dots">${escapeHtml(d.dureeSociete)} ANS</div>
      </div>
      <div class="fieldLine">
        <div class="label">Forme juridique :</div><div class="dots">${escapeHtml(d.formeJuridique)}</div>
      </div>

      <div class="fieldLine">
        <div class="label">Montant du capital :</div>
        <div class="dots">${escapeHtml(d.capital)} FCFA</div>
      </div>
      <div class="fieldLine" style="grid-template-columns: 220px 1fr;">
        <div class="label right">Dont : Montant en numéraire</div>
        <div class="dots">${escapeHtml(d.capitalNumeraire)} FCFA</div>
      </div>
      <div class="fieldLine" style="grid-template-columns: 220px 1fr;">
        <div class="label right">Évaluation des apports en nature</div>
        <div class="dots">${escapeHtml(d.apportsNature)}</div>
      </div>
    </div>

    <div class="section">
      <div class="sectionTitle"><span class="roman">II-</span> ACTIVITÉ <span class="muted">(renseignements sur la personne morale)</span></div>

      <div class="fieldLine">
        <div class="label">Activité principale :</div><div class="dots">${escapeHtml(truncateCepici(d.activitePrincipale))}</div>
      </div>
      <div class="fieldLine">
        <div class="label">Activités secondaires :</div><div class="dots">${escapeHtml(truncateCepici(d.activitesSecondaires))}</div>
      </div>
      <div class="fieldLine">
        <div class="label">Chiffre d'affaires prévisionnel :</div><div class="dots">${d.chiffreAffairesPrev ? escapeHtml(d.chiffreAffairesPrev) + ' FCFA' : ''}</div>
      </div>

      <div class="fieldLine" style="grid-template-columns: 160px 1fr 170px 1fr;">
        <div class="label">Nombre d'employés :</div><div class="dots">${escapeHtml(d.nombreEmployes)}</div>
        <div class="label">Date embauche 1<sup>er</sup> employé :</div><div class="dots">${escapeHtml(d.dateEmbauchePremier)}</div>
      </div>

      <div class="fieldLine">
        <div class="label">Date de début d'activité :</div><div class="dots">${escapeHtml(d.dateDebutActivite)}</div>
      </div>
    </div>

    <div class="section">
      <div class="sectionTitle"><span class="roman">III-</span> LOCALISATION DU SIÈGE SOCIAL / DE LA SUCCURSALE</div>

      <div class="fieldLine" style="grid-template-columns: 110px 1fr 110px 1fr;">
        <div class="label">Ville :</div><div class="dots">${upper(d.ville)}</div>
        <div class="label">Commune :</div><div class="dots">${upper(d.commune)}</div>
      </div>

      <div class="fieldLine" style="grid-template-columns: 110px 1fr 80px 1fr;">
        <div class="label">Quartier :</div><div class="dots">${upper(d.quartier)}</div>
        <div class="label">Rue :</div><div class="dots">${upper(d.rue)}</div>
      </div>

      <div class="fieldLine" style="grid-template-columns: 80px 1fr 80px 1fr;">
        <div class="label">Lot n° :</div><div class="dots">${escapeHtml(d.lot)}</div>
        <div class="label">Ilot :</div><div class="dots">${escapeHtml(d.ilot)}</div>
      </div>

      <div class="fieldLine" style="grid-template-columns: 140px 1fr 120px 1fr 120px 1fr;">
        <div class="label">Nom immeuble :</div><div class="dots">${upper(d.nomImmeuble)}</div>
        <div class="label">Numéro étage :</div><div class="dots">${escapeHtml(d.numeroEtage)}</div>
        <div class="label">Numéro porte :</div><div class="dots">${escapeHtml(d.numeroPorte)}</div>
      </div>

      <div class="fieldLine" style="grid-template-columns: 110px 1fr 110px 1fr;">
        <div class="label">Section :</div><div class="dots">${escapeHtml(d.section)}</div>
        <div class="label">Parcelle :</div><div class="dots">${escapeHtml(d.parcelle)}</div>
      </div>

      <div class="fieldLine">
        <div class="label">TF n° :</div><div class="dots">${escapeHtml(d.tfNumero)}</div>
      </div>

      <div class="fieldLine" style="grid-template-columns: 60px 1fr 60px 1fr;">
        <div class="label">Tél. :</div><div class="dots">${escapeHtml(d.telephone)}</div>
        <div class="label">Fax :</div><div class="dots">${escapeHtml(d.fax)}</div>
      </div>

      <div class="fieldLine" style="grid-template-columns: 140px 1fr 90px 1fr;">
        <div class="label">Adresse postale :</div><div class="dots">${escapeHtml(d.adressePostale)}</div>
        <div class="label">Email :</div><div class="dots">${escapeHtml(d.email)}</div>
      </div>
    </div>

    <div class="section">
      <div class="sectionTitle"><span class="roman">IV-</span> ADRESSE DES AUTRES ÉTABLISSEMENTS</div>
      <div class="fieldLineWide"><div class="dots"></div></div>
      <div class="fieldLineWide"><div class="dots"></div></div>
      <div class="fieldLineWide"><div class="dots"></div></div>
    </div>

    <div class="section">
      <div class="sectionTitle"><span class="roman">V-</span> INFORMATIONS SUR LES DIRIGEANTS, ACTIONNAIRES ET COMMISSAIRES AUX COMPTES</div>
      <div class="small muted mb-2">Associés tenus indéfiniment et personnellement responsables des dettes sociales</div>

      <table class="gridTable">
        <thead>
          <tr>
            <th></th>
            <th class="colNum">1</th>
            <th class="colNum">2</th>
            <th class="colNum">3</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="leftHead">Nom et Prénoms</td><td>${upper(assoc1.nom)}</td><td>${upper(assoc2.nom)}</td><td>${upper(assoc3.nom)}</td></tr>
          <tr><td class="leftHead">Adresse</td><td>${upper(assoc1.adresse)}</td><td>${upper(assoc2.adresse)}</td><td>${upper(assoc3.adresse)}</td></tr>
          <tr><td class="leftHead">Nationalité</td><td>${escapeHtml(assoc1.nationalite)}</td><td>${escapeHtml(assoc2.nationalite)}</td><td>${escapeHtml(assoc3.nationalite)}</td></tr>
          <tr><td class="leftHead">Date et lieu de naissance</td><td>${escapeHtml(assoc1.dateNaissance)} ${escapeHtml(assoc1.lieuNaissance)}</td><td>${escapeHtml(assoc2.dateNaissance)} ${escapeHtml(assoc2.lieuNaissance)}</td><td>${escapeHtml(assoc3.dateNaissance)} ${escapeHtml(assoc3.lieuNaissance)}</td></tr>
          <tr><td class="leftHead">Régime matrimonial adopté</td><td>${escapeHtml(assoc1.regimeMatrimonial)}</td><td>${escapeHtml(assoc2.regimeMatrimonial)}</td><td>${escapeHtml(assoc3.regimeMatrimonial)}</td></tr>
          <tr><td class="leftHead">Clauses opposables aux tiers</td><td></td><td></td><td></td></tr>
          <tr><td class="leftHead">Domicile</td><td>${escapeHtml(assoc1.villeResidence || assoc1.adresse)}</td><td>${escapeHtml(assoc2.villeResidence || assoc2.adresse)}</td><td>${escapeHtml(assoc3.villeResidence || assoc3.adresse)}</td></tr>
        </tbody>
      </table>
    </div>

  </section>

  <!-- PAGE 3 -->
  <section class="page">

    <div class="section">
      <div class="bold mb-2">Dirigeants sociaux (gérants, administrateurs ou associés pouvant engager la société)</div>

      <table class="gridTable">
        <thead>
          <tr>
            <th></th>
            <th class="colNum">1</th>
            <th class="colNum">2</th>
            <th class="colNum">3</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="leftHead">Nom et Prénoms</td><td>${upper(dir1.nom)}</td><td>${upper(dir2.nom)}</td><td>${upper(dir3.nom)}</td></tr>
          <tr><td class="leftHead">Nom de jeune fille</td><td>${escapeHtml(dir1.nomJeuneFille)}</td><td>${escapeHtml(dir2.nomJeuneFille)}</td><td>${escapeHtml(dir3.nomJeuneFille)}</td></tr>
          <tr><td class="leftHead">Date et lieu de naissance</td><td>${escapeHtml(dir1.dateNaissance)} ${escapeHtml(dir1.lieuNaissance)}</td><td>${escapeHtml(dir2.dateNaissance)} ${escapeHtml(dir2.lieuNaissance)}</td><td>${escapeHtml(dir3.dateNaissance)} ${escapeHtml(dir3.lieuNaissance)}</td></tr>
          <tr><td class="leftHead">Fonction</td><td>${escapeHtml(dir1.fonction) || 'GÉRANT'}</td><td>${escapeHtml(dir2.fonction)}</td><td>${escapeHtml(dir3.fonction)}</td></tr>
          <tr><td class="leftHead">Domicile</td><td>${upper(dir1.domicile)}</td><td>${upper(dir2.domicile)}</td><td>${upper(dir3.domicile)}</td></tr>
          <tr><td class="leftHead">Téléphone et adresse postale</td><td>${escapeHtml(dir1.telephone)}</td><td>${escapeHtml(dir2.telephone)}</td><td>${escapeHtml(dir3.telephone)}</td></tr>
          <tr><td class="leftHead">Situation matrimoniale</td><td>${escapeHtml(dir1.situationMatrimoniale)}</td><td>${escapeHtml(dir2.situationMatrimoniale)}</td><td>${escapeHtml(dir3.situationMatrimoniale)}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="section mt-14">
      <div class="bold mb-2">Commissaires aux comptes (pour les SA obligatoires)</div>

      <table class="gridTable">
        <thead>
          <tr>
            <th></th>
            <th class="colNum">1 (titulaire)</th>
            <th class="colNum">2 (suppléant)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="leftHead">Nom et prénoms</td><td></td><td></td></tr>
          <tr><td class="leftHead">Date et lieu de naissance</td><td></td><td></td></tr>
          <tr><td class="leftHead">Domicile</td><td></td><td></td></tr>
          <tr><td class="leftHead">Téléphone et adresse postale</td><td></td><td></td></tr>
        </tbody>
      </table>
    </div>

    <div class="signatureArea">
      <div>
        Fait à Abidjan, le <span class="inlineDots" style="width: 70mm;">${dateSignature}</span>
      </div>
      <div class="sigBox">Signature</div>
    </div>

  </section>

</body>
</html>`;
};

/**
 * Génère le HTML du formulaire CEPICI pour une Entreprise Individuelle (Personne Physique)
 */
export const generateCepiciEIHtml = (company, managers = [], additionalData = {}) => {
  const proprietaire = managers[0] || {};
  const declarant = additionalData.declarant || {};
  const projections = additionalData.projections || {};
  const eiData = additionalData.eiData || {};

  const formatNum = (n) => {
    if (!n || n === '') return '';
    const num = Number(n);
    if (isNaN(num)) return String(n);
    return Math.trunc(num).toLocaleString('fr-FR');
  };

  const fmtDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
    } catch { return String(d); }
  };

  const today = new Date();
  const dateSignature = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

  const logoCepici = readImageAsDataUri('logo_cepici.png');
  const armoiries = readImageAsDataUri('armoiries-ci.png');

  const proprietaireNom = `${proprietaire.nom || ''} ${proprietaire.prenoms || ''}`.trim();
  const conjoint = {
    nom: eiData.conjointNom || '',
    prenoms: eiData.conjointPrenoms || '',
    dateNaissance: fmtDate(eiData.conjointDateNaissance),
    lieuNaissance: eiData.conjointLieuNaissance || '',
    nationalite: eiData.conjointNationalite || '',
    domicile: eiData.conjointDomicile || '',
    regimeMatrimonial: eiData.conjointRegimeMatrimonial || '',
  };

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>CEPICI — Formulaire unique (Personnes physiques)</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Times New Roman", Times, serif; color: #111; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100%; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .bold { font-weight: 700; }
    .u { text-decoration: underline; }
    .center { text-align: center; }
    .header { display: grid; grid-template-columns: 1fr 1fr; align-items: start; gap: 8mm; margin-top: 4mm; }
    .logoBox { display: flex; align-items: flex-start; gap: 10px; }
    .logo { width: 140px; height: 52px; }
    .coat { width: 60px; height: 60px; }
    .cepiciBox { text-align: right; }
    .reservedBox { border: 1px solid #000; padding: 6px 10px; margin: 6mm 0; font-size: 10px; }
    .reservedBox .title { text-align: center; font-size: 10px; margin-bottom: 4px; }
    .reservedLine { display: grid; grid-template-columns: 160px 1fr; margin: 2px 0; }
    .reservedLineDouble { display: grid; grid-template-columns: 160px 1fr 160px 1fr; margin: 2px 0; }
    .dots { border-bottom: 1px dotted #333; min-height: 14px; }
    .declarantBox { border: 1px solid #000; padding: 8px 10px; margin: 4mm 0; }
    .declarantTitle { text-align: center; font-weight: 700; font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 6px; }
    .lineRow { display: grid; grid-template-columns: 180px 1fr; gap: 4px; margin: 3px 0; align-items: end; }
    .label { font-weight: 700; font-size: 10px; white-space: nowrap; }
    .projTable { width: 100%; border-collapse: collapse; margin-top: 4mm; font-size: 10px; }
    .projTable th, .projTable td { border: 1px solid #000; padding: 4px 6px; text-align: center; }
    .projTable th { font-weight: 700; background: #f0f0f0; }
    .projTable td:first-child { text-align: left; font-weight: 700; }
    .section { margin: 4mm 0; }
    .sectionTitle { font-weight: 700; font-size: 12px; text-decoration: underline; margin-bottom: 4px; }
    .fieldLine { display: grid; grid-template-columns: 140px 1fr; gap: 4px; margin: 3px 0; align-items: end; }
    .fieldLineWide { display: grid; grid-template-columns: 1fr; margin: 3px 0; }
    .gridTable { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 3mm; }
    .gridTable th, .gridTable td { border: 1px solid #000; padding: 3px 5px; }
    .gridTable th { background: #f0f0f0; font-weight: 700; text-align: center; }
    .leftHead { font-weight: 700; width: 160px; }
    .signatureArea { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10mm; }
    .sigBox { border: 1px solid #000; width: 60mm; height: 25mm; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #777; }
    .inlineDots { display: inline-block; border-bottom: 1px dotted #333; }
    .mt-4 { margin-top: 4mm; }
    .mb-2 { margin-bottom: 2mm; }
  </style>
</head>
<body>

<!-- PAGE 1 -->
<section class="page">
  <div class="header">
    <div class="logoBox">
      ${logoCepici ? `<img src="${logoCepici}" class="logo" alt="CEPICI"/>` : '<div class="logo">CEPICI</div>'}
    </div>
    <div class="cepiciBox">
      <div style="font-size:9px;">REPUBLIQUE DE CÔTE D'IVOIRE</div>
      ${armoiries ? `<img src="${armoiries}" class="coat" alt="Armoiries"/>` : ''}
      <div style="font-size:9px;">Union – Discipline – Travail</div>
    </div>
  </div>

  <div class="center" style="margin: 6mm 0 4mm;">
    <div style="font-size:14px; font-weight:700;">FORMULAIRE UNIQUE</div>
    <div style="font-size:14px; font-weight:700;">D'IMMATRICULATION DES ENTREPRISES</div>
    <div style="font-size:13px; font-weight:700;">(PERSONNES PHYSIQUES)</div>
  </div>

  <div class="reservedBox">
    <div class="title">CADRE RESERVE AU CEPICI</div>
    <div class="reservedLine"><span>DOSSIER N°</span><div class="dots"></div></div>
    <div class="reservedLine"><span>DATE DE RECEPTION</span><div class="dots"></div></div>
    <div class="reservedLine"><span>NUMERO REGISTRE DE COMMERCE</span><div class="dots"></div></div>
    <div class="reservedLine"><span>NUMERO COMPTE CONTRIBUABLE</span><div class="dots"></div></div>
    <div class="reservedLine"><span>NUMERO CNPS ENTREPRISE</span><div class="dots"></div></div>
    <div class="reservedLine"><span>CODE IMPORT-EXPORT</span><div class="dots"></div></div>
  </div>

  <div class="declarantBox">
    <div class="declarantTitle">DECLARANT RESPONSABLE POUR L'ACCOMPLISSEMENT DES FORMALITES</div>
    <div class="lineRow">
      <div class="label">DECLARATION ETABLIE PAR :</div><div class="dots">${escapeHtml(declarant.nom || '')}</div>
    </div>
    <div class="lineRow">
      <div class="label">AGISSANT EN QUALITE DE :</div><div class="dots">${escapeHtml(declarant.qualite || '')}</div>
    </div>
    <div class="lineRow">
      <div class="label">NUMERO DE COMPTE CONTRIBUABLE :</div><div class="dots">${escapeHtml(declarant.numeroCompte || '')}</div>
    </div>
    <div class="lineRow">
      <div class="label">ADRESSE PERSONNELLE :</div><div class="dots">${upper(declarant.adresse || '')}</div>
    </div>
    <div class="lineRow" style="grid-template-columns: 0 1fr;"><div></div><div class="dots"></div></div>
    <div class="lineRow" style="grid-template-columns: 60px 1fr 60px 1fr;">
      <div class="label">TEL :</div><div class="dots">${escapeHtml(declarant.telephone || '')}</div>
      <div class="label">FAX :</div><div class="dots">${escapeHtml(declarant.fax || '')}</div>
    </div>
    <div class="lineRow" style="grid-template-columns: 60px 1fr 80px 1fr;">
      <div class="label">MOBILE :</div><div class="dots">${escapeHtml(declarant.mobile || '')}</div>
      <div class="label">E-MAIL :</div><div class="dots">${escapeHtml(declarant.email || '')}</div>
    </div>
  </div>

  <div class="mt-4">
    <table class="projTable">
      <thead>
        <tr><th></th><th>ANNÉE 1</th><th>ANNÉE 2</th><th>ANNÉE 3</th></tr>
      </thead>
      <tbody>
        <tr>
          <td class="bold">Montant d'Investissement (projeté)</td>
          <td style="height: 18mm;">${escapeHtml(formatNum(projections.investissementAnnee1 || projections.investissement_annee1 || ''))}</td>
          <td>${escapeHtml(formatNum(projections.investissementAnnee2 || projections.investissement_annee2 || ''))}</td>
          <td>${escapeHtml(formatNum(projections.investissementAnnee3 || projections.investissement_annee3 || ''))}</td>
        </tr>
        <tr>
          <td class="bold">Nombre d'Emplois (projetés)</td>
          <td style="height: 18mm;">${escapeHtml(String(projections.emploisAnnee1 || projections.emplois_annee1 || ''))}</td>
          <td>${escapeHtml(String(projections.emploisAnnee2 || projections.emplois_annee2 || ''))}</td>
          <td>${escapeHtml(String(projections.emploisAnnee3 || projections.emplois_annee3 || ''))}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="text-align:right; font-size:9px; margin-top: 6mm;">FU/PP-1/2</div>
</section>

<!-- PAGE 2 -->
<section class="page">

  <div class="section">
    <div class="sectionTitle">I- IDENTIFICATION</div>
    <div class="fieldLine"><div class="label">Nom :</div><div class="dots">${upper(proprietaire.nom || '')}</div></div>
    <div class="fieldLine"><div class="label">Prénoms :</div><div class="dots">${upper(proprietaire.prenoms || '')}</div></div>
    <div class="fieldLine"><div class="label">Date et lieu de naissance :</div><div class="dots">${escapeHtml(fmtDate(proprietaire.dateNaissance || proprietaire.date_naissance || ''))} ${escapeHtml(proprietaire.lieuNaissance || proprietaire.lieu_naissance || '')}</div></div>
    <div class="fieldLine"><div class="label">Domicile :</div><div class="dots">${upper(proprietaire.adresse || '')}</div></div>
    <div class="fieldLine"><div class="label">Nationalité :</div><div class="dots">${escapeHtml(proprietaire.nationalite || '')}</div></div>
    <div class="fieldLine"><div class="label">Situation matrimoniale :</div><div class="dots">${escapeHtml(eiData.situationMatrimoniale || proprietaire.regimeMatrimonial || '')}</div></div>
  </div>

  <div class="section">
    <div class="sectionTitle">II- <span class="u">IDENTIFICATION DU CONJOINT</span></div>
    <div class="fieldLine"><div class="label">Nom :</div><div class="dots">${upper(conjoint.nom)}</div></div>
    <div class="fieldLine"><div class="label">Prénoms :</div><div class="dots">${upper(conjoint.prenoms)}</div></div>
    <div class="fieldLine"><div class="label">Date et lieu de naissance :</div><div class="dots">${escapeHtml(conjoint.dateNaissance)} ${escapeHtml(conjoint.lieuNaissance)}</div></div>
    <div class="fieldLine"><div class="label">Nationalité :</div><div class="dots">${escapeHtml(conjoint.nationalite)}</div></div>
    <div class="fieldLine"><div class="label">Domicile :</div><div class="dots">${upper(conjoint.domicile)}</div></div>
    <div class="fieldLine"><div class="label">Régime matrimonial :</div><div class="dots">${escapeHtml(conjoint.regimeMatrimonial)}</div></div>
  </div>

  <div class="section">
    <div class="sectionTitle">III- <span class="u">ACTIVITES</span> <span style="font-weight:400;">(renseignements relatifs à l'entreprise)</span></div>
    <div class="fieldLine"><div class="label">Activités exercées :</div><div class="dots">${escapeHtml(truncateCepici(company.activity || ''))}</div></div>
    <div class="fieldLine"><div class="label">Forme d'exploitation :</div><div class="dots">${escapeHtml(eiData.formeExploitation || '')}</div></div>
    <div style="display:grid; grid-template-columns: 130px 1fr 160px 1fr; gap:4px; margin:3px 0; align-items:end;">
      <div class="label">Nombre d'employés :</div><div class="dots">${escapeHtml(eiData.nombreEmployes || '')}</div>
      <div class="label">Date d'embauche 1<sup>er</sup> employé :</div><div class="dots">${escapeHtml(fmtDate(eiData.dateEmbauchePremierEmploye))}</div>
    </div>
    <div class="fieldLine"><div class="label">Date de début d'exploitation :</div><div class="dots">${escapeHtml(fmtDate(eiData.dateDebutExploitation))}</div></div>
    <div class="fieldLine"><div class="label">Date de début autres établissements :</div><div class="dots"></div></div>
    <div class="fieldLine"><div class="label">Nature et lieu d'exercice :</div><div class="dots"></div></div>
    <div class="fieldLine"><div class="label" style="font-size:9px;">Numéro RCCM, nom commercial et adresse établissements secondaires :</div><div class="dots"></div></div>
    <div class="fieldLine"><div class="label">Chiffre d'affaires prévisionnel :</div><div class="dots">${escapeHtml(company.chiffre_affaires_prev || '')}</div></div>
    <div class="fieldLine"><div class="label">Nom commercial :</div><div class="dots">${upper(company.nom_commercial || company.company_name || '')}</div></div>
    <div class="fieldLine"><div class="label">Sigle utilisé :</div><div class="dots">${upper(company.sigle || '')}</div></div>
    <div class="fieldLine"><div class="label">Objet de l'entreprise :</div><div class="dots">${escapeHtml(truncateCepici(company.activity || ''))}</div></div>
  </div>

  <div class="section">
    <div class="sectionTitle">IV- <span class="u">LOCALISATION</span></div>
    <div style="display:grid; grid-template-columns: 140px 1fr 110px 1fr 110px 1fr; gap:4px; margin:3px 0; align-items:end;">
      <div class="label">Adresse du siège social :</div><div class="dots">${upper(company.nom_immeuble || company.nomImmeuble || '')}</div>
      <div class="label">Numéro étage :</div><div class="dots">${escapeHtml(company.numero_etage || company.numeroEtage || '')}</div>
      <div class="label">Numéro porte :</div><div class="dots">${escapeHtml(company.numero_porte || company.numeroPorte || '')}</div>
    </div>
    <div style="display:grid; grid-template-columns: 60px 1fr 100px 1fr 100px 1fr; gap:4px; margin:3px 0; align-items:end;">
      <div class="label">Ville :</div><div class="dots">${upper(company.city || '')}</div>
      <div class="label">Commune :</div><div class="dots">${upper(company.commune || '')}</div>
      <div class="label">Quartier :</div><div class="dots">${upper(company.quartier || '')}</div>
    </div>
    <div style="display:grid; grid-template-columns: 60px 1fr 60px 1fr; gap:4px; margin:3px 0; align-items:end;">
      <div class="label">Lot n° :</div><div class="dots">${escapeHtml(company.lot || '')}</div>
      <div class="label">Ilot :</div><div class="dots">${escapeHtml(company.ilot || '')}</div>
    </div>
    <div style="display:grid; grid-template-columns: 80px 1fr 80px 1fr; gap:4px; margin:3px 0; align-items:end;">
      <div class="label">Section :</div><div class="dots">${escapeHtml(company.section || '')}</div>
      <div class="label">Parcelle :</div><div class="dots">${escapeHtml(company.parcelle || '')}</div>
    </div>
    <div class="fieldLine"><div class="label">TF n° :</div><div class="dots">${escapeHtml(company.tf_numero || company.tfNumero || '')}</div></div>
    <div style="display:grid; grid-template-columns: 120px 1fr 60px 1fr; gap:4px; margin:3px 0; align-items:end;">
      <div class="label">Adresse Postale :</div><div class="dots">${escapeHtml(company.adresse_postale || company.adressePostale || '')}</div>
      <div class="label">Tel :</div><div class="dots">${escapeHtml(company.telephone || '')}</div>
    </div>
  </div>

  <div class="section">
    <div class="sectionTitle">V- IDENTIFICATION DES PERSONNES AYANT LE POUVOIR D'ENGAGER L'ENTREPRISE</div>
    <table class="gridTable">
      <thead>
        <tr>
          <th style="width:140px;"></th>
          <th>1</th><th>2</th><th>3</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="leftHead">Nom</td><td>${upper(proprietaire.nom || '')}</td><td></td><td></td></tr>
        <tr><td class="leftHead">Prénoms</td><td>${upper(proprietaire.prenoms || '')}</td><td></td><td></td></tr>
        <tr><td class="leftHead">Date et lieu de naissance</td><td>${escapeHtml(fmtDate(proprietaire.dateNaissance || proprietaire.date_naissance || ''))} ${escapeHtml(proprietaire.lieuNaissance || proprietaire.lieu_naissance || '')}</td><td></td><td></td></tr>
        <tr><td class="leftHead">Nationalité</td><td>${escapeHtml(proprietaire.nationalite || '')}</td><td></td><td></td></tr>
        <tr><td class="leftHead">Domicile</td><td>${upper(proprietaire.adresse || '')}</td><td></td><td></td></tr>
      </tbody>
    </table>
  </div>

  <div class="signatureArea">
    <div>Fait à Abidjan, le <span class="inlineDots" style="width:60mm;">${dateSignature}</span></div>
    <div class="sigBox">Signature</div>
  </div>

</section>

</body>
</html>`;
};

export default {
  generateCepiciHtml,
  generateCepiciEIHtml
};
