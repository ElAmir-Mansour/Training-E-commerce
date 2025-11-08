import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const FAQManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const { data: faqs = [] } = useQuery({
    queryKey: ['all-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const addFaqMutation = useMutation({
    mutationFn: async (newFaq: any) => {
      const { error } = await supabase.from('faqs').insert([newFaq]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success("تم إضافة السؤال بنجاح");
      resetForm();
    },
    onError: () => {
      toast.error("فشل إضافة السؤال");
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, updates }: any) => {
      const { error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success("تم تحديث السؤال بنجاح");
      resetForm();
    },
    onError: () => {
      toast.error("فشل تحديث السؤال");
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success("تم حذف السؤال بنجاح");
    },
    onError: () => {
      toast.error("فشل حذف السؤال");
    },
  });

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setEditingFaq(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    if (editingFaq) {
      updateFaqMutation.mutate({
        id: editingFaq.id,
        updates: { question, answer }
      });
    } else {
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f: any) => f.order_index)) : -1;
      addFaqMutation.mutate({
        question,
        answer,
        order_index: maxOrder + 1,
        is_active: true
      });
    }
  };

  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (faq: any) => {
    updateFaqMutation.mutate({
      id: faq.id,
      updates: { is_active: !faq.is_active }
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentFaq = faqs[index];
    const previousFaq = faqs[index - 1];
    
    updateFaqMutation.mutate({
      id: currentFaq.id,
      updates: { order_index: previousFaq.order_index }
    });
    updateFaqMutation.mutate({
      id: previousFaq.id,
      updates: { order_index: currentFaq.order_index }
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    const currentFaq = faqs[index];
    const nextFaq = faqs[index + 1];
    
    updateFaqMutation.mutate({
      id: currentFaq.id,
      updates: { order_index: nextFaq.order_index }
    });
    updateFaqMutation.mutate({
      id: nextFaq.id,
      updates: { order_index: currentFaq.order_index }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">إدارة الأسئلة الشائعة</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة سؤال
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "تعديل السؤال" : "إضافة سؤال جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="question">السؤال</Label>
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اكتب السؤال هنا..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="answer">الجواب</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="اكتب الجواب هنا..."
                  className="mt-1 min-h-[150px]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
                <Button onClick={handleSubmit}>
                  {editingFaq ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {faqs.map((faq: any, index: number) => (
          <Card key={faq.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === faqs.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{faq.question}</h4>
                      <Badge variant={faq.is_active ? "default" : "secondary"}>
                        {faq.is_active ? "مفعّل" : "معطّل"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleToggleActive(faq)}
                >
                  {faq.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(faq)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
                      deleteFaqMutation.mutate(faq.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {faqs.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">لا توجد أسئلة شائعة. ابدأ بإضافة أول سؤال!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FAQManagement;
