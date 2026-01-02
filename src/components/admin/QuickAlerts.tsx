import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Building2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Alert {
  type: 'pending_payment' | 'unpaid_company';
  id: number;
  title: string;
  subtitle: string;
  amount?: number;
  date: string;
  urgency: 'high' | 'medium' | 'low';
}

interface QuickAlertsProps {
  pendingPayments: any[];
  unpaidCompanies: any[];
}

export function QuickAlerts({ pendingPayments, unpaidCompanies }: QuickAlertsProps) {
  const navigate = useNavigate();

  const alerts: Alert[] = [
    ...pendingPayments.map(p => ({
      type: 'pending_payment' as const,
      id: p.id,
      title: `Paiement en attente`,
      subtitle: `${p.company_name} - ${p.first_name} ${p.last_name}`,
      amount: p.amount,
      date: p.created_at,
      urgency: (new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60) > 24
        ? 'high' as const
        : 'medium' as const,
    })),
    ...unpaidCompanies.map(c => ({
      type: 'unpaid_company' as const,
      id: c.id,
      title: `Entreprise non payée`,
      subtitle: `${c.company_name} - ${c.first_name} ${c.last_name}`,
      date: c.created_at,
      urgency: (new Date().getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60) > 48
        ? 'high' as const
        : 'low' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        return "Il y a quelques minutes";
      } else if (diffHours < 24) {
        return `Il y a ${Math.floor(diffHours)}h`;
      } else if (diffHours < 48) {
        return "Il y a 1 jour";
      } else {
        return format(date, "d MMM yyyy", { locale: fr });
      }
    } catch {
      return dateString;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const handleViewAll = (type: string) => {
    if (type === 'pending_payment') {
      navigate('/admin/paiements');
    } else {
      navigate('/admin/entreprises');
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertes & Actions rapides
          </CardTitle>
          <CardDescription>Aucune action requise pour le moment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <AlertCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">Tout est à jour !</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aucun paiement en attente ni entreprise non payée
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertes & Actions rapides
            </CardTitle>
            <CardDescription>
              {alerts.length} action{alerts.length > 1 ? 's' : ''} en attente
            </CardDescription>
          </div>
          <Badge variant="destructive">{alerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert, index) => (
            <div
              key={`${alert.type}-${alert.id}`}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {alert.type === 'pending_payment' ? (
                    <Clock className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Building2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge variant={getUrgencyColor(alert.urgency)} className="text-xs">
                      {alert.urgency === 'high' ? 'Urgent' : alert.urgency === 'medium' ? 'Moyen' : 'Normal'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{alert.subtitle}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-muted-foreground">{formatDate(alert.date)}</p>
                    {alert.amount && (
                      <p className="text-xs font-semibold text-primary">
                        {alert.amount.toLocaleString()} FCFA
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewAll(alert.type)}
                className="ml-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {alerts.length > 5 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleViewAll(alerts[0].type)}
            >
              Voir toutes les alertes ({alerts.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
