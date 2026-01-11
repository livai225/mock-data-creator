import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp } from "lucide-react";

interface CompanyTypeData {
  company_type: string;
  count: number;
  revenue: number;
}

interface Props {
  data: CompanyTypeData[];
}

export function CompanyTypesChart({ data }: Props) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const totalCompanies = data.reduce((sum, d) => sum + d.count, 0);
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);

  const getColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-emerald-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];
    return colors[index % colors.length];
  };

  const getBgColor = (index: number) => {
    const colors = [
      "bg-blue-50",
      "bg-purple-50",
      "bg-emerald-50",
      "bg-orange-50",
      "bg-pink-50",
      "bg-cyan-50",
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Répartition par type d'entreprise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <p className="text-sm">Total entreprises</p>
            </div>
            <p className="text-2xl font-bold">{totalCompanies}</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm">Revenus totaux</p>
            </div>
            <p className="text-2xl font-bold">{(totalRevenue / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-muted-foreground">FCFA</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = totalCompanies > 0 
              ? ((item.count / totalCompanies) * 100).toFixed(1)
              : "0";
            const barWidth = maxCount > 0 
              ? (item.count / maxCount) * 100
              : 0;

            return (
              <div key={item.company_type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getColor(index)}`} />
                    <span className="font-medium">{item.company_type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.count} entreprise{item.count > 1 ? 's' : ''}</span>
                    <span className="font-semibold text-primary">{percentage}%</span>
                  </div>
                </div>
                <div className="relative h-8 w-full rounded-lg bg-muted overflow-hidden">
                  <div
                    className={`h-full ${getColor(index)} transition-all duration-500 flex items-center justify-end pr-3`}
                    style={{ width: `${barWidth}%` }}
                  >
                    {barWidth > 20 && (
                      <span className="text-xs font-medium text-white">
                        {item.revenue > 0 ? `${(item.revenue / 1000).toFixed(0)}K FCFA` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>

        {/* Details */}
        {data.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.map((item, index) => (
                <div
                  key={item.company_type}
                  className={`rounded-lg ${getBgColor(index)} p-3`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-2 w-2 rounded-full ${getColor(index)}`} />
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.company_type}
                    </p>
                  </div>
                  <p className="text-lg font-bold">{item.count}</p>
                  {item.revenue > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(item.revenue / 1000).toFixed(0)}K FCFA
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
