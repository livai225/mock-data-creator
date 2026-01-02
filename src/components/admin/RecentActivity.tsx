import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Upload,
  UserPlus,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Activity {
  type: string;
  entity_id: number;
  entity_name: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company_created':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'payment_validated':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'payment_submitted':
        return <Upload className="h-4 w-4 text-orange-600" />;
      case 'payment_rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'user_registered':
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'company_created':
        return 'Entreprise créée';
      case 'payment_validated':
        return 'Paiement validé';
      case 'payment_submitted':
        return 'Paiement soumis';
      case 'payment_rejected':
        return 'Paiement rejeté';
      case 'user_registered':
        return 'Nouvel utilisateur';
      default:
        return 'Activité';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'company_created':
        return 'default';
      case 'payment_validated':
        return 'default';
      case 'payment_submitted':
        return 'secondary';
      case 'payment_rejected':
        return 'destructive';
      case 'user_registered':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
      
      if (diffMinutes < 1) {
        return "À l'instant";
      } else if (diffMinutes < 60) {
        return `Il y a ${Math.floor(diffMinutes)} min`;
      } else if (diffMinutes < 1440) {
        return `Il y a ${Math.floor(diffMinutes / 60)}h`;
      } else if (diffMinutes < 2880) {
        return "Hier";
      } else {
        return format(date, "d MMM", { locale: fr });
      }
    } catch {
      return dateString;
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Les dernières actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucune activité récente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          Les {activities.length} dernières actions sur la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={`${activity.type}-${activity.entity_id}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getActivityColor(activity.type)} className="text-xs">
                      {getActivityLabel(activity.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{activity.entity_name}</p>
                  {activity.first_name && activity.last_name && (
                    <p className="text-xs text-muted-foreground">
                      {activity.first_name} {activity.last_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
