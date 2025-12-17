import { useState, useEffect } from "react";
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
import { createCompanyApi, generateDocumentsApi } from "@/lib/api";
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

  const { formData, companyType, payload, price, docs, companyTypeName } = location.state || {};

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
      await createCompanyApi(token!, payload);
      await generateDocumentsApi(token!, { companyTypeName, docs });
      
      toast.success("Documents validés et entreprise créée avec succès !");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création de l'entreprise");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
                <Button variant="outline" onClick={handlePrint} className="hidden md:flex">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              </div>
            </div>
          </div>
        </div>

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
                            Valider et générer les PDF
                          </>
                        )}
                      </Button>
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
