import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { getPublicBannerApi, type SiteBanner } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/fiscalite", label: "Fiscalité" },
  { href: "/boutique", label: "E-Books" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [banner, setBanner] = useState<SiteBanner | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    getPublicBannerApi()
      .then((res) => setBanner(res.data ?? null))
      .catch(() => setBanner(null));
  }, []);

  const bannerClasses = useMemo(() => {
    switch (banner?.variant) {
      case "warning":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "success":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "danger":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "info":
      default:
        return "bg-secondary/10 text-secondary border-secondary/20";
    }
  }, [banner?.variant]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {banner?.enabled && banner.message ? (
        <div className={cn("border-b", bannerClasses)}>
          <div className="container py-2 text-center text-sm font-medium">
            {banner.message}
          </div>
        </div>
      ) : null}
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ARCH EXCELLENCE" className="h-14 w-auto" />
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground">Cabinet Comptable & Conseil</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA & Mobile Menu */}
        <div className="flex items-center gap-3">
          <a href="tel:0151252999" className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4" />
            01 51 25 29 99
          </a>

          {isAuthenticated ? (
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link to={user?.role === "admin" ? "/admin" : "/dashboard"}>
                <User className="mr-2 h-4 w-4" />
                Mon Espace
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link to="/connexion">
                <LogIn className="mr-2 h-4 w-4" />
                Connexion
              </Link>
            </Button>
          )}

          <Button variant="gold" className="hidden sm:flex" asChild>
            <Link to="/creation-entreprise">Créer mon entreprise</Link>
          </Button>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <Link
                to={user?.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Mon Espace
              </Link>
            ) : (
              <Link
                to="/connexion"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </Link>
            )}

            <Button variant="gold" className="mt-2" asChild>
              <Link to="/creation-entreprise" onClick={() => setMobileMenuOpen(false)}>
                Créer mon entreprise
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
