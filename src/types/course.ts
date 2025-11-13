export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  duration: string;
  instructor: string;
  progress?: number; // 0-100
  isEnrolled?: boolean;
  isNew?: boolean;
  totalLessons?: number;
  completedLessons?: number;
}

export interface CourseCategory {
  id: string;
  name: string;
  courses: Course[];
}
