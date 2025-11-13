export interface Student {
  id: string;
  name: string;
  email: string;
  plan: "Gratuito" | "Premium";
  registrationDate: string;
  enrolledCourses: {
    courseId: string;
    courseTitle: string;
    progress: number;
  }[];
}

export interface AdminCourse {
  id: string;
  title: string;
  shortDescription: string;
  thumbnail: string;
  instructor: string;
  modules: number;
  lessons: number;
  status: "Publicado" | "Rascunho";
  price?: number;
  plan: "Gratuito" | "Premium" | "Todos";
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  newEnrollments: number;
  monthlyRevenue: number;
}

export interface Subscription {
  id: string;
  studentName: string;
  studentEmail: string;
  plan: "Premium";
  status: "Ativo" | "Vencido";
  nextBilling: string;
}

export const dashboardStats: DashboardStats = {
  totalStudents: 150,
  activeStudents: 80,
  newEnrollments: 12,
  monthlyRevenue: 1200,
};

export const adminCourses: AdminCourse[] = [
  {
    id: "1",
    title: "Apresentações: como dominar as técnicas de comunicação em público",
    shortDescription: "Aprenda técnicas profissionais de oratória",
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop",
    instructor: "Professor Expert",
    modules: 4,
    lessons: 28,
    status: "Publicado",
    plan: "Premium",
    price: 197,
  },
  {
    id: "2",
    title: "UI/UX Design: Do Zero ao Profissional",
    shortDescription: "Aprenda design de interfaces modernas",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    instructor: "Maria Santos",
    modules: 6,
    lessons: 56,
    status: "Publicado",
    plan: "Premium",
    price: 297,
  },
  {
    id: "3",
    title: "Marketing Digital: Estratégias Completas",
    shortDescription: "Domine todas as ferramentas de marketing digital",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    instructor: "Carlos Oliveira",
    modules: 5,
    lessons: 38,
    status: "Rascunho",
    plan: "Premium",
    price: 247,
  },
];

export const students: Student[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    plan: "Premium",
    registrationDate: "2024-01-15",
    enrolledCourses: [
      { courseId: "1", courseTitle: "Apresentações", progress: 45 },
      { courseId: "2", courseTitle: "UI/UX Design", progress: 78 },
    ],
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    plan: "Premium",
    registrationDate: "2024-02-20",
    enrolledCourses: [
      { courseId: "1", courseTitle: "Apresentações", progress: 23 },
    ],
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@email.com",
    plan: "Gratuito",
    registrationDate: "2024-03-10",
    enrolledCourses: [],
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    plan: "Premium",
    registrationDate: "2024-01-05",
    enrolledCourses: [
      { courseId: "2", courseTitle: "UI/UX Design", progress: 92 },
      { courseId: "3", courseTitle: "Marketing Digital", progress: 15 },
    ],
  },
];

export const subscriptions: Subscription[] = [
  {
    id: "1",
    studentName: "João Silva",
    studentEmail: "joao.silva@email.com",
    plan: "Premium",
    status: "Ativo",
    nextBilling: "2024-05-15",
  },
  {
    id: "2",
    studentName: "Maria Oliveira",
    studentEmail: "maria.oliveira@email.com",
    plan: "Premium",
    status: "Ativo",
    nextBilling: "2024-05-20",
  },
  {
    id: "3",
    studentName: "Ana Costa",
    studentEmail: "ana.costa@email.com",
    plan: "Premium",
    status: "Ativo",
    nextBilling: "2024-05-05",
  },
];
