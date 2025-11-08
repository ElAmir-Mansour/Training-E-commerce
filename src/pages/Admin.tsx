import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Award, TrendingUp, MessageSquare, ClipboardCheck, BarChart3, Lightbulb, Vote, Shield, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import CourseManagement from "@/components/admin/CourseManagement";
import ChatbotManagement from "@/components/admin/ChatbotManagement";
import ContactInfoManagement from "@/components/admin/ContactInfoManagement";
import EvaluationManagement from "@/components/admin/EvaluationManagement";
import EvaluationResults from "@/components/admin/EvaluationResults";
import CourseSuggestionsManagement from "@/components/admin/CourseSuggestionsManagement";
import CoursePollsManagement from "@/components/admin/CoursePollsManagement";
import FAQManagement from "@/components/admin/FAQManagement";
import StatisticsDashboard from "@/components/admin/StatisticsDashboard";
import { useQuery, QueryClient } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Admin = () => {
  const [chatbotDialogOpen, setChatbotDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin-login", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);
  
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['courseSuggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_suggestions')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: pollVotes } = useQuery({
    queryKey: ['coursePollVotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_polls')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/admin-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const totalStudents = courses.reduce((sum: number, course: any) => sum + (course.students || 0), 0);
  const stats = [
    { icon: BookOpen, label: "إجمالي الدورات", value: courses.length.toString(), change: "+8.2%" },
    { icon: Users, label: "إجمالي المسجلين", value: totalStudents.toLocaleString(), change: "+12.5%" },
    { icon: Lightbulb, label: "الدورات المقترحة", value: (suggestions?.length || 0).toString(), change: "+0%" },
    { icon: Vote, label: "إجمالي التصويت", value: (pollVotes?.length || 0).toString(), change: "+0%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">لوحة التحكم</h1>
            <p className="text-muted-foreground">إدارة المنصة والدورات التدريبية</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Management Sections */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <SiteSettingsForm />
          <div className="grid gap-6">
            <Card className="p-6 border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">إدارة المستخدمين</h3>
                    <p className="text-sm text-muted-foreground">
                      عرض وإدارة صلاحيات المستخدمين المسجلين
                    </p>
                  </div>
                </div>
                <Link to="/admin/users">
                  <Button variant="gradient">
                    إدارة
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Course Management */}
        <CourseManagement />

        {/* Chatbot Management Card */}
        <div className="mt-12">
          <Card className="p-6 border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">إدارة الشات بوت</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    إدارة قاعدة المعرفة للشات بوت - أضف وعدل المعلومات التي يستخدمها البوت للرد على الأسئلة
                  </p>
                </div>
              </div>
              <Button onClick={() => setChatbotDialogOpen(true)} variant="gradient">
                فتح وإدارة
              </Button>
            </div>
          </Card>
        </div>

        {/* Chatbot Management Dialog */}
        <Dialog open={chatbotDialogOpen} onOpenChange={setChatbotDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إدارة قاعدة معرفة الشات بوت</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <ChatbotManagement />
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Info Management */}
        <div className="mt-12">
          <ContactInfoManagement />
        </div>

        {/* Evaluation Management - More Prominent */}
        <div className="mt-12" id="evaluation-section">
          <Card className="border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">إدارة استمارات التقييم</CardTitle>
                  <CardDescription className="text-base">
                    إنشاء وإدارة نماذج تقييم الدورات وعرض نتائج التقييمات
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="forms" className="w-full">
                <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 mb-6">
                  <TabsTrigger value="forms" className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    إدارة النماذج
                  </TabsTrigger>
                  <TabsTrigger value="results" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    النتائج والتحليل
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="forms">
                  <EvaluationManagement />
                </TabsContent>
                <TabsContent value="results">
                  <EvaluationResults />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Course Suggestions & Polls Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <CourseSuggestionsManagement />
          <CoursePollsManagement />
        </div>

        {/* FAQ Management */}
        <div className="mt-12">
          <Card className="border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">إدارة الأسئلة الشائعة</CardTitle>
                  <CardDescription className="text-base">
                    إضافة وتعديل الأسئلة الشائعة التي تظهر في الصفحة الرئيسية
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FAQManagement />
            </CardContent>
          </Card>
        </div>

        {/* Statistics Dashboard */}
        <div className="mt-12">
          <Card className="border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">لوحة الإحصائيات</CardTitle>
                  <CardDescription className="text-base">
                    عرض شامل للإحصائيات والتحليلات المتعلقة بالدورات والمستخدمين
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StatisticsDashboard />
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
