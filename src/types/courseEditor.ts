export interface Lesson {
  id: string;
  title: string;
  videoUrl?: string;
  videoFileName?: string;
  streamingUrl?: string;
  uploadProgress?: number;
  description: string;
  materials: Material[];
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
  modules: Module[];
}

export type SelectedItem = 
  | { type: 'module'; moduleId: string }
  | { type: 'lesson'; moduleId: string; lessonId: string }
  | { type: 'none' };
