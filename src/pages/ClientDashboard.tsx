import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, Eye, Plus, Building2, FileText, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { getMyCompaniesApi, getMyDocumentsApi, downloadDocumentApi, viewDocumentApi, createCompanyApi, generateDocumentsApi, type UserDocument } from "@/lib/api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, user, token } = useAuth();
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Protection de la route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/connexion", { state: { redirectTo: "/dashboard" }, replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Traitement de la création d'entreprise en attente
  useEffect(() => {
    const processPendingCreation = async () => {
      if (!token) return;
      
      const pendingData = sessionStorage.getItem("pending_company_creation");
      if (pendingData) {
        try {
          const payload = JSON.parse(pendingData);
          toast.info("Finalisation de la création de votre entreprise...");
          
          // 1. Créer l'entreprise
          await createCompanyApi(token, payload);
          
          // 2. Générer les documents si nécessaire
          if (payload.docs && payload.docs.length > 0) {
            await generateDocumentsApi(token, { 
              companyTypeName: payload.companyTypeName, // Assurez-vous que le payload contient ceci ou ajustez
              docs: payload.docs 
            });
          }
          
          toast.success("Entreprise créée avec succès !");
          sessionStorage.removeItem("pending_company_creation");
          
          // Recharger les données
          loadData();
        } catch (error) {
          console.error("Erreur création pending:", error);
          toast.error("Erreur lors de la finalisation de la création.");
        }
      }
    };

    if (token) {
      processPendingCreation();
    }
  }, [token]);

  // Chargement des données
  const loadData = async () => {
    if (!token) return;
    
    setIsLoadingData(true);
    try {
      const [companiesRes, docsRes] = await Promise.all([
        getMyCompaniesApi(token),
        getMyDocumentsApi(token)
      ]);

      if (companiesRes.success && companiesRes.data) {
        setCompanies(companiesRes.data);
      }
      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data);
      }
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      toast.error("Impossible de charger vos données");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePreview = async (doc: UserDocument) => {
    if (!token) return;
    try {
      const blob = await viewDocumentApi(token, doc.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      toast.error("Impossible de prévisualiser le document");
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleDownload = async (doc: UserDocument) => {
    if (!token) return;
    setDownloadingId(doc.id);
    try {
      const blob = await downloadDocumentApi(token, doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || `${doc.doc_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <Layout>
      <section className="bg-primary py-12">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-primary-foreground mb-2">
                Mon Espace
              </h1>
              <p className="text-primary-foreground/80">
                Bienvenue, {user?.firstName ? user.firstName : user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Déconnexion
              </Button>
              <Button variant="gold" asChild>
                <Link to="/creation-entreprise">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle entreprise
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        
        {/* Section Entreprises */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Mes Entreprises</h2>
          </div>
          
          {isLoadingData ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune entreprise</h3>
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore créé d'entreprise.</p>
                <Button variant="outline" asChild>
                  <Link to="/creation-entreprise">Commencer maintenant</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{company.company_name || "Sans nom"}</CardTitle>
                      <StatusBadge status={company.status} />
                    </div>
                    <CardDescription>{company.company_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Créé le {new Date(company.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {company.status === 'draft' && (
                        <div className="flex items-center gap-2 text-amber-600 mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Dossier incomplet</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Section Documents */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Mes Documents</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoadingData ? (
                <div className="p-8 text-center text-muted-foreground">Chargement...</div>
              ) : documents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Aucun document disponible pour le moment.
                </div>
              ) : (
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.doc_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('fr-FR')} • PDF
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Prévisualiser
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id}
                        >
                          {downloadingId === doc.id ? (
                            <span className="animate-spin mr-2">⏳</span>
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </div>
    </Layout>
  );
}
