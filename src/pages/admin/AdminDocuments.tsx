import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/auth/AuthContext";
import { adminDocumentsApi, adminCompaniesListApi, downloadDocumentApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { FileText, Download, Calendar, User, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type FilterType = "all" | string;
type CompanyFilterType = "all" | string;

const ITEMS_PER_PAGE = 10;

export default function AdminDocuments() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [companyFilter, setCompanyFilter] = useState<CompanyFilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    
    // Charger les documents
    adminDocumentsApi(token).then((r) => setRows(r.data ?? [])).catch(() => setRows([]));
    
    // Charger la liste des entreprises
    adminCompaniesListApi(token).then((r) => setCompanies(r.data ?? [])).catch(() => setCompanies([]));
  }, [token]);

  const documentTypes = useMemo(() => {
    const types = new Set(rows.map((d) => d.doc_name));
    return Array.from(types).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((d) => {
      const matchSearch = d.doc_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        d.company_name?.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || d.doc_name === filterType;
      const matchCompany = companyFilter === "all" || d.company_id?.toString() === companyFilter;
      return matchSearch && matchType && matchCompany;
    });
  }, [rows, search, filterType, companyFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, companyFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    thisWeek: rows.filter((d) => {
      if (!d.created_at) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(d.created_at) > weekAgo;
    }).length,
    types: documentTypes.length,
  }), [rows, documentTypes]);

  const handleDownload = async (doc: any) => {
    if (!token) return;
    try {
      const blob = await downloadDocumentApi(token, doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name || `${doc.doc_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Document téléchargé");
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleBatchDownload = async () => {
    for (const doc of filteredRows.slice(0, 10)) {
      await handleDownload(doc);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Documents" 
        description="Consultez et téléchargez les documents générés"
        actions={
          <Button variant="outline" onClick={handleBatchDownload} disabled={filteredRows.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger sélection
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Documents totaux</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-emerald-100 p-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
              <p className="text-sm text-muted-foreground">Cette semaine</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.types}</p>
              <p className="text-sm text-muted-foreground">Types de documents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Liste des documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par nom, email ou entreprise..."
              />
            </div>
            <Select value={companyFilter} onValueChange={(v) => setCompanyFilter(v)}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Entreprise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entreprises</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {c.company_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(v) => setFilterType(v)}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Type de document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {documentTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{d.doc_name}</p>
                          <p className="text-sm text-muted-foreground">{d.file_name || "document.pdf"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{d.company_name || "-"}</p>
                          <p className="text-sm text-muted-foreground">{d.company_type || "-"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        {d.user_email ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => handleDownload(d)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun document trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage de {filteredRows.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} sur {filteredRows.length} document(s)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || filteredRows.length === 0}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
