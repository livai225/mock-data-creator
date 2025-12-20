import { useState } from 'react';
import { DocumentTemplate } from '@/types/template';
import { TemplateSelector } from '@/components/TemplateSelector';
import { TemplateForm } from '@/components/TemplateForm';
import { DocumentPreview } from '@/components/DocumentPreview';
import { FileText, Scale, Shield } from 'lucide-react';

type Step = 'select' | 'fill' | 'preview';

const Index = () => {
  const [step, setStep] = useState<Step>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setStep('fill');
  };

  const handleGenerate = (values: Record<string, string>) => {
    if (!selectedTemplate) return;
    setFormValues(values);
    const content = selectedTemplate.generateContent(values);
    setGeneratedContent(content);
    setStep('preview');
  };

  const handleBack = () => {
    if (step === 'fill') {
      setStep('select');
    } else if (step === 'preview') {
      setStep('fill');
    }
  };

  const handleReset = () => {
    setStep('select');
    setSelectedTemplate(null);
    setGeneratedContent('');
    setFormValues({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy-dark px-4 py-16 text-primary-foreground">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gold/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            {/* Logo/Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/20 shadow-gold backdrop-blur-sm">
                <Scale className="h-10 w-10 text-gold" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient-gold">LegalDocs</span> Pro
            </h1>

            <p className="mb-8 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
              Générez vos documents juridiques et commerciaux en quelques clics. 
              Templates professionnels, personnalisables et prêts à l'emploi.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" />
                <span className="text-sm">5 Templates disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold" />
                <span className="text-sm">Conformes aux normes ivoiriennes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60V20C240 40 480 0 720 20C960 40 1200 0 1440 20V60H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              {[
                { step: 'select' as Step, label: 'Choisir', number: 1 },
                { step: 'fill' as Step, label: 'Remplir', number: 2 },
                { step: 'preview' as Step, label: 'Générer', number: 3 },
              ].map((item, index) => (
                <div key={item.step} className="flex items-center">
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-full font-semibold
                      transition-all duration-300
                      ${step === item.step
                        ? 'bg-gold text-navy-dark shadow-gold'
                        : ['fill', 'preview'].indexOf(step) > ['select', 'fill', 'preview'].indexOf(item.step)
                          ? 'bg-gold/20 text-gold-dark'
                          : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {item.number}
                  </div>
                  <span
                    className={`
                      ml-2 hidden text-sm font-medium sm:inline
                      ${step === item.step ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {item.label}
                  </span>
                  {index < 2 && (
                    <div
                      className={`
                        mx-4 h-0.5 w-12 rounded-full transition-all duration-300
                        ${['fill', 'preview'].indexOf(step) > index
                          ? 'bg-gold'
                          : 'bg-border'
                        }
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="animate-fade-in">
          {step === 'select' && (
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={handleSelectTemplate}
            />
          )}

          {step === 'fill' && selectedTemplate && (
            <TemplateForm
              template={selectedTemplate}
              onGenerate={handleGenerate}
              onBack={handleBack}
            />
          )}

          {step === 'preview' && selectedTemplate && (
            <DocumentPreview
              content={generatedContent}
              templateName={selectedTemplate.name}
              onBack={handleBack}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2">
            <Scale className="h-5 w-5 text-gold" />
            <span className="font-heading text-lg font-semibold">LegalDocs Pro</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Générateur de documents juridiques professionnels • Côte d'Ivoire
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
