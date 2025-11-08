import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CourseDetails from "./pages/CourseDetails";
import Evaluation from "./pages/Evaluation";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminUsers from "./pages/AdminUsers";
import AllCourses from "./pages/AllCourses";
import FAQPage from "./pages/FAQPage";
import CalendarView from "./pages/CalendarView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<AllCourses />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/evaluation/:id" element={<Evaluation />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
