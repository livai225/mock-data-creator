import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/auth/AuthContext";
import { adminUsersApi, adminToggleUserStatusApi, adminUpdateUserRoleApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { RoleBadge, ActiveBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Users, Shield, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

type FilterRole = "all" | "admin" | "client";
type FilterStatus = "all" | "active" | "inactive";

export default function AdminUsers() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "toggle" | "role";
    user: any;
  }>({ open: false, type: "toggle", user: null });

  const refresh = () => {
    if (!token) return;
    adminUsersApi(token).then((r) => setRows(r.data ?? [])).catch(() => setRows([]));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredRows = useMemo(() => {
    return rows.filter((u) => {
      const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus = filterStatus === "all" ||
        (filterStatus === "active" && u.is_active) ||
        (filterStatus === "inactive" && !u.is_active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [rows, search, filterRole, filterStatus]);

  const stats = useMemo(() => ({
    total: rows.length,
    admins: rows.filter((u) => u.role === "admin").length,
    active: rows.filter((u) => u.is_active).length,
  }), [rows]);

  const handleToggleStatus = async () => {
    if (!token || !confirmDialog.user) return;
    try {
      await adminToggleUserStatusApi(token, confirmDialog.user.id);
      toast.success(confirmDialog.user.is_active ? "Utilisateur désactivé" : "Utilisateur activé");
      refresh();
    } catch {
      toast.error("Erreur lors de la modification");
    }
    setConfirmDialog({ open: false, type: "toggle", user: null });
  };

  const handleToggleRole = async () => {
    if (!token || !confirmDialog.user) return;
    const newRole = confirmDialog.user.role === "admin" ? "client" : "admin";
    try {
      await adminUpdateUserRoleApi(token, confirmDialog.user.id, newRole);
      toast.success(`Rôle modifié en ${newRole}`);
      refresh();
    } catch {
      toast.error("Erreur lors de la modification");
    }
    setConfirmDialog({ open: false, type: "role", user: null });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Utilisateurs" 
        description="Gérez les comptes utilisateurs de la plateforme"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-100 p-2">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-emerald-100 p-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Liste des comptes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher par email ou nom..."
              />
            </div>
            <Select value={filterRole} onValueChange={(v) => setFilterRole(v as FilterRole)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{u.email}</p>
                        {(u.first_name || u.last_name) && (
                          <p className="text-sm text-muted-foreground">
                            {u.first_name} {u.last_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <ActiveBadge isActive={u.is_active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDialog({ open: true, type: "toggle", user: u })}
                        >
                          {u.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDialog({ open: true, type: "role", user: u })}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Aucun utilisateur trouvé
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

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "toggle"}
        onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
        title={confirmDialog.user?.is_active ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
        description={`Êtes-vous sûr de vouloir ${confirmDialog.user?.is_active ? "désactiver" : "activer"} ${confirmDialog.user?.email} ?`}
        confirmLabel={confirmDialog.user?.is_active ? "Désactiver" : "Activer"}
        variant={confirmDialog.user?.is_active ? "destructive" : "default"}
        onConfirm={handleToggleStatus}
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "role"}
        onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
        title="Modifier le rôle"
        description={`Êtes-vous sûr de vouloir changer le rôle de ${confirmDialog.user?.email} en ${confirmDialog.user?.role === "admin" ? "utilisateur" : "admin"} ?`}
        confirmLabel="Confirmer"
        onConfirm={handleToggleRole}
      />
    </div>
  );
}
