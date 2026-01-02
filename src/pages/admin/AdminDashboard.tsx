import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  getOverviewStatsApi,
  getRevenueStatsApi,
  getCompaniesStatsApi,
  getUsersStatsApi,
  getRecentActivitiesApi,
} from "@/lib/api";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { QuickAlerts } from "@/components/admin/QuickAlerts";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [revenuePeriod, setRevenuePeriod] = useState('30d');

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Charger toutes les stats en parallèle
      const [overview, revenue, activitiesRes] = await Promise.all([
        getOverviewStatsApi(token),
        getRevenueStatsApi(token, '30d'),
        getRecentActivitiesApi(token, 20),
      ]);

      if (overview.success) {
        setOverviewStats(overview.data);
      }

      if (revenue.success) {
        setRevenueData(revenue.data.byDay || []);
      }

      if (activitiesRes.success) {
        setActivities(activitiesRes.data || []);
      }
    } catch (error: any) {
      console.error("Erreur chargement dashboard:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleRevenuePeriodChange = async (period: string) => {
    setRevenuePeriod(period);
    if (!token) return;

    try {
      const revenue = await getRevenueStatsApi(token, period);
      if (revenue.success) {
        setRevenueData(revenue.data.byDay || []);
      }
    } catch (error) {
      console.error("Erreur changement période:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  const stats = overviewStats || {};

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de l'activité de la plateforme
        </p>
      </div>

      {/* KPIs - Ligne 1 : Utilisateurs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Utilisateurs totaux"
          value={stats.users?.total || 0}
          subtitle={`+${stats.users?.new_last_7_days || 0} cette semaine`}
          icon={Users}
          trend={{
            value: stats.users?.new_last_7_days || 0,
            label: "nouveaux (7j)",
            isPositive: true,
          }}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Actifs (24h)"
          value={stats.users?.active_last_24h || 0}
          subtitle="Utilisateurs actifs"
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Entreprises créées"
          value={stats.companies?.total || 0}
          subtitle={`+${stats.companies?.new_last_7_days || 0} cette semaine`}
          icon={Building2}
          trend={{
            value: stats.companies?.new_last_7_days || 0,
            label: "nouvelles (7j)",
            isPositive: true,
          }}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* KPIs - Ligne 2 : Paiements */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenus totaux"
          value={`${((stats.payments?.total_revenue || 0) / 1000000).toFixed(2)}M`}
          subtitle="FCFA encaissés"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Ce mois"
          value={`${((stats.payments?.revenue_last_30_days || 0) / 1000).toFixed(0)}K`}
          subtitle="FCFA (30 derniers jours)"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <StatCard
          title="En attente"
          value={stats.payments?.pending_count || 0}
          subtitle={`${((stats.payments?.pending_amount || 0) / 1000).toFixed(0)}K FCFA`}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatCard
          title="Taux validation"
          value={`${(stats.payments?.validation_rate || 0).toFixed(0)}%`}
          subtitle={`${(stats.payments?.avg_validation_time_minutes || 0).toFixed(0)} min moy.`}
          icon={CheckCircle2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
      </div>

      {/* KPIs - Ligne 3 : Documents & Statuts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents générés"
          value={stats.documents?.total || 0}
          subtitle={`+${stats.documents?.generated_today || 0} aujourd'hui`}
          icon={FileText}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Entreprises payées</p>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-green-600">{stats.companies?.paid || 0}</h2>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">En attente paiement</p>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-orange-600">{stats.companies?.pending || 0}</h2>
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Non payées</p>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-red-600">{stats.companies?.unpaid || 0}</h2>
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des revenus */}
      <RevenueChart data={revenueData} onPeriodChange={handleRevenuePeriodChange} />

      {/* Alertes & Activité */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickAlerts
          pendingPayments={stats.alerts?.pendingPayments || []}
          unpaidCompanies={stats.alerts?.unpaidCompanies || []}
        />
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}
