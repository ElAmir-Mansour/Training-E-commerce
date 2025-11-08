import { Code, GraduationCap, Wrench, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Code,
    title: "دورات تقنية",
    description: "تعلم أحدث التقنيات والبرمجيات مع دورات شاملة في البرمجة، تطوير المواقع، الذكاء الاصطناعي وأمن المعلومات"
  },
  {
    icon: GraduationCap,
    title: "برامج تعليمية",
    description: "برامج تعليمية متكاملة تغطي مختلف المجالات الأكاديمية والعلمية لبناء أساس معرفي قوي ومتين"
  },
  {
    icon: Wrench,
    title: "أدوات مهارية",
    description: "اكتسب مهارات عملية وأدوات احترافية في القيادة، التواصل، إدارة المشاريع والتطوير الذاتي"
  },
  {
    icon: Lightbulb,
    title: "معلومات ثقافية",
    description: "وسّع آفاقك الثقافية مع دورات في الفنون، اللغات، التاريخ والحضارات المختلفة"
  }
];

const Features = () => {
  return (
    <section className="py-12 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              دورات متنوعة
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            استكشف مجموعة متنوعة من المجالات التدريبية المصممة خصيصاً لتطوير مهاراتك
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group p-4 md:p-6 lg:p-8 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-[var(--shadow-hover)] hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="mb-4 md:mb-6 relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[var(--shadow-glow)]">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute inset-0 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-primary/20 blur-xl group-hover:blur-2xl transition-all duration-500" />
                </div>

                {/* Content */}
                <div className="space-y-2 md:space-y-3">
                  <h3 className="text-base md:text-lg lg:text-xl font-bold group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
