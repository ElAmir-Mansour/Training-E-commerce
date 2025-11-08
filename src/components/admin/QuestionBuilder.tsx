import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Question {
  id: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'likert';
  category: string;
  question: string;
  required: boolean;
  options?: string[] | null;
}

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

const QuestionBuilder = ({ questions, onChange }: QuestionBuilderProps) => {
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({
    type: 'likert',
    category: 'course',
    question: '',
    required: true,
    options: null
  });

  const categoryNames: Record<string, string> = {
    course: 'الدورة التدريبية',
    trainer: 'المدرب',
    center: 'المركز التدريبي',
    venue: 'المكان والتجهيزات',
    general: 'عام'
  };

  const typeNames: Record<string, string> = {
    likert: 'مقياس ليكرت (5 خيارات)',
    rating: 'تقييم نجمي',
    text: 'نص حر',
    multiple_choice: 'اختيار متعدد'
  };

  const handleAddQuestion = () => {
    if (!editingQuestion.question?.trim()) {
      return;
    }

    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      type: editingQuestion.type || 'likert',
      category: editingQuestion.category || 'course',
      question: editingQuestion.question,
      required: editingQuestion.required ?? true,
      options: editingQuestion.type === 'multiple_choice' ? editingQuestion.options : null
    };

    onChange([...questions, newQuestion]);
    setEditingQuestion({
      type: 'likert',
      category: 'course',
      question: '',
      required: true,
      options: null
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const updated = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Add New Question Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إضافة سؤال جديد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع السؤال</Label>
              <Select
                value={editingQuestion.type}
                onValueChange={(value: any) => setEditingQuestion({ ...editingQuestion, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="likert">{typeNames.likert}</SelectItem>
                  <SelectItem value="rating">{typeNames.rating}</SelectItem>
                  <SelectItem value="text">{typeNames.text}</SelectItem>
                  <SelectItem value="multiple_choice">{typeNames.multiple_choice}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select
                value={editingQuestion.category}
                onValueChange={(value) => setEditingQuestion({ ...editingQuestion, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>نص السؤال</Label>
            <Input
              value={editingQuestion.question}
              onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
              placeholder="مثال: ما مدى رضاك عن محتوى الدورة؟"
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="required"
              checked={editingQuestion.required}
              onCheckedChange={(checked) => setEditingQuestion({ ...editingQuestion, required: checked })}
            />
            <Label htmlFor="required">سؤال إلزامي</Label>
          </div>

          <Button onClick={handleAddQuestion} className="w-full">
            <Plus className="ml-2 h-4 w-4" />
            إضافة السؤال
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        <h3 className="font-semibold">الأسئلة الحالية ({questions.length})</h3>
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لا توجد أسئلة. قم بإضافة السؤال الأول باستخدام النموذج أعلاه.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card key={question.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        onClick={() => handleMoveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                              {typeNames[question.type]}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {categoryNames[question.category]}
                            </span>
                            {question.required && (
                              <span className="text-xs text-destructive">إلزامي</span>
                            )}
                          </div>
                          <p className="font-medium">{question.question}</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBuilder;
