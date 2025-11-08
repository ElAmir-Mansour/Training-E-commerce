import { Twitter, Instagram, Linkedin, Youtube, Music, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    platform: [
      { name: "الدورات التدريبية", href: "#" },
      { name: "المدربون", href: "#" },
      { name: "الشهادات", href: "#" },
      { name: "التسعير", href: "#" }
    ],
    company: [
      { name: "من نحن", href: "#" },
      { name: "فريق العمل", href: "#" },
      { name: "الوظائف", href: "#" },
      { name: "المدونة", href: "#" }
    ],
    support: [
      { name: "مركز المساعدة", href: "#" },
      { name: "الأسئلة الشائعة", href: "#" },
      { name: "سياسة الخصوصية", href: "#" },
      { name: "الشروط والأحكام", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Youtube, href: "https://www.youtube.com/channel/UC_RoKsNQna3iTmQ4zywLXCQ", label: "YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/abdulaziz-alkhonin-70274938b/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/alkhoninaziz?igsh=MTRoMGphOG0xMHFmbw==", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/Alkhoninaziz?s=08", label: "X" },
    { icon: Music, href: "https://www.tiktok.com/@alkhoninaziz?_t=zs-8woqyrydup0&_r=1", label: "TikTok" }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-primary/5 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Bottom Section */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 hover:scale-110 group"
                  >
                    <Icon className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                  </a>
                );
              })}
            </div>
            
            {/* Designer Credit */}
            <div className="text-center">
              <a 
                href="https://linktr.ee/alkhonin837" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors inline-block"
              >
                فكرة وتصميم المدرب عبدالعزيز الخنين
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center">
              © 2025 منصة التدريب الذكية. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
