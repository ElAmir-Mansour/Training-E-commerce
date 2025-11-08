import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { BookOpen, Users, Star, MessageSquare, TrendingUp, Award } from "lucide-react";

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const StatisticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("all");
  const [courseTypeFilter, setCourseTypeFilter] = useState("all");

  // Fetch all courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch evaluation responses
  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluation_responses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('evaluation_responses').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch course suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ['course_suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('course_suggestions').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Filter courses by type
  const filteredCourses = courseTypeFilter === "all" 
    ? courses 
    : courses.filter((c: any) => c.course_type === courseTypeFilter);

  // Calculate statistics
  const totalCourses = filteredCourses.length;
  const totalStudents = filteredCourses.reduce((sum: number, c: any) => sum + (c.students || 0), 0);
  const avgRating = filteredCourses.length > 0
    ? (filteredCourses.reduce((sum: number, c: any) => sum + c.rating, 0) / filteredCourses.length).toFixed(1)
    : "0";
  const totalEvaluations = evaluations.length;
  const totalSuggestions = suggestions.length;
  const totalVotes = suggestions.reduce((sum: number, s: any) => sum + (s.votes_count || 0), 0);

  // Prepare data for course type distribution
  const courseTypeData = [
    { name: 'حضورية', value: courses.filter((c: any) => c.course_type === 'in-person').length },
    { name: 'عن بعد', value: courses.filter((c: any) => c.course_type === 'online').length },
    { name: 'غير متزامنة', value: courses.filter((c: any) => c.course_type === 'asynchronous').length },
  ].filter(item => item.value > 0);

  // Top 5 courses by students
  const topCourses = [...filteredCourses]
    .sort((a: any, b: any) => b.students - a.students)
    .slice(0, 5)
    .map((c: any) => ({
      name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
      students: c.students,
      rating: c.rating
    }));

  // Rating distribution
  const ratingDistribution = [
    { rating: '5.0', count: filteredCourses.filter((c: any) => c.rating >= 4.5).length },
    { rating: '4.0-4.9', count: filteredCourses.filter((c: any) => c.rating >= 4.0 && c.rating < 4.5).length },
    { rating: '3.0-3.9', count: filteredCourses.filter((c: any) => c.rating >= 3.0 && c.rating < 4.0).length },
    { rating: '< 3.0', count: filteredCourses.filter((c: any) => c.rating < 3.0).length },
  ];

  // Top suggestions
  const topSuggestions = [...suggestions]
    .sort((a: any, b: any) => b.votes_count - a.votes_count)
    .slice(0, 5);

  const stats = [
    { icon: BookOpen, label: "إجمالي الدورات", value: totalCourses, color: "text-purple-600" },
    { icon: Users, label: "إجمالي المسجلين", value: totalStudents, color: "text-blue-600" },
    { icon: Star, label: "متوسط التقييم", value: avgRating, color: "text-yellow-600" },
    { icon: MessageSquare, label: "التقييمات المستلمة", value: totalEvaluations, color: "text-green-600" },
    { icon: TrendingUp, label: "الدورات المقترحة", value: totalSuggestions, color: "text-pink-600" },
    { icon: Award, label: "إجمالي التصويتات", value: totalVotes, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="نوع الدورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="in-person">حضورية</SelectItem>
            <SelectItem value="online">عن بعد</SelectItem>
            <SelectItem value="asynchronous">غير متزامنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex flex-col items-center text-center">
                <Icon className={`w-8 h-8 mb-2 ${stat.color}`} />
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Course Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">توزيع الدورات حسب النوع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {courseTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top 5 Courses */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">أعلى 5 دورات من حيث المسجلين</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCourses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="students" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">توزيع التقييمات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Course Performance Table */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">أداء الدورات</h3>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-right p-2">الدورة</th>
                  <th className="text-center p-2">المسجلين</th>
                  <th className="text-center p-2">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.slice(0, 10).map((course: any) => (
                  <tr key={course.id} className="border-b">
                    <td className="p-2">{course.title.length > 30 ? course.title.substring(0, 30) + '...' : course.title}</td>
                    <td className="text-center p-2">{course.students}</td>
                    <td className="text-center p-2">{course.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Top Suggestions Table */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">أكثر الاقتراحات تصويتاً</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2">العنوان</th>
                <th className="text-right p-2">الوصف</th>
                <th className="text-center p-2">التصويتات</th>
                <th className="text-center p-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {topSuggestions.map((suggestion: any) => (
                <tr key={suggestion.id} className="border-b">
                  <td className="p-2">{suggestion.title}</td>
                  <td className="p-2">{suggestion.description?.substring(0, 50)}...</td>
                  <td className="text-center p-2">{suggestion.votes_count}</td>
                  <td className="text-center p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                      suggestion.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {suggestion.status === 'approved' ? 'موافق عليه' :
                       suggestion.status === 'rejected' ? 'مرفوض' :
                       'قيد المراجعة'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StatisticsDashboard;
