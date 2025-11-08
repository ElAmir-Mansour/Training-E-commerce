import { useQuery } from "@tanstack/react-query";
import { fetchEvaluationResponses, fetchEvaluationForms, fetchCourses } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, Users, Star, TrendingUp } from "lucide-react";
import { useState } from "react";
import { exportToExcel } from "@/lib/evaluationExport";
import { toast } from "sonner";

const EvaluationResults = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const { data: forms } = useQuery({
    queryKey: ['evaluationForms'],
    queryFn: fetchEvaluationForms,
  });

  const { data: responses } = useQuery({
    queryKey: ['evaluationResponses', selectedCourse],
    queryFn: () => fetchEvaluationResponses(selectedCourse === 'all' ? undefined : selectedCourse),
  });

  const calculateStats = () => {
    if (!responses || responses.length === 0) return null;

    const categories = ['course', 'trainer', 'center', 'venue', 'general'];
    const stats: Record<string, { total: number; count: number; average: number }> = {};

    categories.forEach(category => {
      stats[category] = { total: 0, count: 0, average: 0 };
    });

    responses.forEach(response => {
      Object.entries(response.responses).forEach(([_, value]: [string, any]) => {
        if (value.category && typeof value.value === 'number') {
          stats[value.category].total += value.value;
          stats[value.category].count += 1;
        }
      });
    });

    Object.keys(stats).forEach(category => {
      if (stats[category].count > 0) {
        stats[category].average = stats[category].total / stats[category].count;
      }
    });

    const overallTotal = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
    const overallCount = Object.values(stats).reduce((sum, s) => sum + s.count, 0);
    const overallAverage = overallCount > 0 ? overallTotal / overallCount : 0;

    return { byCategory: stats, overall: overallAverage, totalResponses: responses.length };
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      course: 'الدورة التدريبية',
      trainer: 'المدرب',
      center: 'المركز التدريبي',
      venue: 'المكان والتجهيزات',
      general: 'عام'
    };
    return names[category] || category;
  };

  const handleExport = () => {
    if (!responses || responses.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const course = courses?.find(c => c.id === selectedCourse);
    const courseTitle = course?.title || 'جميع الدورات';
    
    const form = forms?.find(f => f.course_id === selectedCourse);
    const questions = form?.form_questions || [];

    const formattedResponses = responses.map(r => ({
      ...r,
      responses: r.responses as Record<string, any>
    }));

    exportToExcel(formattedResponses as any, questions as any[], courseTitle);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const stats = calculateStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>نتائج التقييم</CardTitle>
            <CardDescription>عرض وتحليل تقييمات المتدربين</CardDescription>
          </div>
          <div className="flex gap-3">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="اختر الدورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الدورات</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExport} disabled={!responses || responses.length === 0}>
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي التقييمات</p>
                      <p className="text-2xl font-bold">{stats.totalResponses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">المتوسط العام</p>
                      <p className="text-2xl font-bold">{stats.overall.toFixed(2)} / 5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">نسبة الرضا</p>
                      <p className="text-2xl font-bold">{Math.round((stats.overall / 5) * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التحليل حسب الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(stats.byCategory).map(([category, data]: [string, any]) => {
                    if (data.count === 0) return null;
                    const percentage = Math.round((data.average / 5) * 100);
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{getCategoryName(category)}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                              {data.average.toFixed(2)} / 5
                            </span>
                            <span className="text-sm font-bold">{percentage}%</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التقييمات التفصيلية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم المتدرب</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>رقم الجوال</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-center">المتوسط</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses?.map((response) => {
                        const values = Object.values(response.responses)
                          .filter((r: any) => typeof r.value === 'number')
                          .map((r: any) => r.value);
                        const avg = values.length > 0 
                          ? values.reduce((sum, val) => sum + val, 0) / values.length 
                          : 0;

                        return (
                          <TableRow key={response.id}>
                            <TableCell className="font-medium">{response.trainee_name}</TableCell>
                            <TableCell>{response.trainee_email || '-'}</TableCell>
                            <TableCell>{response.trainee_phone || '-'}</TableCell>
                            <TableCell>
                              {new Date(response.submitted_at).toLocaleDateString('ar-SA')}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {avg.toFixed(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد تقييمات لعرضها. اختر دورة من القائمة أعلاه.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvaluationResults;
