import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MeusCursos from "./pages/MeusCursos";
import Certificados from "./pages/Certificados";
import Assinatura from "./pages/Assinatura";
import CoursePlayer from "./pages/CoursePlayer";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Courses from "./pages/admin/Courses";
import Students from "./pages/admin/Students";
import Subscriptions from "./pages/admin/Subscriptions";
import Settings from "./pages/admin/Settings";
import CourseEditor from "./pages/admin/CourseEditor";
import NotFound from "./pages/NotFound";
import Perfil from "./pages/Perfil";
import { ProtectedAdminRoute } from "./components/auth/ProtectedAdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Student Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/meus-cursos" element={<MeusCursos />} />
          <Route path="/certificados" element={<Certificados />} />
          <Route path="/assinatura" element={<Assinatura />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/curso/:courseId" element={<CoursePlayer />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="cursos" element={<Courses />} />
            <Route path="alunos" element={<Students />} />
            <Route path="assinaturas" element={<Subscriptions />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
          <Route path="/admin/cursos/editor/:courseId" element={<ProtectedAdminRoute><CourseEditor /></ProtectedAdminRoute>} />
          <Route path="/admin/cursos/novo" element={<ProtectedAdminRoute><CourseEditor /></ProtectedAdminRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
