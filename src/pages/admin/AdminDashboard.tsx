import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { adminDashboardApi } from "@/lib/api";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    adminDashboardApi(token).then(setData).catch(() => setData(null));
  }, [token]);

  const dashboard = data?.data;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{dashboard?.users?.total ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nouveaux (7j)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{dashboard?.users?.newThisWeek ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Entreprises</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{dashboard?.companies?.total ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{dashboard?.recentCompanies?.length ? "OK" : "-"}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entreprises récentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(dashboard?.recentCompanies ?? []).slice(0, 10).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between border-b last:border-b-0 py-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.company_name}</div>
                <div className="text-muted-foreground truncate">{c.company_type}</div>
              </div>
              <div className="text-muted-foreground">{c.status}</div>
            </div>
          ))}
          {(dashboard?.recentCompanies ?? []).length === 0 && (
            <div className="text-muted-foreground">Aucune donnée pour le moment.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
