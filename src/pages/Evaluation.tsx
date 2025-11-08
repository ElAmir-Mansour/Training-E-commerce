import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCourseById, fetchEvaluationFormByCourseId, addEvaluationResponse } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RatingQuestion, TextQuestion, MultipleChoiceQuestion, LikertScaleQuestion } from "@/components/evaluation/QuestionTypes";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Evaluation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [traineeInfo, setTraineeInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourseById(id!),
    enabled: !!id,
  });

  const { data: evaluationForm, isLoading: formLoading } = useQuery({
    queryKey: ['evaluationForm', id],
    queryFn: () => fetchEvaluationFormByCourseId(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: addEvaluationResponse,
    onSuccess: () => {
      setSubmitted(true);
      toast.success("تم إرسال التقييم بنجاح!");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إرسال التقييم");
    },
  });

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!traineeInfo.name.trim()) {
      toast.error("الرجاء إدخال اسمك");
      return;
    }

    if (!evaluationForm) {
      toast.error("لم يتم العثور على نموذج التقييم");
      return;
    }

    const questions = evaluationForm.form_questions as any[];
    const requiredQuestions = questions.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => !responses[q.id]?.value);

    if (missingResponses.length > 0) {
      toast.error("الرجاء الإجابة على جميع الأسئلة المطلوبة");
      return;
    }

    submitMutation.mutate({
      form_id: evaluationForm.id,
      course_id: id!,
      trainee_name: traineeInfo.name,
      trainee_email: traineeInfo.email || undefined,
      trainee_phone: traineeInfo.phone || undefined,
      responses: responses
    });
  };

  if (courseLoading || formLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>الدورة غير موجودة</CardTitle>
              <CardDescription>لم يتم العثور على الدورة المطلوبة</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!evaluationForm) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>التقييم غير متاح</CardTitle>
              <CardDescription>لا يوجد نموذج تقييم نشط لهذه الدورة حالياً</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(`/course/${id}`)} className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة لصفحة الدورة
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">شكراً لك!</CardTitle>
              <CardDescription className="text-base">
                تم إرسال تقييمك بنجاح. نحن نقدر وقتك وآرائك القيمة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate(`/course/${id}`)} variant="outline" className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة لصفحة الدورة
              </Button>
              <Button onClick={() => navigate('/')} className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const questions = evaluationForm.form_questions as any[];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">{evaluationForm.form_title}</CardTitle>
            <CardDescription className="text-base">
              دورة: {course.title}
            </CardDescription>
            <CardDescription>
              المدرب: {course.instructor}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Trainee Information */}
              <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold">معلومات المتدرب</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    الاسم <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={traineeInfo.name}
                    onChange={(e) => setTraineeInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={traineeInfo.email}
                      onChange={(e) => setTraineeInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الجوال (اختياري)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={traineeInfo.phone}
                      onChange={(e) => setTraineeInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Questions */}
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="p-6 border rounded-lg space-y-4">
                    <div className="text-sm text-muted-foreground">
                      السؤال {index + 1} من {questions.length}
                    </div>
                    {question.type === 'rating' && (
                      <RatingQuestion
                        question={question}
                        value={responses[question.id]}
                        onChange={(value) => handleResponseChange(question.id, value)}
                      />
                    )}
                    {question.type === 'likert' && (
                      <LikertScaleQuestion
                        question={question}
                        value={responses[question.id]}
                        onChange={(value) => handleResponseChange(question.id, value)}
                      />
                    )}
                    {question.type === 'text' && (
                      <TextQuestion
                        question={question}
                        value={responses[question.id]}
                        onChange={(value) => handleResponseChange(question.id, value)}
                      />
                    )}
                    {question.type === 'multiple_choice' && (
                      <MultipleChoiceQuestion
                        question={question}
                        value={responses[question.id]}
                        onChange={(value) => handleResponseChange(question.id, value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال التقييم"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/course/${id}`)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Evaluation;
