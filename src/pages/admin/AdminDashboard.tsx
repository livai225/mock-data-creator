import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { adminDashboardApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Users, Building2, FileText, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#6366f1"];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    adminDashboardApi(token).then(setData).catch(() => setData(null));
  }, [token]);

  const dashboard = data?.data;

  // Mock data for charts - would come from API
  const weeklyData = [
    { name: "Lun", créations: 4 },
    { name: "Mar", créations: 6 },
    { name: "Mer", créations: 3 },
    { name: "Jeu", créations: 8 },
    { name: "Ven", créations: 5 },
    { name: "Sam", créations: 2 },
    { name: "Dim", créations: 1 },
  ];

  const typeDistribution = [
    { name: "SARLU", value: 45 },
    { name: "SARL Pluri", value: 30 },
    { name: "EI", value: 15 },
    { name: "Autres", value: 10 },
  ];

  const statusStats = {
    pending: dashboard?.companies?.pending ?? 0,
    processing: dashboard?.companies?.processing ?? 0,
    completed: dashboard?.companies?.completed ?? 0,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Tableau de bord" 
        description="Vue d'ensemble de l'activité de la plateforme"
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Utilisateurs totaux"
          value={dashboard?.users?.total ?? "-"}
          icon={Users}
          trend={{ value: 12, label: "vs mois dernier" }}
        />
        <StatsCard
          title="Nouveaux (7j)"
          value={dashboard?.users?.newThisWeek ?? "-"}
          icon={TrendingUp}
          trend={{ value: 8, label: "vs semaine dernière" }}
        />
        <StatsCard
          title="Entreprises créées"
          value={dashboard?.companies?.total ?? "-"}
          icon={Building2}
          trend={{ value: 15, label: "vs mois dernier" }}
        />
        <StatsCard
          title="Documents générés"
          value={dashboard?.documents?.total ?? "-"}
          icon={FileText}
          trend={{ value: 22, label: "vs mois dernier" }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Créations cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="créations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Répartition par type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {typeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Par statut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">En attente</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{statusStats.pending}</span>
                <StatusBadge status="pending" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">En cours</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{statusStats.processing}</span>
                <StatusBadge status="processing" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Terminés</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{statusStats.completed}</span>
                <StatusBadge status="completed" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(dashboard?.recentCompanies ?? []).slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.company_name}</p>
                    <p className="text-sm text-muted-foreground">{c.company_type}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {(dashboard?.recentCompanies ?? []).length === 0 && (
                <p className="text-muted-foreground text-center py-4">Aucune activité récente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
