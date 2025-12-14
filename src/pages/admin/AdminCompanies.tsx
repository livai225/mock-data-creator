import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/auth/AuthContext";
import { adminCompaniesApi } from "@/lib/api";

export default function AdminCompanies() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    adminCompaniesApi(token).then((r) => setRows(r.data ?? [])).catch(() => setRows([]));
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Entreprises</h1>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.company_name}</TableCell>
                  <TableCell>{c.company_type}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>{c.user_email ?? "-"}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Aucune entreprise.
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
