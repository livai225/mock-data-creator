export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  required?: boolean;
  section: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'juridique' | 'commercial' | 'administratif';
  fields: TemplateField[];
  generateContent: (values: Record<string, string>) => string;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  createdAt: Date;
  values: Record<string, string>;
}
