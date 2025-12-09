import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Download, ShoppingCart, FileText } from "lucide-react";
import { ebooks } from "@/lib/mock-data";
import { toast } from "sonner";

const categories = ["Tous", "Fiscalité", "Investisseurs", "Création", "Templates"];

export default function Boutique() {
  const handlePurchase = (title: string) => {
    toast.success("Ajouté au panier!", {
      description: `${title} a été ajouté à votre panier.`,
    });
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Ressources Premium
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              E-Books & Guides
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Des ressources pratiques et détaillées pour maîtriser tous les aspects 
              de la création et de la gestion d'entreprise en Côte d'Ivoire.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={cat === "Tous" ? "gold" : "outline"}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {ebooks.map((ebook, index) => (
              <Card 
                key={ebook.id} 
                variant="elevated"
                className="group overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-[3/4] relative bg-gradient-to-br from-primary to-navy-light overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Book className="h-20 w-20 text-secondary/50" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                      {ebook.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs">
                      {ebook.pages} pages
                    </span>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {ebook.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {ebook.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-secondary">
                      {ebook.price.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                    </p>
                  </div>
                  <Button 
                    variant="gold" 
                    className="w-full"
                    onClick={() => handlePurchase(ebook.title)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Acheter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resources */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Ressources Gratuites
            </h2>
            <p className="text-muted-foreground">
              Téléchargez nos guides d'introduction pour commencer à vous informer.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Introduction à la fiscalité ivoirienne",
                description: "Les bases de la fiscalité pour les nouveaux entrepreneurs.",
                pages: 15,
              },
              {
                title: "Checklist création SARL",
                description: "La liste complète des documents nécessaires.",
                pages: 8,
              },
              {
                title: "Calendrier fiscal 2024",
                description: "Toutes les échéances fiscales de l'année.",
                pages: 4,
              },
            ].map((resource, index) => (
              <Card key={index} variant="outline">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    <Button variant="ghost" size="sm" className="text-secondary">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger ({resource.pages} pages)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
