import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllCoursePolls, addCoursePoll, updateCoursePoll, deleteCoursePoll, fetchPollVoters } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Trash2, Vote, ToggleLeft, ToggleRight, Users, Copy, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const CoursePollsManagement = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isVotersDialogOpen, setIsVotersDialogOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
  });

  const { data: polls = [] } = useQuery({
    queryKey: ['allCoursePolls'],
    queryFn: fetchAllCoursePolls,
  });

  const { data: voters = [] } = useQuery({
    queryKey: ['pollVoters', selectedPollId],
    queryFn: () => selectedPollId ? fetchPollVoters(selectedPollId) : [],
    enabled: !!selectedPollId && isVotersDialogOpen,
  });

  const addMutation = useMutation({
    mutationFn: addCoursePoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCoursePolls'] });
      queryClient.invalidateQueries({ queryKey: ['coursePolls'] });
      toast.success("تم إضافة التصويت بنجاح");
      setIsAddDialogOpen(false);
      setNewPoll({ title: "", description: "" });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة التصويت");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateCoursePoll(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCoursePolls'] });
      queryClient.invalidateQueries({ queryKey: ['coursePolls'] });
      toast.success("تم تحديث التصويت");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التحديث");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoursePoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCoursePolls'] });
      queryClient.invalidateQueries({ queryKey: ['coursePolls'] });
      toast.success("تم حذف التصويت");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });

  const handleAdd = () => {
    if (!newPoll.title.trim()) {
      toast.error("الرجاء إدخال عنوان التصويت");
      return;
    }
    addMutation.mutate(newPoll);
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, updates: { is_active: !currentStatus } });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التصويت؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewVoters = (pollId: string) => {
    setSelectedPollId(pollId);
    setIsVotersDialogOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const exportToCSV = () => {
    if (voters.length === 0) return;
    
    const headers = ["الاسم", "الوظيفة", "المدينة", "رقم الجوال", "البريد الإلكتروني", "تاريخ التصويت"];
    const rows = voters.map((v: any) => [
      v.voter_name || "-",
      v.voter_job || "-",
      v.voter_city || "-",
      v.voter_phone || "-",
      v.voter_email || "-",
      new Date(v.created_at).toLocaleDateString('ar-SA')
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `poll_voters_${selectedPollId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const totalVotes = polls.reduce((sum: number, poll: any) => sum + (poll.votes_count || 0), 0);
  const selectedPoll = polls.find((p: any) => p.id === selectedPollId);
  const votersWithInfo = voters.filter((v: any) => v.voter_name || v.voter_email || v.voter_phone);
  const votersWithoutInfo = voters.length - votersWithInfo.length;

  return (
    <Card className="border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>التصويت على الدورات</CardTitle>
          <CardDescription>
            إدارة التصويتات على الدورات المقترحة ({polls.length} تصويت)
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة تصويت جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة تصويت جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll-title">عنوان الدورة *</Label>
                <Input
                  id="poll-title"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                  placeholder="مثال: دورة البرمجة المتقدمة"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poll-description">الوصف (اختياري)</Label>
                <Textarea
                  id="poll-description"
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                  placeholder="وصف مختصر للدورة..."
                  rows={3}
                  className="bg-white"
                />
              </div>
              <Button 
                onClick={handleAdd} 
                className="w-full"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? "جاري الإضافة..." : "إضافة التصويت"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {polls.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا توجد تصويتات حالياً
            </p>
          ) : (
            polls.map((poll: any) => {
              const percentage = totalVotes > 0 ? Math.round((poll.votes_count / totalVotes) * 100) : 0;
              
              return (
                <Card key={poll.id} className={`p-4 ${!poll.is_active ? 'opacity-60' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{poll.title}</h4>
                          <Badge variant={poll.is_active ? "default" : "secondary"}>
                            {poll.is_active ? "نشط" : "متوقف"}
                          </Badge>
                        </div>
                        {poll.description && (
                          <p className="text-sm text-muted-foreground">
                            {poll.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Vote className="w-3 h-3" />
                        {poll.votes_count || 0}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {percentage}% من إجمالي الأصوات
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewVoters(poll.id)}
                      >
                        <Users className="w-4 h-4 ml-2" />
                        عرض المصوتين ({poll.votes_count || 0})
                      </Button>

                      <Button
                        size="sm"
                        variant={poll.is_active ? "secondary" : "default"}
                        onClick={() => toggleActive(poll.id, poll.is_active)}
                        disabled={updateMutation.isPending}
                      >
                        {poll.is_active ? (
                          <>
                            <ToggleLeft className="w-4 h-4 ml-2" />
                            إيقاف
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-4 h-4 ml-2" />
                            تفعيل
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(poll.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Dialog open={isVotersDialogOpen} onOpenChange={setIsVotersDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>المصوتون على: {selectedPoll?.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{voters.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي الأصوات</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{votersWithInfo.length}</p>
                  <p className="text-sm text-muted-foreground">مصوتون بمعلومات</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{votersWithoutInfo}</p>
                  <p className="text-sm text-muted-foreground">مصوتون بدون معلومات</p>
                </div>
              </div>

              {votersWithInfo.length > 0 && (
                <Button onClick={exportToCSV} variant="outline" className="w-full">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير البيانات إلى CSV
                </Button>
              )}

              {votersWithInfo.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد معلومات اتصال متوفرة من المصوتين
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الوظيفة</TableHead>
                        <TableHead>المدينة</TableHead>
                        <TableHead>رقم الجوال</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>تاريخ التصويت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {votersWithInfo.map((voter: any) => (
                        <TableRow key={voter.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {voter.voter_name || "-"}
                              {voter.voter_name && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(voter.voter_name, "الاسم")}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{voter.voter_job || "-"}</TableCell>
                          <TableCell>{voter.voter_city || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {voter.voter_phone || "-"}
                              {voter.voter_phone && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(voter.voter_phone, "رقم الجوال")}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {voter.voter_email || "-"}
                              {voter.voter_email && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(voter.voter_email, "البريد الإلكتروني")}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(voter.created_at).toLocaleDateString('ar-SA')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CoursePollsManagement;
