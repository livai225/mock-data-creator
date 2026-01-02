import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  Eye,
  Printer
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import { createCompanyApi, generateDocumentsApi, getMyDocumentsApi, viewDocumentApi, previewDocumentsApi, type UserDocument } from "@/lib/api";
import { SARLUFormData } from "@/lib/sarlu-types";
import { SARLPluriFormData } from "@/lib/sarl-pluri-types";
import { Layout } from "@/components/layout/Layout";

// Preview components
import { DocumentPreviewStatuts } from "@/components/documents/DocumentPreviewStatuts";
import { DocumentPreviewContratBail } from "@/components/documents/DocumentPreviewContratBail";
import { DocumentPreviewCEPICI } from "@/components/documents/DocumentPreviewCEPICI";
import { DocumentPreviewListeGerants } from "@/components/documents/DocumentPreviewListeGerants";
import { DocumentPreviewDeclaration } from "@/components/documents/DocumentPreviewDeclaration";
import { DocumentPreviewDSV } from "@/components/documents/DocumentPreviewDSV";

interface DocumentTab {
  id: string;
  label: string;
  shortLabel: string;
  component: React.ComponentType<{ formData: SARLUFormData | SARLPluriFormData; companyType: 'SARLU' | 'SARL_PLURI' }>;
}

const documentTabs: DocumentTab[] = [
  { id: 'statuts', label: 'Statuts de la société', shortLabel: 'Statuts', component: DocumentPreviewStatuts },
  { id: 'bail', label: 'Contrat de bail', shortLabel: 'Bail', component: DocumentPreviewContratBail },
  { id: 'cepici', label: 'Formulaire CEPICI', shortLabel: 'CEPICI', component: DocumentPreviewCEPICI },
  { id: 'gerants', label: 'Liste des gérants', shortLabel: 'Gérants', component: DocumentPreviewListeGerants },
  { id: 'declaration', label: 'Déclaration sur l\'honneur', shortLabel: 'Déclaration', component: DocumentPreviewDeclaration },
  { id: 'dsv', label: 'Déclaration Souscription/Versement', shortLabel: 'DSV', component: DocumentPreviewDSV },
];

