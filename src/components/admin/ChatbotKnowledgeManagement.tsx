import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchChatbotKnowledge,
  addChatbotKnowledge,
  updateChatbotKnowledge,
  deleteChatbotKnowledge,
} from "@/lib/chatbot";

const ChatbotKnowledgeManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    is_active: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledge = [] } = useQuery({
    queryKey: ["chatbot-knowledge"],
    queryFn: fetchChatbotKnowledge,
  });

  const addMutation = useMutation({
    mutationFn: addChatbotKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast({ title: "تمت الإضافة بنجاح" });
      resetForm();
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشلت الإضافة", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateChatbotKnowledge(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast({ title: "تم التحديث بنجاح" });
      resetForm();
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل التحديث", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChatbotKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast({ title: "تم الحذف بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", category: "", is_active: true });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>إدارة معلومات الشات بوت</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة معلومة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل المعلومة" : "إضافة معلومة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">العنوان</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="مثال: دورات، مدربين، عام"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">المحتوى</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  required
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {knowledge.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  {item.is_active ? (
                    <span className="text-green-600">نشط</span>
                  ) : (
                    <span className="text-gray-500">غير نشط</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ChatbotKnowledgeManagement;
