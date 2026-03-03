# Mock Data Creator - Notes de contexte

## Architecture du projet

- **Frontend** : React/TypeScript (Vite) dans `src/`
- **Backend** : Node.js/Express (ESM) dans `backend/`
- **Templates DOCX** : `backend/templates/` - templates avec placeholders `{xxx}` pour docxtemplater
- **Scripts de génération de templates** : `backend/scripts/create-*-template.js` - utilisent le package `docx` v9.5.1
- **Générateur** : `backend/src/utils/docxGenerator.js` - remplit les templates avec docxtemplater, convertit en PDF via LibreOffice

## Modèles de référence

Les modèles officiels de référence sont dans `models_ecriture/` :
- `models_ecriture/SARL UNIPERSONNELLE/smallpdf-convert-20260209-204614/` - Statuts SARLU (10 images JPG)
- `models_ecriture/SARL UNIPERSONNELLE/DSV/` - DSV SARLU (4 images JPG)
- `models_ecriture/SARL UNIPERSONNELLE/contrat de bai.docx` - Contrat de bail (modèle DOCX original)
- `models_ecriture/SARL PLURIPERSONEL/SARL_PLURI_STATUT/` - Statuts SARL Pluri (17 images JPG)
- `models_ecriture/SARL PLURIPERSONEL/STATUT Friends forage Cote D'ivoire.docx` - Statuts Pluri DOCX original
- `models_ecriture/SARL PLURIPERSONEL/contrat de bail HYDRA FORAGE.docx` - Bail Pluri
- `models_ecriture/SARL PLURIPERSONEL/Liste de gerant hydra forage.docx` - Liste gérants Pluri
- `models_ecriture/SARL PLURIPERSONEL/greffe-declaration-sur-l'honneur hydra forage.docx` - Déclaration honneur Pluri

## Travail TERMINÉ

### 1. Templates SARLU (tous corrigés et fonctionnels)

| Template | Script | Status |
|----------|--------|--------|
| `statuts_sarlu_template.docx` | `scripts/create-statuts-template.js` | FAIT - 8 pages, 26 placeholders, conforme au modèle |
| `contrat_bail_sarlu_template.docx` | `scripts/create-contrat-bail-template.js` | FAIT - 2 pages, police Goudy 11pt, marges du modèle |
| `dsv_sarlu_template.docx` | `scripts/create-dsv-template.js` | FAIT - couverture + 2 pages, tableau 5 colonnes |
| `liste_gerants_sarlu_template.docx` | N/A (existait déjà) | NON TOUCHÉ |
| `declaration_honneur_sarlu_template.docx` | N/A (existait déjà) | NON TOUCHÉ |

### 2. Template SARL Pluri - Statuts (fait)

| Template | Script | Status |
|----------|--------|--------|
| `statuts_sarl_pluri_template.docx` | `scripts/create-statuts-pluri-template.js` | FAIT - 13+ pages, 31 articles, gère N associés |

- Le routage dans `docxGenerator.js` détecte automatiquement SARLU vs Pluri (`associates.length > 1`)
- Les données dynamiques (liste associés, tableaux apports/capital) sont pré-formatées en texte dans `preparePluriData()`
- Article 3 : après `{objet_social}`, le texte standard ("Et généralement...", "En outre...") et les tirets sont alignés sur le modèle de référence
- Article 15 : paragraphes complémentaires sur la rémunération/frais du gérant ajoutés
- Article 27 : les deux variantes ("Droit commun" et "Arbitrage") sont intégrées
- Bloc final signatures : tableau bordé "NOMS DES ASSOCIES / SIGNATURES" ajouté + ligne "Fait à {ville}, le {date_constitution}"

### 3. Corrections appliquées
- Statuts SARLU : "EN QUATRE (2)" corrigé en "EN DEUX (2) EXEMPLAIRES ORIGINAUX"
- Bail : page blanche supprimée, garantie dynamique (était codée en dur "160 000")
- DSV : placeholders cassés dans l'ancien template XML corrigés
- DSV : section "3- OBJET" alignée avec l'Article 3 des statuts - ajout des paragraphes "Et généralement, toutes opérations industrielles..." et "En outre, la Société peut également participer..." après `{objet_social}` et avant les tirets
- Statuts SARL Pluri : alignement avec `STATUT Friends forage Cote D'ivoire.docx` (Article 3/15/27 + tableau signatures)

## Travail RESTANT - SARL Pluri

### Templates à créer (NE PAS TOUCHER au CEPICI) :

1. **Contrat de bail SARL Pluri** (`contrat_bail_sarl_pluri_template.docx`)
   - Modèle de référence : `models_ecriture/SARL PLURIPERSONEL/contrat de bail HYDRA FORAGE.docx`
   - Probablement très similaire au bail SARLU, avec "les associés" au lieu de "l'associé unique"

2. **Liste de gérants SARL Pluri** (`liste_gerants_sarl_pluri_template.docx`)
   - Modèle de référence : `models_ecriture/SARL PLURIPERSONEL/Liste de gerant hydra forage.docx`

3. **Déclaration sur l'honneur SARL Pluri** (`declaration_honneur_sarl_pluri_template.docx`)
   - Modèle de référence : `models_ecriture/SARL PLURIPERSONEL/greffe-declaration-sur-l'honneur hydra forage.docx`

4. **DSV SARL Pluri** (si nécessaire)
   - Pas de modèle de référence trouvé, probablement similaire à la DSV SARLU avec plusieurs associés dans le tableau

### Pour chaque template restant :
1. Lire le modèle de référence DOCX pour extraire le contenu exact
2. Créer `backend/scripts/create-XXX-pluri-template.js`
3. Exécuter le script pour générer le template
4. Ajouter le générateur dans `docxGenerator.js` (fonction + routage)
5. Tester avec données fictives

### Amélioration possible sur le template Statuts Pluri
- Vérifier le rendu visuel final (espacements, sauts de page, interlignes) avec un jeu de données réel avant validation définitive

## NE PAS TOUCHER

- **Formulaire unique CEPICI** (SARLU et Pluri) - reste en Puppeteer
- **Documents SARLU** - déjà corrigés et fonctionnels
- **Formulaire unique CEPICI Pluri** - ne pas toucher

## Types de données (frontend)

Les types pour SARL Pluri sont dans `src/lib/sarl-pluri-types.ts` :
- `SARLPluriFormData` : données du formulaire (société, siège, bailleur, associés[], gérants[])
- `AssocieInfo` : nom, prenoms, profession, adresseDomicile, nationalite, dateNaissance, lieuNaissance, typeIdentite, numeroIdentite, dateDelivranceId, dateValiditeId, lieuDelivranceId, nombreParts, valeurParts, apportNumeraire
- `GerantInfo` : idem + pereNom, mereNom, dureeMandat, dureeMandatAnnees

## Commandes utiles

```bash
# Regénérer un template
node backend/scripts/create-statuts-template.js
node backend/scripts/create-contrat-bail-template.js
node backend/scripts/create-dsv-template.js
node backend/scripts/create-statuts-pluri-template.js

# Redémarrer le backend
kill -9 $(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')
# Le backend redémarre automatiquement

# Vérifier les placeholders dans un template
python3 -c "
import zipfile, re
with zipfile.ZipFile('backend/templates/NOM_TEMPLATE.docx', 'r') as z:
    xml = z.read('word/document.xml').decode('utf-8')
    placeholders = re.findall(r'\{[a-z_]+\}', xml)
    print(sorted(set(placeholders)))
"
```
