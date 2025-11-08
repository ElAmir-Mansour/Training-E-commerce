import { Search, ThumbsUp, Lightbulb, UserPlus, Star, Award, FileText, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const QuickFeatures = () => {
  const features = [
    {
      icon: Search,
      title: "اختر دورتك",
      gradient: "from-[hsl(210,100%,25%)] to-[hsl(180,85%,55%)]",
    },
    {
      icon: ThumbsUp,
      title: "صوّت على الدورات",
      gradient: "from-[hsl(210,85%,35%)] to-[hsl(180,80%,60%)]",
    },
    {
      icon: Lightbulb,
      title: "اقترح دورة",
      gradient: "from-[hsl(210,70%,45%)] to-[hsl(180,75%,65%)]",
    },
    {
      icon: UserPlus,
      title: "سجّل وابدأ",
      gradient: "from-[hsl(210,95%,30%)] to-[hsl(200,85%,50%)]",
    },
    {
      icon: Star,
      title: "قيّم الدورة",
      gradient: "from-[hsl(180,80%,50%)] to-[hsl(190,75%,60%)]",
    },
    {
      icon: Award,
      title: "احصل على الشهادة",
      gradient: "from-[hsl(220,90%,40%)] to-[hsl(180,85%,55%)]",
    },
    {
      icon: FileText,
      title: "شاهد الصور",
      gradient: "from-[hsl(190,80%,55%)] to-[hsl(180,70%,70%)]",
    },
    {
      icon: MessageCircle,
      title: "دورات أونلاين",
      gradient: "from-[hsl(210,100%,20%)] to-[hsl(200,90%,45%)]",
    },
  ];

  return (
    <section className="py-8 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">استكشف مميزات الموقع</h2>
          <p className="text-muted-foreground">كل ما تحتاجه في مكان واحد</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`group relative h-24 p-4 flex flex-col items-center justify-center gap-2 
                  border border-primary/20 bg-gradient-to-br ${feature.gradient} bg-opacity-10
                  hover:scale-105 hover:shadow-[0_8px_30px_hsl(210,100%,25%,0.15)]
                  transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className="size-5 text-primary group-hover:text-white group-hover:-translate-y-1 transition-all duration-300 relative z-10" />
                <span className="text-sm font-semibold text-primary group-hover:text-white text-center transition-colors duration-300 relative z-10">
                  {feature.title}
                </span>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickFeatures;
