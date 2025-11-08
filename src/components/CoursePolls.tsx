import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCoursePolls, voteForPoll, hasVotedForPoll } from "@/lib/supabase";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const CoursePolls = () => {
  const queryClient = useQueryClient();
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [voterIdentifier, setVoterIdentifier] = useState<string>("");
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [voterInfo, setVoterInfo] = useState({
    name: '',
    job: '',
    city: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    // Get or create voter identifier (using localStorage + timestamp)
    let identifier = localStorage.getItem('voter_id');
    if (!identifier) {
      identifier = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('voter_id', identifier);
    }
    setVoterIdentifier(identifier);
  }, []);

  const { data: polls = [] } = useQuery({
    queryKey: ['coursePolls'],
    queryFn: fetchCoursePolls,
  });

  useEffect(() => {
    // Check which polls the user has already voted for
    const checkVotes = async () => {
      if (!voterIdentifier || polls.length === 0) return;
      
      const voted = new Set<string>();
      for (const poll of polls) {
        const hasVoted = await hasVotedForPoll(poll.id, voterIdentifier);
        if (hasVoted) {
          voted.add(poll.id);
        }
      }
      setVotedPolls(voted);
    };
    
    checkVotes();
  }, [polls, voterIdentifier]);

  const voteMutation = useMutation({
    mutationFn: ({ pollId, voterIdentifier, voterInfo }: { 
      pollId: string; 
      voterIdentifier: string; 
      voterInfo?: any 
    }) => voteForPoll(pollId, voterIdentifier, voterInfo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coursePolls'] });
      setVotedPolls(prev => new Set(prev).add(variables.pollId));
      toast.success("تم تسجيل تصويتك بنجاح!");
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast.error("لقد صوّت بالفعل على هذه الدورة");
      } else {
        toast.error("حدث خطأ أثناء التصويت");
      }
    },
  });

  const handleVote = (pollId: string) => {
    if (!voterIdentifier) return;
    if (votedPolls.has(pollId)) {
      toast.info("لقد صوّت بالفعل على هذه الدورة");
      return;
    }
    
    setSelectedPollId(pollId);
    setIsVoteDialogOpen(true);
  };

  const confirmVote = () => {
    if (!selectedPollId || !voterIdentifier) return;
    
    voteMutation.mutate({ 
      pollId: selectedPollId, 
      voterIdentifier,
      voterInfo 
    });
    
    setIsVoteDialogOpen(false);
    setVoterInfo({
      name: '',
      job: '',
      city: '',
      phone: '',
      email: '',
    });
    setSelectedPollId(null);
  };

  const skipAndVote = () => {
    if (!selectedPollId || !voterIdentifier) return;
    
    voteMutation.mutate({ 
      pollId: selectedPollId, 
      voterIdentifier,
      voterInfo: {} 
    });
    
    setIsVoteDialogOpen(false);
    setSelectedPollId(null);
  };

  if (polls.length === 0) {
    return null;
  }

  const totalVotes = polls.reduce((sum: number, poll: any) => sum + (poll.votes_count || 0), 0);

  return (
    <section className="py-8 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Vote className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              صوّت على
            </span>{" "}
            <span className="text-foreground">الدورة القادمة</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            ساعدنا في اختيار الدورات التي تهمك! صوّت للدورة التي ترغب في حضورها
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {polls.map((poll: any) => {
            const hasVoted = votedPolls.has(poll.id);
            const percentage = totalVotes > 0 ? Math.round((poll.votes_count / totalVotes) * 100) : 0;

            return (
              <Card 
                key={poll.id} 
                className={`border-border/50 transition-all duration-300 ${
                  hasVoted ? 'bg-primary/5 border-primary/30' : 'hover:shadow-lg'
                }`}
              >
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl line-clamp-2">{poll.title}</CardTitle>
                  {poll.description && (
                    <CardDescription className="line-clamp-3">
                      {poll.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">عدد الأصوات</span>
                      <span className="font-semibold text-primary">{poll.votes_count || 0}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {percentage}% من إجمالي الأصوات
                    </p>
                  </div>

                  <Button
                    onClick={() => handleVote(poll.id)}
                    disabled={hasVoted || voteMutation.isPending}
                    className="w-full"
                    variant={hasVoted ? "secondary" : "default"}
                  >
                    {hasVoted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        تم التصويت
                      </>
                    ) : voteMutation.isPending ? (
                      "جاري التصويت..."
                    ) : (
                      <>
                        <Vote className="w-4 h-4 ml-2" />
                        صوّت لهذه الدورة
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>معلومات التواصل (اختيارية)</DialogTitle>
              <DialogDescription>
                إذا رغبت في معرفة موعد إقامة هذه الدورة، يمكنك ترك معلومات التواصل الخاصة بك
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voter-name">الاسم</Label>
                <Input
                  id="voter-name"
                  value={voterInfo.name}
                  onChange={(e) => setVoterInfo({...voterInfo, name: e.target.value})}
                  placeholder="أدخل اسمك"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voter-job">العمل</Label>
                <Input
                  id="voter-job"
                  value={voterInfo.job}
                  onChange={(e) => setVoterInfo({...voterInfo, job: e.target.value})}
                  placeholder="مثال: مطور برمجيات"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voter-city">المدينة</Label>
                <Input
                  id="voter-city"
                  value={voterInfo.city}
                  onChange={(e) => setVoterInfo({...voterInfo, city: e.target.value})}
                  placeholder="مثال: الرياض"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voter-phone">رقم الجوال</Label>
                <Input
                  id="voter-phone"
                  type="tel"
                  value={voterInfo.phone}
                  onChange={(e) => setVoterInfo({...voterInfo, phone: e.target.value})}
                  placeholder="مثال: 0501234567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voter-email">البريد الإلكتروني</Label>
                <Input
                  id="voter-email"
                  type="email"
                  value={voterInfo.email}
                  onChange={(e) => setVoterInfo({...voterInfo, email: e.target.value})}
                  placeholder="example@email.com"
                />
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button variant="outline" onClick={skipAndVote}>
                تخطي والتصويت
              </Button>
              <Button onClick={confirmVote}>
                تأكيد التصويت
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default CoursePolls;
