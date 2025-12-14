import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/auth/AuthContext";
import { adminUsersApi, adminToggleUserStatusApi, adminUpdateUserRoleApi } from "@/lib/api";

export default function AdminUsers() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  const refresh = () => {
    if (!token) return;
    adminUsersApi(token).then((r) => setRows(r.data ?? [])).catch(() => setRows([]));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Utilisateurs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Comptes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.is_active ? "Oui" : "Non"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!token) return;
                        await adminToggleUserStatusApi(token, u.id);
                        refresh();
                      }}
                      type="button"
                    >
                      {u.is_active ? "Désactiver" : "Activer"}
                    </Button>
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={async () => {
                        if (!token) return;
                        await adminUpdateUserRoleApi(token, u.id, u.role === "admin" ? "user" : "admin");
                        refresh();
                      }}
                      type="button"
                    >
                      {u.role === "admin" ? "Mettre user" : "Mettre admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Aucun utilisateur.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
