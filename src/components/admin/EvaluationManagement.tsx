import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEvaluationForms,
  fetchCourses,
  addEvaluationForm,
  updateEvaluationForm,
  deleteEvaluationForm,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import QuestionBuilder from "./QuestionBuilder";

const defaultQuestions: any[] = [
  // الفئة الأولى: التنظيم والتنسيق والمركز التدريبي (5 أسئلة)
  {
    id: "q1",
    type: "likert",
    category: "organization",
    question: "مدى رضاك عن التنظيم العام للدورة",
    required: true,
    options: null
  },
  {
    id: "q2",
    type: "likert",
    category: "organization",
    question: "جودة التنسيق والترتيبات الإدارية",
    required: true,
    options: null
  },
  {
    id: "q3",
    type: "likert",
    category: "organization",
    question: "سهولة عملية التسجيل والتواصل مع المركز",
    required: true,
    options: null
  },
  {
    id: "q4",
    type: "likert",
    category: "organization",
    question: "مدى التزام المركز بالمواعيد المحددة",
    required: true,
    options: null
  },
  {
    id: "q5",
    type: "likert",
    category: "organization",
    question: "احترافية الكادر الإداري في المركز",
    required: true,
    options: null
  },
  
  // الفئة الثانية: المادة التدريبية (5 أسئلة)
  {
    id: "q6",
    type: "likert",
    category: "content",
    question: "جودة المحتوى العلمي للدورة",
    required: true,
    options: null
  },
  {
    id: "q7",
    type: "likert",
    category: "content",
    question: "تنظيم وترتيب المادة التدريبية",
    required: true,
    options: null
  },
  {
    id: "q8",
    type: "likert",
    category: "content",
    question: "مدى ملاءمة المحتوى للأهداف المعلنة",
    required: true,
    options: null
  },
  {
    id: "q9",
    type: "likert",
    category: "content",
    question: "وضوح وسهولة فهم المادة العلمية",
    required: true,
    options: null
  },
  {
    id: "q10",
    type: "likert",
    category: "content",
    question: "جودة الوسائل والمواد التعليمية المساعدة",
    required: true,
    options: null
  },
  
  // الفئة الثالثة: المدرب (5 أسئلة)
  {
    id: "q11",
    type: "likert",
    category: "instructor",
    question: "تمكن المدرب من المادة العلمية",
    required: true,
    options: null
  },
  {
    id: "q12",
    type: "likert",
    category: "instructor",
    question: "قدرة المدرب على إيصال المعلومات بوضوح",
    required: true,
    options: null
  },
  {
    id: "q13",
    type: "likert",
    category: "instructor",
    question: "تفاعل المدرب مع المتدربين وإجابة الاستفسارات",
    required: true,
    options: null
  },
  {
    id: "q14",
    type: "likert",
    category: "instructor",
    question: "التزام المدرب بالوقت والجدول الزمني",
    required: true,
    options: null
  },
  {
    id: "q15",
    type: "likert",
    category: "instructor",
    question: "قدرة المدرب على تحفيز المتدربين وجذب انتباههم",
    required: true,
    options: null
  },
  
  // الفئة الرابعة: البيئة التدريبية ومقر الدورة والبوفيه (5 أسئلة)
  {
    id: "q16",
    type: "likert",
    category: "facilities",
    question: "مدى ملاءمة قاعة التدريب (مساحة، إضاءة، تهوية)",
    required: true,
    options: null
  },
  {
    id: "q17",
    type: "likert",
    category: "facilities",
    question: "جودة المرافق والخدمات (دورات مياه، منطقة استراحة)",
    required: true,
    options: null
  },
  {
    id: "q18",
    type: "likert",
    category: "facilities",
    question: "توفر التقنيات والأجهزة اللازمة (بروجكتر، سماعات، إنترنت)",
    required: true,
    options: null
  },
  {
    id: "q19",
    type: "likert",
    category: "facilities",
    question: "جودة خدمة البوفيه والمرطبات",
    required: true,
    options: null
  },
  {
    id: "q20",
    type: "likert",
    category: "facilities",
    question: "نظافة وترتيب مقر انعقاد الدورة",
    required: true,
    options: null
  }
];

const EvaluationManagement = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [newForm, setNewForm] = useState({
    course_id: '',
    form_title: 'استمارة تقييم الدورة',
    form_questions: defaultQuestions,
    is_active: false
  });

  const { data: forms } = useQuery({
    queryKey: ['evaluationForms'],
    queryFn: fetchEvaluationForms,
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const addMutation = useMutation({
    mutationFn: addEvaluationForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluationForms'] });
      toast.success("تم إضافة نموذج التقييم بنجاح");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة نموذج التقييم");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateEvaluationForm(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluationForms'] });
      toast.success("تم تحديث نموذج التقييم بنجاح");
      setEditingForm(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث نموذج التقييم");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvaluationForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluationForms'] });
      toast.success("تم حذف نموذج التقييم بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف نموذج التقييم");
    },
  });

  const resetForm = () => {
    setNewForm({
      course_id: '',
      form_title: 'استمارة تقييم الدورة',
      form_questions: defaultQuestions,
      is_active: false
    });
  };

  const handleAdd = () => {
    if (!newForm.course_id) {
      toast.error("الرجاء اختيار الدورة");
      return;
    }

    addMutation.mutate(newForm);
  };

  const handleToggleActive = (formId: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id: formId,
      updates: { is_active: !currentStatus }
    });
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses?.find(c => c.id === courseId);
    return course?.title || 'غير معروف';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>إدارة نماذج التقييم</CardTitle>
            <CardDescription>إنشاء وتعديل استمارات تقييم الدورات</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة نموذج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة نموذج تقييم جديد</DialogTitle>
                <DialogDescription>
                  اختر الدورة وأضف الأسئلة المطلوبة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>الدورة</Label>
                  <Select
                    value={newForm.course_id}
                    onValueChange={(value) => setNewForm({ ...newForm, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدورة" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>عنوان النموذج</Label>
                  <Input
                    value={newForm.form_title}
                    onChange={(e) => setNewForm({ ...newForm, form_title: e.target.value })}
                    placeholder="استمارة تقييم الدورة"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base font-semibold">بناء الأسئلة</Label>
                  <QuestionBuilder
                    questions={newForm.form_questions as any}
                    onChange={(questions) => setNewForm({ ...newForm, form_questions: questions })}
                  />
                </div>

                <Separator />

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_active"
                    checked={newForm.is_active}
                    onCheckedChange={(checked) => setNewForm({ ...newForm, is_active: checked })}
                  />
                  <Label htmlFor="is_active">تفعيل النموذج</Label>
                </div>

                <Button onClick={handleAdd} className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "جاري الإضافة..." : "إضافة النموذج"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {forms?.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{form.form_title}</CardTitle>
                    <CardDescription>
                      الدورة: {getCourseTitle(form.course_id)}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${form.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {form.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        عدد الأسئلة: {(form.form_questions as any[]).length}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(form.id, form.is_active)}
                    >
                      {form.is_active ? 'إيقاف' : 'تفعيل'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
                          deleteMutation.mutate(form.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {forms?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد نماذج تقييم. قم بإضافة نموذج جديد للبدء.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationManagement;
