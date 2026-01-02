# Script de vérification locale (avant déploiement)
# PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 VÉRIFICATION LOCALE - Avant Déploiement" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Fonction de vérification
function Test-FileExists {
    param($path, $description)
    if (Test-Path $path) {
        Write-Host "✅ $description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $description - MANQUANT" -ForegroundColor Red
        $script:errors++
        return $false
    }
}

Write-Host "📁 1. Vérification des fichiers Backend" -ForegroundColor Yellow
Write-Host "------------------------------------------------"
Test-FileExists "backend/src/middleware/upload.js" "Middleware upload"
Test-FileExists "backend/src/models/Payment.js" "Modèle Payment"
Test-FileExists "backend/src/controllers/payment.controller.js" "Contrôleur Payment"
Test-FileExists "backend/src/routes/payment.routes.js" "Routes Payment"
Test-FileExists "backend/sql/005_add_manual_payment_fields.sql" "Migration SQL 005"
Write-Host ""

Write-Host "📁 2. Vérification des fichiers Frontend" -ForegroundColor Yellow
Write-Host "------------------------------------------------"
Test-FileExists "src/pages/AdminPayments.tsx" "Page Admin Paiements"
Test-FileExists "src/components/payment/ManualPaymentModal.tsx" "Modal Paiement Manuel"
Test-FileExists "src/App.tsx" "App.tsx (routes)"
Test-FileExists "src/admin/AdminLayout.tsx" "AdminLayout (menu)"
Test-FileExists "src/lib/api.ts" "Fonctions API"
Write-Host ""

Write-Host "📁 3. Vérification des fichiers Documentation" -ForegroundColor Yellow
Write-Host "------------------------------------------------"
Test-FileExists "SYSTEME_PAIEMENT_MANUEL_COMPLET.md" "Documentation complète"
Test-FileExists "DEPLOIEMENT_RAPIDE.md" "Guide déploiement"
Test-FileExists "RECAPITULATIF_IMPLEMENTATION.md" "Récapitulatif"
Test-FileExists "deploy-payment-system.sh" "Script déploiement"
Write-Host ""

Write-Host "🔍 4. Vérification du contenu des fichiers clés" -ForegroundColor Yellow
Write-Host "------------------------------------------------"

# Vérifier submitManualPayment dans le contrôleur
if (Select-String -Path "backend/src/controllers/payment.controller.js" -Pattern "submitManualPayment" -Quiet) {
    Write-Host "✅ submitManualPayment trouvé dans payment.controller.js" -ForegroundColor Green
} else {
    Write-Host "❌ submitManualPayment MANQUANT dans payment.controller.js" -ForegroundColor Red
    $errors++
}

# Vérifier getPendingPayments dans le modèle
if (Select-String -Path "backend/src/models/Payment.js" -Pattern "getPendingPayments" -Quiet) {
    Write-Host "✅ getPendingPayments trouvé dans Payment.js" -ForegroundColor Green
} else {
    Write-Host "❌ getPendingPayments MANQUANT dans Payment.js" -ForegroundColor Red
    $errors++
}

# Vérifier la route admin paiements
if (Select-String -Path "src/App.tsx" -Pattern "AdminPayments" -Quiet) {
    Write-Host "✅ Route AdminPayments trouvée dans App.tsx" -ForegroundColor Green
} else {
    Write-Host "❌ Route AdminPayments MANQUANTE dans App.tsx" -ForegroundColor Red
    $errors++
}

# Vérifier le lien menu admin
if (Select-String -Path "src/admin/AdminLayout.tsx" -Pattern "paiements" -Quiet) {
    Write-Host "✅ Lien paiements trouvé dans AdminLayout" -ForegroundColor Green
} else {
    Write-Host "❌ Lien paiements MANQUANT dans AdminLayout" -ForegroundColor Red
    $errors++
}

# Vérifier submitManualPaymentApi
if (Select-String -Path "src/lib/api.ts" -Pattern "submitManualPaymentApi" -Quiet) {
    Write-Host "✅ submitManualPaymentApi trouvée dans api.ts" -ForegroundColor Green
} else {
    Write-Host "❌ submitManualPaymentApi MANQUANTE dans api.ts" -ForegroundColor Red
    $errors++
}

Write-Host ""

Write-Host "📊 5. Vérification Git" -ForegroundColor Yellow
Write-Host "------------------------------------------------"
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Modifications non commitées:" -ForegroundColor Yellow
    $gitStatus | ForEach-Object { Write-Host "   $_" }
    $warnings++
} else {
    Write-Host "✅ Aucune modification en attente" -ForegroundColor Green
}

$lastCommit = git log -1 --oneline
Write-Host "Dernier commit: $lastCommit" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 6. Vérification des dépendances" -ForegroundColor Yellow
Write-Host "------------------------------------------------"
if (Test-Path "backend/package.json") {
    $packageJson = Get-Content "backend/package.json" | ConvertFrom-Json
    if ($packageJson.dependencies.multer) {
        Write-Host "✅ multer présent dans package.json" -ForegroundColor Green
    } else {
        Write-Host "❌ multer MANQUANT dans package.json" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ TOUT EST OK ! Prêt pour le déploiement" -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "⚠️  $warnings avertissement(s) - Vérifier avant déploiement" -ForegroundColor Yellow
} else {
    Write-Host "❌ $errors erreur(s) détectée(s) - CORRIGER avant déploiement" -ForegroundColor Red
}

Write-Host "`n🚀 Prochaine étape: Déploiement sur le serveur" -ForegroundColor Cyan
Write-Host "   Option 1: ./deploy-payment-system.sh" -ForegroundColor White
Write-Host "   Option 2: Suivre DEPLOIEMENT_RAPIDE.md" -ForegroundColor White
Write-Host ""
