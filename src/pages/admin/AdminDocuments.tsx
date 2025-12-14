import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/auth/AuthContext";
import { adminDocumentsApi, downloadDocumentApi } from "@/lib/api";

export default function AdminDocuments() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    adminDocumentsApi(token).then((r) => setRows(r.data ?? [])).catch(() => setRows([]));
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Documents</h1>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Télécharger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.doc_name}</TableCell>
                  <TableCell>{d.user_email ?? "-"}</TableCell>
                  <TableCell>{d.created_at ? new Date(d.created_at).toLocaleString() : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="gold"
                      type="button"
                      onClick={async () => {
                        if (!token) return;
                        const blob = await downloadDocumentApi(token, d.id);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = d.file_name || `${d.doc_name}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Télécharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Aucun document.
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
