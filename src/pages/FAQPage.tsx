import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FAQPage = () => {
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <HelpCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                الأسئلة الشائعة
              </h1>
              <p className="text-muted-foreground text-lg">
                إجابات على الأسئلة الأكثر شيوعاً حول منصتنا ودوراتنا
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد أسئلة شائعة حالياً</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq: any, index: number) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={`item-${index}`}
                    className="bg-background border border-border rounded-lg px-6 py-2 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-right hover:no-underline">
                      <span className="font-semibold text-lg">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
