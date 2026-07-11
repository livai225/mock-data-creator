import sharp from 'sharp';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const W = 1200;
const H = 630;

// Lire le logo et le convertir en base64 pour l'embed dans le SVG
const logoPath = path.join(__dirname, '../src/assets/logo.png');
const logoBase64 = readFileSync(logoPath).toString('base64');

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f2557;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a3a8f;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#c0441f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e05a2b;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Fond dégradé bleu -->
  <rect width="${W}" height="${H}" fill="url(#bg)" />

  <!-- Bande orange décorative gauche -->
  <rect x="0" y="0" width="8" height="${H}" fill="url(#accent)" />

  <!-- Bande orange bas -->
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="url(#accent)" />

  <!-- Cercle décoratif fond haut-droit -->
  <circle cx="${W - 80}" cy="80" r="180" fill="white" fill-opacity="0.04" />
  <circle cx="${W - 80}" cy="80" r="130" fill="white" fill-opacity="0.04" />

  <!-- Cercle décoratif bas-gauche -->
  <circle cx="80" cy="${H - 80}" r="120" fill="white" fill-opacity="0.04" />

  <!-- Logo (zone blanche arrondie) -->
  <rect x="80" y="100" width="200" height="200" rx="16" fill="white" fill-opacity="0.95" />
  <image href="data:image/png;base64,${logoBase64}" x="90" y="110" width="180" height="180" preserveAspectRatio="xMidYMid meet" />

  <!-- Trait séparateur vertical -->
  <rect x="320" y="120" width="2" height="160" fill="white" fill-opacity="0.25" />

  <!-- Nom de la société -->
  <text x="356" y="185" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="bold" fill="white" letter-spacing="2">ARCH</text>
  <text x="356" y="252" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="bold" fill="#e05a2b" letter-spacing="2">EXCELLENCE</text>

  <!-- Slogan -->
  <text x="80" y="375" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="white" fill-opacity="0.9">Création d'entreprise en Côte d'Ivoire</text>

  <!-- Ligne décorative sous le slogan -->
  <rect x="80" y="395" width="120" height="3" fill="#e05a2b" />

  <!-- Description -->
  <text x="80" y="445" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="white" fill-opacity="0.75">SARLU · SARL · Entreprise Individuelle</text>
  <text x="80" y="478" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="white" fill-opacity="0.75">Documents officiels générés rapidement</text>

  <!-- URL -->
  <text x="80" y="560" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="white" fill-opacity="0.55">archexcellence.ci</text>
</svg>
`;

const outputPath = path.join(__dirname, '../public/og-image.jpg');

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(outputPath);

console.log(`✅ og-image.jpg généré : ${outputPath}`);
