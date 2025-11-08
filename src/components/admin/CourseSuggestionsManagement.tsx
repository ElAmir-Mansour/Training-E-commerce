import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourseSuggestions, updateCourseSuggestion, deleteCourseSuggestion } from "@/lib/supabase";
import { toast } from "sonner";
import { Trash2, CheckCircle2, ThumbsUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CourseSuggestionsManagement = () => {
  const queryClient = useQueryClient();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['courseSuggestions'],
    queryFn: fetchCourseSuggestions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateCourseSuggestion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSuggestions'] });
      toast.success("تم تحديث حالة الاقتراح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التحديث");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSuggestions'] });
      toast.success("تم حذف الاقتراح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, updates: { status } });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الاقتراح؟")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Card className="border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
      <CardHeader>
        <CardTitle>اقتراحات الدورات</CardTitle>
        <CardDescription>
          الاقتراحات المقدمة من الزوار ({suggestions.length} اقتراح)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا توجد اقتراحات حالياً
            </p>
          ) : (
            suggestions.map((suggestion: any) => (
              <Card key={suggestion.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                      {suggestion.description && (
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {suggestion.votes_count || 0}
                    </Badge>
                  </div>

                  {(suggestion.suggested_by_name || suggestion.suggested_by_email) && (
                    <div className="text-xs text-muted-foreground">
                      المقترح: {suggestion.suggested_by_name} {suggestion.suggested_by_email && `(${suggestion.suggested_by_email})`}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Select
                      value={suggestion.status}
                      onValueChange={(value) => handleStatusChange(suggestion.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد المراجعة</SelectItem>
                        <SelectItem value="approved">موافق عليه</SelectItem>
                        <SelectItem value="implemented">تم التنفيذ</SelectItem>
                        <SelectItem value="rejected">مرفوض</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(suggestion.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSuggestionsManagement;
