import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/creation-entreprise", label: "Créer mon entreprise" },
  { href: "/services", label: "Services" },
  { href: "/fiscalite", label: "Fiscalité" },
  { href: "/boutique", label: "E-Books" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="font-display text-xl font-bold text-secondary">AE</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-xl font-bold text-foreground">ARCH EXCELLENCE</p>
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
