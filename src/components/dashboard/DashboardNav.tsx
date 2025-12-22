import { Link, useLocation } from "react-router-dom";
import { Building2, User, CreditCard, FileText, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  activeTab?: "entreprises" | "compte" | "paiements";
}

export function DashboardNav({ activeTab }: DashboardNavProps) {
  const location = useLocation();
  
  // Déterminer l'onglet actif basé sur l'URL si non fourni
  const currentTab = activeTab || (() => {
    if (location.pathname.includes('/mon-compte')) return 'compte';
    if (location.pathname.includes('/mes-paiements')) return 'paiements';
    return 'entreprises';
  })();

  const navItems = [
    {
      id: 'entreprises',
      label: 'Mes Entreprises',
      icon: Building2,
      href: '/dashboard',
      description: 'Gérer vos entreprises et documents',
    },
    {
      id: 'paiements',
      label: 'Mes Paiements',
      icon: CreditCard,
      href: '/mes-paiements',
      description: 'Historique et suivi des paiements',
    },
    {
      id: 'compte',
      label: 'Mon Compte',
      icon: User,
      href: '/mon-compte',
      description: 'Profil et préférences',
    },
  ];

  return (
    <div className="border-b bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Espace Client</span>
        </div>
      </div>
      
      <nav className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                "border-2",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background border-transparent hover:border-primary/20"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )} />
              <div className="flex flex-col">
                <span className={cn(
                  "font-medium text-sm",
                  isActive ? "text-primary-foreground" : ""
                )}>
                  {item.label}
                </span>
                <span className={cn(
                  "text-xs hidden md:block",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

