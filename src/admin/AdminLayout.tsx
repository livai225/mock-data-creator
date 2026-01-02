import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout/Layout";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  CreditCard, 
  Bell,
  ChevronRight
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/entreprises", label: "Entreprises", icon: Building2 },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { href: "/admin/tarifs", label: "Tarifs", icon: CreditCard },
  { href: "/admin/banniere", label: "Bannière", icon: Bell },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <Layout>
      <section className="py-8">
        <div className="container grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border bg-card shadow-sm h-fit sticky top-8">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  A
                </div>
                <div>
                  <h2 className="font-semibold">Administration</h2>
                  <p className="text-sm text-muted-foreground">Panneau de gestion</p>
                </div>
              </div>
            </div>
            
            <nav className="p-3">
              <div className="space-y-1">
                {adminLinks.map((l) => {
                  const Icon = l.icon;
                  const isActive = location.pathname === l.href;
                  
                  return (
                    <Link
                      key={l.href}
                      to={l.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{l.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 mx-3 mb-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-sm font-medium">Besoin d'aide ?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Consultez la documentation ou contactez le support.
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </section>
    </Layout>
  );
}
