export interface Lesson {
  id: string;
  title: string;
  videoUrl?: string;
  videoFileName?: string;
  streamingUrl?: string;
  uploadProgress?: number;
  description: string;
  materials: Material[];
  duration?: number; // Duration in minutes
}

export interface Material {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseStructure {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  thumbnail_url?: string;
  cover_image_url?: string;
  featured?: boolean;
  status?: 'draft' | 'published';
  is_paid?: boolean;
  price?: number;
  certificate_enabled?: boolean;
  certificate_template_url?: string;
  certificate_text_x?: number;
  certificate_text_y?: number;
  certificate_font_size?: number;
  certificate_font_color?: string;
  certificate_date_x?: number;
  certificate_date_y?: number;
  certificate_date_font_size?: number;
  modules: Module[];
}

export type SelectedItem = 
  | { type: 'course' }
  | { type: 'module'; moduleId: string }
  | { type: 'lesson'; moduleId: string; lessonId: string }
  | { type: 'none' };
