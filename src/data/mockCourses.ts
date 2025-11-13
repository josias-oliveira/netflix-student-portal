import { Course, CourseCategory } from "@/types/course";

export const continuingCourses: Course[] = [];

export const enrolledCourses: Course[] = [];

export const newCourses: Course[] = [
  {
    id: "1",
    title: "Workshop de Design Critique",
    description: "Aprenda técnicas avançadas de análise e crítica construtiva de design",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    category: "Design",
    duration: "8h",
    instructor: "Josias Oliveira",
    isNew: true,
    comingSoon: true,
    totalLessons: 24,
  },
  {
    id: "2",
    title: "Psicologia no Design",
    description: "Entenda como aplicar princípios psicológicos em projetos de design",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
    category: "Design",
    duration: "10h",
    instructor: "Josias Oliveira",
    isNew: true,
    comingSoon: true,
    totalLessons: 32,
  },
  {
    id: "3",
    title: "UX Writing",
    description: "Domine a arte de escrever para experiências digitais",
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop",
    category: "Design",
    duration: "6h",
    instructor: "Josias Oliveira",
    isNew: true,
    comingSoon: true,
    totalLessons: 20,
  },
  {
    id: "4",
    title: "Métricas de Produto",
    description: "Aprenda a medir e otimizar produtos digitais com dados",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    category: "Produto",
    duration: "9h",
    instructor: "Josias Oliveira",
    isNew: true,
    comingSoon: true,
    totalLessons: 28,
  },
  {
    id: "5",
    title: "Curso Product Design 2.0",
    description: "Formação completa em Product Design com metodologias modernas",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=450&fit=crop",
    category: "Design",
    duration: "40h",
    instructor: "Josias Oliveira",
    isNew: true,
    isPremium: true,
    comingSoon: true,
    totalLessons: 120,
  },
  {
    id: "6",
    title: "Curso Product Design 4.0",
    description: "A evolução do Product Design com IA e tecnologias emergentes",
    thumbnail: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=450&fit=crop",
    category: "Design",
    duration: "50h",
    instructor: "Josias Oliveira",
    isNew: true,
    isPremium: true,
    comingSoon: true,
    totalLessons: 150,
  },
  {
    id: "7",
    title: "Liderança em Design",
    description: "Desenvolva habilidades de liderança para times de design",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop",
    category: "Liderança",
    duration: "35h",
    instructor: "Josias Oliveira",
    isNew: true,
    isPremium: true,
    comingSoon: true,
    totalLessons: 100,
  },
];

export const categories: CourseCategory[] = [
  {
    id: "design",
    name: "Cursos de Design",
    courses: newCourses.filter(c => c.category === "Design"),
  },
  {
    id: "produto",
    name: "Cursos de Produto",
    courses: newCourses.filter(c => c.category === "Produto"),
  },
  {
    id: "lideranca",
    name: "Cursos de Liderança",
    courses: newCourses.filter(c => c.category === "Liderança"),
  },
];

export const recommendedCourses: Course[] = [
  ...newCourses.filter(c => c.isPremium),
];
