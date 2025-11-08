import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/lib/supabase";

interface HeroProps {
  onChatbotOpen: () => void;
}

const Hero = ({ onChatbotOpen }: HeroProps) => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  });
  return <section className="relative min-h-[90vh] flex items-start justify-center overflow-hidden bg-background pt-16">
      {/* Clean background with subtle gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Animated glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="container relative z-20 mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-foreground text-3xl md:text-4xl block mt-1 mb-4">
              {settings?.site_name || 'منصة التدريب'}
            </span>
          </h1>

          {/* Hero Image - conditionally rendered */}
          {(settings as any)?.show_hero_image && (settings as any)?.hero_image_url && (
            <div className="w-full max-w-md mx-auto -mt-4 mb-4">
              <img 
                src={(settings as any).hero_image_url} 
                alt="صورة المنصة" 
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent text-3xl md:text-4xl">
              تابع جديد دوراتنا
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            من خلال هذه المنصة يمكنك متابعة جديد الدورات التي نقدمها وكذلك سيكون لك الأولوية في التسجيل فيها
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center pt-4">
            <Button 
              size="lg" 
              variant="gradient" 
              className="group text-lg px-8 py-6 h-auto"
              onClick={onChatbotOpen}
            >
              <MessageCircle className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              هل تحتاج مساعدة ؟
            </Button>
          </div>

        </div>
      </div>

    </section>;
};
export default Hero;