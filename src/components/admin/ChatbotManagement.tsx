import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchChatbotKnowledge, addChatbotKnowledge, updateChatbotKnowledge, deleteChatbotKnowledge } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ChatbotManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("courses");
  const [isActive, setIsActive] = useState(true);

  const queryClient = useQueryClient();

  const { data: knowledge = [] } = useQuery({
    queryKey: ["chatbot-knowledge"],
    queryFn: fetchChatbotKnowledge,
  });

  const addMutation = useMutation({
    mutationFn: addChatbotKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast.success("تم إضافة المعلومة بنجاح");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("فشل إضافة المعلومة");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateChatbotKnowledge(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast.success("تم تحديث المعلومة بنجاح");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("فشل تحديث المعلومة");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChatbotKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast.success("تم حذف المعلومة بنجاح");
    },
    onError: () => {
      toast.error("فشل حذف المعلومة");
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("courses");
    setIsActive(true);
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setIsActive(item.is_active);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!title || !content) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        updates: { title, content, category, is_active: isActive },
      });
    } else {
      addMutation.mutate({ title, content, category, is_active: isActive });
    }
  };

  const categoryLabels: Record<string, string> = {
    courses: "الدورات",
    instructors: "المدربين",
    registration: "التسجيل",
    general: "عام",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>إدارة معلومات الشات بوت</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إضافة معلومة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل المعلومة" : "إضافة معلومة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">العنوان</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان المعلومة"
                />
              </div>
              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="courses">الدورات</SelectItem>
                    <SelectItem value="instructors">المدربين</SelectItem>
                    <SelectItem value="registration">التسجيل</SelectItem>
                    <SelectItem value="general">عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">المحتوى</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="محتوى المعلومة..."
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is-active">نشط</Label>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {knowledge.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{item.title}</h4>
                      <span className="text-xs px-2 py-1 bg-muted rounded">
                        {categoryLabels[item.category]}
                      </span>
                      {item.is_active ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          نشط
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          غير نشط
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {knowledge.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              لا توجد معلومات حالياً
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotManagement;
