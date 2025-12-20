import { templates } from '@/data/templates';
import { DocumentTemplate } from '@/types/template';
import { FileText, Building, ClipboardList } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplate | null;
  onSelect: (template: DocumentTemplate) => void;
}

const categoryIcons = {
  juridique: FileText,
  commercial: Building,
  administratif: ClipboardList,
};

const categoryLabels = {
  juridique: 'Juridique',
  commercial: 'Commercial',
  administratif: 'Administratif',
};

const categoryColors = {
  juridique: 'from-navy to-navy-light',
  commercial: 'from-gold-dark to-gold',
  administratif: 'from-navy-light to-gold-dark',
};

export const TemplateSelector = ({ selectedTemplate, onSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Choisissez un Template
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sélectionnez le type de document que vous souhaitez générer
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const CategoryIcon = categoryIcons[template.category];
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`
                group relative overflow-hidden rounded-xl border-2 p-6 text-left
                transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                ${isSelected
                  ? 'border-gold bg-gold/5 shadow-gold'
                  : 'border-border bg-card hover:border-gold/50'
                }
              `}
            >
              {/* Background gradient on hover */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${categoryColors[template.category]}
                opacity-0 transition-opacity duration-300 group-hover:opacity-5
              `} />

              {/* Content */}
              <div className="relative z-10 space-y-3">
                {/* Icon & Badge */}
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{template.icon}</span>
                  <span className={`
                    inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
                    ${isSelected
                      ? 'bg-gold/20 text-gold-dark'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    <CategoryIcon className="h-3 w-3" />
                    {categoryLabels[template.category]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {template.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>

                {/* Fields count */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {template.fields.length}
                  </span>
                  champs à remplir
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute right-3 top-3 h-3 w-3 rounded-full bg-gold shadow-gold" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
