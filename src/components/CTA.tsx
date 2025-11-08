import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import ContactDialog from "./ContactDialog";
const CTA = () => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  return <section className="py-12 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-glow">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse" style={{
        animationDelay: '1s'
      }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">ابدأ رحلتك التعليمية اليوم</span>
          </div>

          {/* Heading */}
          <h2 className="md:text-6xl font-bold text-white leading-tight text-3xl">
            جاهز لتطوير مهاراتك؟
            <br />
            <span className="text-white/80 text-2xl py-0 my-0 px-px mx-0">انطلق الآن .. نحو التميز </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">انضم إلى المتدربين الذين غيروا حياتهم المهنية من خلال منصتنا التدريبية</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" variant="outline" className="border-white/30 hover:border-white text-blue-900 hover:text-blue-900 hover:bg-white/10 text-lg px-8 py-6 h-auto backdrop-blur-sm" onClick={() => setContactDialogOpen(true)}>
              تواصل معنا
            </Button>
          </div>

        </div>
      </div>

      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </section>;
};
export default CTA;