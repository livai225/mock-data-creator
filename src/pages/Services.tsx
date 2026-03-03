import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  FileText, 
  Search, 
  Building2, 
  Users, 
  Globe,
  CheckCircle2,
  ArrowRight,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicServicesContentApi } from "@/lib/api";
import { defaultServicesContent, normalizeServicesContent, type ServicesContent } from "@/lib/site-content";

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  FileText,
  Search,
  Building2,
  Users,
  Globe,
};

export default function Services() {
  const [content, setContent] = useState<ServicesContent>(defaultServicesContent);

  useEffect(() => {
    getPublicServicesContentApi()
      .then((res) => setContent(normalizeServicesContent(res.data)))
      .catch(() => setContent(defaultServicesContent));
  }, []);

  const servicesList = useMemo(() => content.services, [content.services]);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              {content.header.title}
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              {content.header.description}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            {servicesList.map((service, index) => {
              const Icon = iconMap[service.icon] || Building2;
              return (
                <Card 
                  key={service.id} 
                  variant="elevated" 
                  className="group hover:shadow-gold animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-secondary/10 transition-colors">
                        <Icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                        <CardDescription className="text-base">{service.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investor Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                {content.investor.badge}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                {content.investor.title}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {content.investor.description}
              </p>
              <ul className="space-y-4 mb-8">
                {content.investor.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="gold" size="lg" asChild>
                <Link to="/contact">
                  {content.investor.ctaLabel}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <Card variant="gold" className="p-8">
              <h3 className="font-display text-2xl font-bold mb-4">{content.investor.packTitle}</h3>
              <p className="text-muted-foreground mb-6">
                {content.investor.packDescription}
              </p>
              <ul className="space-y-3 mb-8">
                {content.investor.packItems.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground mb-2">À partir de</p>
                <p className="text-3xl font-bold text-secondary mb-4">{content.investor.packPrice}</p>
                <Button variant="navy" className="w-full" asChild>
                  <Link to="/contact">{content.investor.packCtaLabel}</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-secondary-foreground mb-2">
                {content.cta.title}
              </h3>
              <p className="text-secondary-foreground/80">
                {content.cta.description}
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="navy" size="lg" asChild>
                <a href="tel:0151252999">
                  <Phone className="h-5 w-5" />
                  {content.cta.callLabel}
                </a>
              </Button>
              <Button variant="outline" size="lg" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10" asChild>
                <Link to="/contact">{content.cta.contactLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
