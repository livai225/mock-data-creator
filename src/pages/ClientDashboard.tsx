import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, Eye, Plus, Building2, FileText, Clock, AlertCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { getMyCompaniesApi, getMyDocumentsApi, downloadDocumentApi, viewDocumentApi, createCompanyApi, generateDocumentsApi, deleteCompanyApi, type UserDocument } from "@/lib/api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, user, token } = useAuth();
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          const companyResult = await createCompanyApi(token, payload);
          
          // 2. Récupérer l'ID de l'entreprise créée
          const companyId = companyResult.data?.id;
          
          // 3. Générer les documents si nécessaire avec l'ID de l'entreprise
          if (companyId && payload.docs && payload.docs.length > 0) {
            await generateDocumentsApi(token, { 
              companyId,
              docs: payload.docs,
              formats: ['pdf', 'docx'] // Générer les deux formats
            });
            toast.success("Documents générés avec succès !");
          }
          
          toast.success("Entreprise créée avec succès !");
          sessionStorage.removeItem("pending_company_creation");
          
          // Attendre un peu pour que les documents soient bien sauvegardés
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
      // Ajouter un timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      const [companiesRes, docsRes] = await Promise.all([
        getMyCompaniesApi(token),
        getMyDocumentsApi(token)
      ]);

      if (companiesRes.success && companiesRes.data) {
        setCompanies(companiesRes.data);
      }
      if (docsRes.success && docsRes.data) {
        // Filtrer les documents valides (qui ont un company_id existant)
        const validDocuments = docsRes.data.filter((doc: UserDocument) => {
          // Si le document a un company_id, vérifier que l'entreprise existe
          if (doc.company_id) {
            return companiesRes.data?.some((c: any) => c.id === doc.company_id);
          }
          // Les documents sans company_id sont aussi valides (documents manuels)
          return true;
        });
        setDocuments(validDocuments);
        console.log(`📄 ${validDocuments.length} documents chargés pour ${companiesRes.data?.length || 0} entreprises`);
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

  const handleDeleteClick = (companyId: number) => {
    setDeletingCompanyId(companyId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !deletingCompanyId) return;
    
    try {
      await deleteCompanyApi(token, deletingCompanyId);
      toast.success("Entreprise et documents associés supprimés avec succès");
      setShowDeleteDialog(false);
      setDeletingCompanyId(null);
      // Forcer un rechargement complet des données avec un petit délai
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
      setShowDeleteDialog(false);
      setDeletingCompanyId(null);
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
                      <div className="flex items-center gap-2">
                        <StatusBadge status={company.status} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(company.id)}
                          title="Supprimer l'entreprise"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action supprimera également tous les documents associés et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCompanyId(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
