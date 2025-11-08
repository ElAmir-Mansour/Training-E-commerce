import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCourseSuggestion } from "@/lib/supabase";
import { toast } from "sonner";

const CourseSuggestion = () => {
  const queryClient = useQueryClient();
  const [suggestion, setSuggestion] = useState({
    title: "",
    description: "",
    suggested_by_name: "",
    suggested_by_email: "",
  });

  const addMutation = useMutation({
    mutationFn: addCourseSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSuggestions'] });
      toast.success("تم إرسال اقتراحك بنجاح! شكراً لمشاركتك");
      setSuggestion({
        title: "",
        description: "",
        suggested_by_name: "",
        suggested_by_email: "",
      });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إرسال الاقتراح");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.title.trim()) {
      toast.error("الرجاء إدخال عنوان الدورة المقترحة");
      return;
    }
    addMutation.mutate(suggestion);
  };

  return (
    <section className="py-8 bg-muted/20">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto border-muted bg-muted/70">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl text-primary">اقترح دورة</CardTitle>
            <CardDescription className="text-base">
              هل لديك فكرة لدورة تدريبية تود أن نقدمها؟ شاركنا اقتراحك وسنقوم بدراسته
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الدورة المقترحة *</Label>
                <Input
                  id="title"
                  value={suggestion.title}
                  onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })}
                  placeholder="مثال: دورة في الذكاء الاصطناعي"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الدورة (اختياري)</Label>
                <Textarea
                  id="description"
                  value={suggestion.description}
                  onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })}
                  placeholder="اكتب وصفاً مختصراً عن الدورة المقترحة..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم (اختياري)</Label>
                  <Input
                    id="name"
                    value={suggestion.suggested_by_name}
                    onChange={(e) => setSuggestion({ ...suggestion, suggested_by_name: e.target.value })}
                    placeholder="اسمك"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={suggestion.suggested_by_email}
                    onChange={(e) => setSuggestion({ ...suggestion, suggested_by_email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? "جاري الإرسال..." : "إرسال الاقتراح"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CourseSuggestion;