export default function PreviewDocuments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState('statuts');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatedDocs, setValidatedDocs] = useState<string[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<UserDocument[]>([]);
  const [documentsGenerated, setDocumentsGenerated] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [documentUrls, setDocumentUrls] = useState<Record<number, string>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({}); // URLs blob pour prévisualisation
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const { formData, companyType, payload, price, docs, companyTypeName } = location.state || {};

  // Protections renforcées contre la copie et l'enregistrement
  useEffect(() => {
    // Désactiver le clic droit
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toast.error("L'utilisation du clic droit est désactivée sur cette page");
      return false;
    };

    // Désactiver les raccourcis clavier (Ctrl+C, Ctrl+S, Ctrl+A, Ctrl+P, F12, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+PrintScreen
      if (e.ctrlKey && ['c', 'v', 'a', 's', 'p', 'u', 'printscreen'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toast.error("Cette action n'est pas autorisée");
        return false;
      }
      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 'k'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      // Print Screen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      // Ctrl+Shift+P (Print dialog)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toast.error("L'impression est désactivée sur cette page");
        return false;
      }
    };

    // Désactiver la sélection de texte (mais permettre dans les iframes)
    const handleSelectStart = (e: Event) => {
      // Permettre la sélection dans les iframes
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' || target.closest('iframe')) {
        return true;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Désactiver le drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Désactiver la copie via l'événement copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.clipboardData?.setData('text/plain', '');
      toast.error("La copie est désactivée sur cette page");
      return false;
    };

    // Désactiver le couper
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.clipboardData?.setData('text/plain', '');
      return false;
    };

    // Désactiver le coller
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Empêcher l'impression
    const handleBeforePrint = (e: BeforePrintEvent) => {
      e.preventDefault();
      toast.error("L'impression est désactivée sur cette page");
      return false;
    };

    // Empêcher l'impression après
    const handleAfterPrint = () => {
      toast.error("L'impression est désactivée sur cette page");
    };

    // Désactiver window.print
    const originalPrint = window.print;
    window.print = () => {
      toast.error("L'impression est désactivée sur cette page");
      return;
    };

    // Empêcher l'accès aux DevTools via plusieurs méthodes
    let devtools = { open: false };
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        if (!devtools.open) {
          devtools.open = true;
          toast.error("Les outils de développement sont désactivés");
          // Optionnel: rediriger ou fermer la page
          // window.location.href = '/';
        }
      } else {
        devtools.open = false;
      }
    };
    const devToolsInterval = setInterval(detectDevTools, 500);

    // Ajouter les event listeners avec capture pour intercepter tôt
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('paste', handlePaste, true);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    // Nettoyer les event listeners au démontage
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      clearInterval(devToolsInterval);
      window.print = originalPrint;
    };
  }, []);

  // Ajouter des styles CSS pour désactiver la sélection (mais permettre l'affichage des iframes)
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'preview-protection-styles';
    style.textContent = `
      /* Désactiver la sélection sur la page principale, mais pas dans les iframes */
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      /* Permettre l'interaction avec les iframes pour l'affichage */
      iframe {
        pointer-events: auto !important;
        -webkit-user-select: text;
        -moz-user-select: text;
        user-select: text;
      }
      .preview-container {
        position: relative;
      }
      /* Désactiver l'impression via CSS */
      @media print {
        body::before {
          content: "L'impression de cette page est désactivée pour protéger le contenu.";
          display: block !important;
          visibility: visible !important;
          padding: 20px;
          font-size: 16px;
          text-align: center;
        }
        .preview-container,
        iframe {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('preview-protection-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  useEffect(() => {
    if (!formData || !companyType) {
      toast.error("Données manquantes. Veuillez recommencer le formulaire.");
      navigate("/creation-entreprise");
    }
  }, [formData, companyType, navigate]);

  if (!formData || !companyType) {
    return null;
  }

  const handleValidateDocument = (docId: string) => {
    if (!validatedDocs.includes(docId)) {
      setValidatedDocs([...validatedDocs, docId]);
      toast.success(`Document "${documentTabs.find(d => d.id === docId)?.label}" validé`);
    }
  };

  // Charger les documents générés et créer les URLs blob
  useEffect(() => {
    const loadGeneratedDocuments = async () => {
      if (!token || !companyId || !documentsGenerated) return;
      
      console.log(`🔄 Chargement des documents pour entreprise ${companyId}...`);
      try {
        const docsRes = await getMyDocumentsApi(token);
        if (docsRes.success && docsRes.data) {
          // Filtrer les documents de cette entreprise et seulement les PDF
          const companyDocs = docsRes.data.filter(
            (doc: UserDocument) => doc.company_id === companyId && doc.mime_type === 'application/pdf'
          );
          console.log(`📄 ${companyDocs.length} documents PDF trouvés:`, companyDocs.map(d => d.doc_name));
          setGeneratedDocuments(companyDocs);

          // Créer les URLs blob pour chaque document
          const urls: Record<number, string> = {};
          for (const doc of companyDocs) {
            try {
              const blob = await viewDocumentApi(token, doc.id);
              const url = URL.createObjectURL(blob);
              urls[doc.id] = url;
              console.log(`✅ URL blob créée pour: ${doc.doc_name} (ID: ${doc.id})`);
            } catch (error) {
              console.error(`❌ Erreur chargement document ${doc.id} (${doc.doc_name}):`, error);
            }
          }
          setDocumentUrls(urls);
          console.log(`📋 Total URLs blob: ${Object.keys(urls).length}`);
        } else {
          console.error('❌ Erreur réponse API:', docsRes);
        }
      } catch (error) {
        console.error("❌ Erreur chargement documents:", error);
      }
    };

    loadGeneratedDocuments();
  }, [token, companyId, documentsGenerated]);

  // Générer les documents en mode prévisualisation au chargement de la page
  useEffect(() => {
    const generatePreview = async () => {
      if (!formData || !payload || !docs || isLoadingPreview) return;
      
      setIsLoadingPreview(true);
      try {
        console.log('🔄 Génération de la prévisualisation des documents...');
        
        // Convertir le payload en objet company pour l'API
        const company = {
          company_name: payload.companyName || formData.denominationSociale,
          capital: payload.capital || (formData.capitalSocial || 0),
          address: payload.address || formData.adresseSiege,
          city: payload.city || formData.ville,
          activity: payload.activity || formData.objetSocial,
          gerant: payload.gerant || (formData.associeNom ? `${formData.associeNom} ${formData.associePrenoms}` : ''),
          duree_societe: formData.dureeAnnees || 99,
          chiffre_affaires_prev: payload.chiffreAffairesPrev || formData.chiffreAffairesPrev || null,
          company_type: payload.companyType || companyType
        };

        // Préparer les associés
        const associates = payload.associates || [];
        
        // Préparer les managers
        const managers = payload.managers || [];
        
        // Préparer les données additionnelles (bailleur, etc.)
        const additionalData: any = {};
        if (formData.bailleurNom) {
          additionalData.bailleur_nom = `${formData.bailleurNom} ${formData.bailleurPrenom || ''}`.trim();
          additionalData.bailleur_telephone = formData.bailleurContact || '';
          additionalData.loyer_mensuel = formData.loyerMensuel || 0;
          additionalData.caution_mois = formData.cautionMois || 2;
          additionalData.avance_mois = formData.avanceMois || 2;
          additionalData.duree_bail = formData.dureeBailAnnees || 1;
          additionalData.date_debut = formData.dateDebutBail || new Date().toISOString();
          additionalData.date_fin = formData.dateFinBail || null;
        }

        // Appeler l'API de prévisualisation (sans token car route publique)
        console.log('📤 Appel API /api/documents/preview avec:', {
          company: company.company_name,
          docsCount: docs.length,
          docs: docs,
          hasAdditionalData: !!additionalData.bailleur_nom,
          managersCount: managers.length,
          managers: managers.map(m => ({ nom: m.nom, prenoms: m.prenoms, profession: m.profession }))
        });
        
        const previewRes = await previewDocumentsApi('', {
          company,
          associates,
          managers,
          docs,
          formats: ['pdf'],
          additionalData
        });

        console.log('📥 Réponse API prévisualisation:', {
          success: previewRes.success,
          dataLength: previewRes.data?.length || 0,
          message: previewRes.message
        });

        if (previewRes.success && previewRes.data) {
          console.log(`✅ ${previewRes.data.length} documents générés pour prévisualisation`);
          console.log('📄 Noms des documents:', previewRes.data.map(d => d.docName));
          
          // Convertir les données base64 en URLs blob
          const urls: Record<string, string> = {};
          for (const preview of previewRes.data) {
            if (preview.error) {
              console.error(`❌ Erreur pour ${preview.docName}:`, preview.error);
              continue;
            }
            
            if (preview.pdf && preview.pdf.data) {
              try {
                // Convertir base64 en blob
                const byteCharacters = atob(preview.pdf.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: preview.pdf.mimeType });
                const url = URL.createObjectURL(blob);
                
                // Trouver l'ID de l'onglet correspondant
                const docName = preview.docName.toLowerCase();
                let tabId = '';
                if (docName.includes('statuts')) tabId = 'statuts';
                else if (docName.includes('bail')) tabId = 'bail';
                else if (docName.includes('cepici')) tabId = 'cepici';
                else if (docName.includes('gérant') || docName.includes('gerant') || docName.includes('dirigeant')) tabId = 'gerants';
                else if (docName.includes('déclaration') && docName.includes('honneur')) tabId = 'declaration';
                else if (docName.includes('dsv') || (docName.includes('souscription') && docName.includes('versement'))) tabId = 'dsv';
                
                if (tabId) {
                  urls[tabId] = url;
                  console.log(`✅ URL blob créée pour prévisualisation: ${tabId} (${preview.docName})`);
                } else {
                  console.warn(`⚠️ Aucun tabId trouvé pour: ${preview.docName}`);
                }
              } catch (error) {
                console.error(`❌ Erreur conversion base64 pour ${preview.docName}:`, error);
              }
            } else {
              console.warn(`⚠️ Pas de PDF pour ${preview.docName}`);
            }
          }
          
          setPreviewUrls(urls);
          console.log(`📋 ${Object.keys(urls).length} URLs blob créées pour prévisualisation:`, Object.keys(urls));
          
          if (Object.keys(urls).length === 0) {
            console.error('❌ Aucune URL blob créée ! Vérifiez les logs ci-dessus.');
          }
        } else {
          console.error('❌ Erreur prévisualisation:', previewRes);
          toast.error('Erreur lors de la génération de la prévisualisation. Vérifiez la console pour plus de détails.');
        }
      } catch (error) {
        console.error("❌ Erreur génération prévisualisation:", error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    generatePreview();
  }, [formData, payload, docs, token, companyType]);

  // Cleanup: revoquer les URLs blob quand le composant se démonte
  useEffect(() => {
    return () => {
      Object.values(documentUrls).forEach(url => URL.revokeObjectURL(url));
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [documentUrls, previewUrls]);

  const handleValidateAll = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("pending_company_creation", JSON.stringify(payload));
      sessionStorage.setItem("pending_preview_state", JSON.stringify(location.state));
      toast.info("Veuillez créer un compte pour récupérer vos documents");
      navigate("/inscription", { state: { redirectTo: "/preview-documents" } });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Créer l'entreprise (sans paiement requis)
      const companyResult = await createCompanyApi(token!, payload);
      
      // 2. Récupérer l'ID de l'entreprise créée
      const newCompanyId = companyResult.data?.id;
      
      if (!newCompanyId) {
        throw new Error("Impossible de récupérer l'ID de l'entreprise créée");
      }

      setCompanyId(newCompanyId);

      // 3. Générer les documents avec l'ID de l'entreprise (PDF et Word)
      // Les documents sont générés mais le paiement sera requis pour télécharger
      await generateDocumentsApi(token!, { 
        companyId: newCompanyId,
        docs,
        formats: ['pdf', 'docx'] // Générer les deux formats
      });
      
      setDocumentsGenerated(true);
      toast.success("Documents générés avec succès ! Vous pourrez les télécharger après paiement sur le tableau de bord.");
      
      // Attendre un peu pour que les documents soient bien sauvegardés
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recharger les documents générés avec cache-busting
      const docsRes = await getMyDocumentsApi(token!);
      if (docsRes.success && docsRes.data) {
        const companyDocs = docsRes.data.filter(
          (doc: UserDocument) => doc.company_id === newCompanyId && doc.mime_type === 'application/pdf'
        );
        console.log(`📄 ${companyDocs.length} documents PDF trouvés pour l'entreprise ${newCompanyId}:`, companyDocs.map(d => d.doc_name));
        setGeneratedDocuments(companyDocs);
        
        // Créer les URLs blob pour chaque document
        const urls: Record<number, string> = {};
        for (const doc of companyDocs) {
          try {
            const blob = await viewDocumentApi(token!, doc.id);
            const url = URL.createObjectURL(blob);
            urls[doc.id] = url;
            console.log(`✅ URL blob créée pour document: ${doc.doc_name} (ID: ${doc.id})`);
          } catch (error) {
            console.error(`❌ Erreur chargement document ${doc.id} (${doc.doc_name}):`, error);
          }
        }
        setDocumentUrls(urls);
        console.log(`📋 URLs blob créées:`, Object.keys(urls).length);
      } else {
        console.error('❌ Erreur lors du chargement des documents:', docsRes);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création de l'entreprise");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    toast.info("L'impression est désactivée. Les documents seront disponibles après validation et génération.");
  };

  const allDocsValidated = validatedDocs.length === documentTabs.length;
  const currentTabIndex = documentTabs.findIndex(t => t.id === activeTab);

  return (
    <Layout>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-background border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au formulaire
                </Button>
                <h1 className="text-2xl font-bold">Vérification de vos documents</h1>
                <p className="text-muted-foreground">
                  Vérifiez chaque document avant de valider. Les données en surbrillance jaune sont celles que vous avez saisies.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm py-1 px-3">
                  <Eye className="h-4 w-4 mr-1" />
                  {validatedDocs.length}/{documentTabs.length} vérifiés
                </Badge>
                <Button 
                  variant="outline" 
                  onClick={handlePrint} 
                  className="hidden md:flex"
                  disabled
                  title="L'impression est désactivée sur cette page"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Type de société - Indicateur permanent */}
        {companyTypeName && price !== undefined && (
          <div className="border-b bg-white">
            <div className="container mx-auto px-4 py-3">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-blue-600 font-semibold">
                      Type de société
                    </span>
                    <p className="text-lg font-bold text-blue-900 mt-1">
                      {companyTypeName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-blue-600 font-semibold">Prix</span>
                    <p className="text-lg font-bold text-blue-900 mt-1">
                      {price.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar - Liste des documents */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents à vérifier
                  </CardTitle>
                  <CardDescription>
                    Cliquez sur chaque document pour le visualiser
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 p-2">
                    {documentTabs.map((doc, index) => {
                      const isValidated = validatedDocs.includes(doc.id);
                      const isActive = activeTab === doc.id;
                      
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setActiveTab(doc.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isValidated 
                              ? 'bg-green-500 text-white' 
                              : isActive 
                                ? 'bg-primary-foreground text-primary' 
                                : 'bg-muted-foreground/20'
                          }`}>
                            {isValidated ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium truncate">
                            {doc.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="mt-4">
                <CardContent className="p-4 space-y-3">
                  <Button 
                    onClick={() => handleValidateDocument(activeTab)}
                    disabled={validatedDocs.includes(activeTab)}
                    className="w-full"
                    variant={validatedDocs.includes(activeTab) ? "outline" : "default"}
                  >
                    {validatedDocs.includes(activeTab) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Document validé
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Valider ce document
                      </>
                    )}
                  </Button>
                  
                  {currentTabIndex < documentTabs.length - 1 && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleValidateDocument(activeTab);
                        setActiveTab(documentTabs[currentTabIndex + 1].id);
                      }}
                      className="w-full"
                    >
                      Valider et suivant →
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main content - Preview */}
            <div className="space-y-4">
              {/* Warning banner */}
              <div className="space-y-3">
                {!allDocsValidated && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Vérifiez attentivement vos informations</p>
                      <p className="text-sm text-amber-700">
                        Les données en <span className="bg-yellow-200 px-1">surbrillance jaune</span> sont les informations que vous avez saisies. 
                        Assurez-vous qu'elles sont correctes avant de valider.
                      </p>
                    </div>
                  </div>
                )}
                {/* Protection notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    <strong>Protection activée :</strong> La copie et l'enregistrement sont désactivés sur cette page. 
                    Les documents seront disponibles après validation et génération.
                  </p>
                </div>
              </div>

              {/* Document Preview */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{documentTabs.find(t => t.id === activeTab)?.label}</CardTitle>
                      <CardDescription>
                        Document {currentTabIndex + 1} sur {documentTabs.length}
                      </CardDescription>
                    </div>
                    {validatedDocs.includes(activeTab) && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Validé
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[70vh]">
                    <div ref={previewContainerRef} className="preview-container h-full">
                      {isLoadingPreview ? (
                        // Afficher un loader pendant la génération de la prévisualisation
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground mb-2">
                            Génération de la prévisualisation...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Veuillez patienter, les documents sont en cours de génération avec les derniers templates.
                          </p>
                        </div>
                      ) : documentsGenerated ? (
                        // Afficher les documents PDF générés (après validation)
                        <div className="h-full">
                          {(() => {
                            // Trouver le document PDF correspondant à l'onglet actif
                            const generatedDoc = generatedDocuments.find((gDoc) => {
                              const docName = gDoc.doc_name.toLowerCase();
                              // Patterns de correspondance plus flexibles
                              if (activeTab === 'statuts') {
                                return docName.includes('statuts') || docName.includes('statut');
                              }
                              if (activeTab === 'bail') {
                                return docName.includes('bail') || docName.includes('location') || docName.includes('contrat de bail');
                              }
                              if (activeTab === 'cepici') {
                                return docName.includes('cepici') || docName.includes('formulaire unique') || docName.includes('formulaire cepici');
                              }
                              if (activeTab === 'gerants') {
                                return docName.includes('gérant') || docName.includes('gerant') || docName.includes('dirigeant') || 
                                       docName.includes('liste des') || docName.includes('liste de');
                              }
                              if (activeTab === 'declaration') {
                                return (docName.includes('déclaration') || docName.includes('declaration')) && 
                                       (docName.includes('honneur') || docName.includes('greffe'));
                              }
                              if (activeTab === 'dsv') {
                                return docName.includes('dsv') || 
                                       (docName.includes('souscription') && docName.includes('versement')) ||
                                       docName.includes('déclaration de souscription');
                              }
                              return false;
                            });
                            
                            console.log(`🔍 Recherche document pour onglet "${activeTab}":`, {
                              documentsDisponibles: generatedDocuments.map(d => d.doc_name),
                              documentTrouve: generatedDoc ? generatedDoc.doc_name : 'Aucun'
                            });

                            if (generatedDoc && documentUrls[generatedDoc.id]) {
                              // Afficher le PDF généré dans un iframe avec protections modérées
                              return (
                                <div key={activeTab} className="h-full w-full relative">
                                  <iframe
                                    src={documentUrls[generatedDoc.id]}
                                    className="w-full h-[70vh] border-0"
                                    title={documentTabs.find(t => t.id === activeTab)?.label}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      toast.error("Le clic droit est désactivé");
                                      return false;
                                    }}
                                    onLoad={(e) => {
                                      // Essayer de désactiver le menu contextuel dans l'iframe si possible
                                      try {
                                        const iframe = e.target as HTMLIFrameElement;
                                        if (iframe.contentDocument) {
                                          iframe.contentDocument.addEventListener('contextmenu', (ev) => {
                                            ev.preventDefault();
                                            return false;
                                          }, true);
                                          iframe.contentDocument.addEventListener('copy', (ev) => {
                                            ev.preventDefault();
                                            return false;
                                          }, true);
                                        }
                                      } catch (err) {
                                        // Ignorer les erreurs CORS (normal pour les PDF blob)
                                        console.log('Iframe PDF chargé (protections CORS normales)');
                                      }
                                    }}
                                  />
                                </div>
                              );
                            } else if (generatedDocuments.length > 0) {
                              // Documents chargés mais pas trouvé pour cet onglet - afficher un message
                              return (
                                <div className="p-8 text-center">
                                  <p className="text-muted-foreground mb-2">
                                    Document en cours de chargement...
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Documents trouvés: {generatedDocuments.length}
                                    {generatedDoc ? ` (${generatedDoc.doc_name})` : ''}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Onglet actif: {activeTab}
                                  </p>
                                </div>
                              );
                            } else {
                              // Aucun document chargé - fallback sur composant React
                              const DocComponent = documentTabs.find(t => t.id === activeTab)?.component;
                              if (DocComponent) {
                                return (
                                  <div className="p-6 bg-gray-100">
                                    <DocComponent formData={formData} companyType={companyType} />
                                  </div>
                                );
                              }
                              return null;
                            }
                          })()}
                        </div>
                      ) : previewUrls[activeTab] ? (
                        // Afficher la prévisualisation générée depuis le backend avec protections modérées
                        <div className="h-full w-full relative">
                          <iframe
                            src={previewUrls[activeTab]}
                            className="w-full h-[70vh] border-0"
                            title={documentTabs.find(t => t.id === activeTab)?.label}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              toast.error("Le clic droit est désactivé");
                              return false;
                            }}
                            onLoad={(e) => {
                              // Essayer de désactiver le menu contextuel dans l'iframe si possible
                              try {
                                const iframe = e.target as HTMLIFrameElement;
                                if (iframe.contentDocument) {
                                  iframe.contentDocument.addEventListener('contextmenu', (ev) => {
                                    ev.preventDefault();
                                    return false;
                                  }, true);
                                  iframe.contentDocument.addEventListener('copy', (ev) => {
                                    ev.preventDefault();
                                    return false;
                                  }, true);
                                  // Désactiver window.print dans l'iframe si possible
                                  if (iframe.contentWindow) {
                                    const originalPrint = iframe.contentWindow.print;
                                    iframe.contentWindow.print = () => {
                                      toast.error("L'impression est désactivée");
                                      return;
                                    };
                                  }
                                }
                              } catch (err) {
                                // Ignorer les erreurs CORS (normal pour les PDF blob)
                                console.log('Iframe PDF chargé (protections CORS normales)');
                              }
                            }}
                          />
                        </div>
                      ) : (
                        // Fallback: Afficher les composants React statiques (anciens)
                        <div className="p-6 bg-gray-100">
                          {documentTabs.map((doc) => {
                            const DocComponent = doc.component;
                            return (
                              <div
                                key={doc.id}
                                className={activeTab === doc.id ? 'block' : 'hidden'}
                              >
                                <DocComponent formData={formData} companyType={companyType} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Bottom actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <p className="font-medium">
                        {allDocsValidated ? (
                          <span className="text-green-600 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Tous les documents ont été vérifiés
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {documentTabs.length - validatedDocs.length} document(s) restant(s) à vérifier
                          </span>
                        )}
                      </p>
                      {price && (
                        <p className="text-sm text-muted-foreground">
                          Montant total : <span className="font-bold text-primary">{price.toLocaleString('fr-FR')} FCFA</span>
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(-1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      {documentsGenerated ? (
                        <Button 
                          variant="gold"
                          onClick={() => navigate("/dashboard")}
                          className="min-w-[200px]"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Voir le tableau de bord
                        </Button>
                      ) : (
                        <Button 
                          variant="gold"
                          onClick={handleValidateAll}
                          disabled={isSubmitting}
                          className="min-w-[200px]"
                        >
                          {isSubmitting ? (
                            "Génération en cours..."
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Valider et générer les documents
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
