import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/auth/AuthContext";
import { adminCompaniesApi, adminUpdateCompanyStatusApi, adminDocumentsApi, adminDeleteCompanyApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Building2, Eye, Download, FileText, Calendar, User, FolderOpen, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { companyTypes } from "@/lib/mock-data";

type FilterType = "all" | string;
type FilterStatus = "all" | "draft" | "pending" | "processing" | "completed" | "rejected";

const statusOptions = [
  { value: "draft", label: "Brouillon" },
  { value: "pending", label: "En attente" },
  { value: "processing", label: "En cours" },
  { value: "completed", label: "Terminé" },
  { value: "rejected", label: "Rejeté" },
];

export default function AdminCompanies() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [companyDocuments, setCompanyDocuments] = useState<any[]>([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);

  const refresh = () => {
    if (!token) return;
    adminCompaniesApi(token).then((r) => setRows(r.data ?? [])).catch(() => setRows([]));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredRows = useMemo(() => {
    return rows.filter((c) => {
      const matchSearch = c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.user_email?.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || c.company_type === filterType;
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [rows, search, filterType, filterStatus]);

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((c) => c.status === "pending").length,
    completed: rows.filter((c) => c.status === "completed").length,
  }), [rows]);

  const handleStatusChange = async (companyId: string, newStatus: string) => {
    if (!token) return;
    try {
      await adminUpdateCompanyStatusApi(token, companyId, newStatus);
      toast.success("Statut mis à jour");
      refresh();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!token) return;
    setDeletingCompanyId(companyId);
    try {
      await adminDeleteCompanyApi(token, companyId);
      toast.success(`Entreprise "${companyName}" et ses documents supprimés avec succès`);
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setDeletingCompanyId(null);
    }
  };

  const handleViewDocuments = async (company: any) => {
    if (!token) return;
    
    setLoadingDocuments(true);
    try {
      const response = await adminDocumentsApi(token);
      const allDocuments = response.data || [];
      const companyDocs = allDocuments.filter(doc => doc.company_id === company.id);
      
      setCompanyDocuments(companyDocs);
      setSelectedCompany(company);
      setShowDocumentsModal(true);
    } catch (error) {
      toast.error("Erreur lors du chargement des documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const downloadDocument = async (doc: any) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || `${doc.doc_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      toast.success("Document téléchargé");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const exportCSV = () => {
    const headers = ["Entreprise", "Type", "Statut", "Email", "Date"];
    const csvRows = [
      headers.join(","),
      ...filteredRows.map((c) =>
        [c.company_name, c.company_type, c.status, c.user_email, c.created_at].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entreprises-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Entreprises" 
        description="Gérez les entreprises et leurs statuts"
        actions={
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-amber-100 p-2">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-emerald-100 p-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Terminées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Liste des entreprises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par nom ou email..."
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {companyTypes.map((ct) => (
                  <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <p className="font-medium">{c.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                      </p>
                    </TableCell>
                    <TableCell>{c.company_type}</TableCell>
                    <TableCell>
                      <Select
                        value={c.status}
                        onValueChange={(v) => handleStatusChange(c.id, v)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <StatusBadge status={c.status} />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.user_email ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDocuments(c)}
                          disabled={loadingDocuments}
                        >
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCompany(c)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingCompanyId === c.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'entreprise ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer <strong>{c.company_name}</strong> ?
                                <br /><br />
                                <span className="text-destructive font-medium">
                                  Cette action est irréversible et supprimera également tous les documents associés à cette entreprise.
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCompany(c.id, c.company_name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune entreprise trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredRows.length} résultat(s) sur {rows.length}
          </p>
        </CardContent>
      </Card>

      {/* Documents Modal */}
      <Dialog open={showDocumentsModal} onOpenChange={() => setShowDocumentsModal(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Documents de {selectedCompany?.company_name}
            </DialogTitle>
          </DialogHeader>
          
          {loadingDocuments ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Chargement des documents...</div>
            </div>
          ) : companyDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun document trouvé pour cette entreprise</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {companyDocuments.length} document(s) trouvé(s)
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.doc_name}</p>
                              <p className="text-sm text-muted-foreground">{doc.file_name || "document.pdf"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="gold"
                            onClick={() => downloadDocument(doc)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedCompany?.company_name}
            </DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Type d'entreprise</p>
                  <p className="font-medium">{selectedCompany.company_type}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  <StatusBadge status={selectedCompany.status} />
                </div>
                <div className="rounded-lg border p-4 flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateur</p>
                    <p className="font-medium">{selectedCompany.user_email ?? "-"}</p>
                  </div>
                </div>
                <div className="rounded-lg border p-4 flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">
                      {selectedCompany.created_at 
                        ? new Date(selectedCompany.created_at).toLocaleString() 
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCompany.admin_notes && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Notes admin</p>
                  <p>{selectedCompany.admin_notes}</p>
                </div>
              )}

              {selectedCompany.form_data && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Données du formulaire</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                    {JSON.stringify(selectedCompany.form_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
