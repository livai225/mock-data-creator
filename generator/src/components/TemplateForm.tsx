import { useState, useEffect } from 'react';
import { DocumentTemplate, TemplateField } from '@/types/template';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowLeft, Sparkles } from 'lucide-react';

interface TemplateFormProps {
  template: DocumentTemplate;
  onGenerate: (values: Record<string, string>) => void;
  onBack: () => void;
}

export const TemplateForm = ({ template, onGenerate, onBack }: TemplateFormProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>('');

  // Initialize default values
  useEffect(() => {
    const defaults: Record<string, string> = {};
    template.fields.forEach((field) => {
      if (field.defaultValue) {
        defaults[field.id] = field.defaultValue;
      }
    });
    setValues(defaults);

    // Set first section as active
    const sections = [...new Set(template.fields.map((f) => f.section))];
    if (sections.length > 0) {
      setActiveSection(sections[0]);
    }
  }, [template]);

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(values);
  };

  // Group fields by section
  const sections = [...new Set(template.fields.map((f) => f.section))];

  const renderField = (field: TemplateField) => {
    const value = values[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[80px]"
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      default:
        return (
          <Input
            id={field.id}
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{template.icon}</span>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {template.name}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {template.description}
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`
              rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
              ${activeSection === section
                ? 'bg-gold text-navy-dark shadow-gold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }
            `}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section) => (
          <div
            key={section}
            className={`space-y-4 ${activeSection === section ? 'block' : 'hidden'}`}
          >
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
                {section}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {template.fields
                  .filter((f) => f.section === section)
                  .map((field) => (
                    <div
                      key={field.id}
                      className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                    >
                      <Label
                        htmlFor={field.id}
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        {field.label}
                        {field.required && (
                          <span className="ml-1 text-destructive">*</span>
                        )}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}

        {/* Submit button */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button type="submit" variant="gold" size="lg">
            <Sparkles className="h-5 w-5" />
            Générer le Document
          </Button>
        </div>
      </form>
    </div>
  );
};
