import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout/Layout";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/entreprises", label: "Entreprises" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/tarifs", label: "Tarifs" },
  { href: "/admin/banniere", label: "Bannière" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <Layout>
      <section className="py-10">
        <div className="container grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-lg border bg-card p-4 h-fit">
            <div className="text-sm font-semibold mb-3">Administration</div>
            <nav className="flex flex-col gap-1">
              {adminLinks.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname === l.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </section>
    </Layout>
  );
}
