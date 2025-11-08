import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Settings, BookOpen, GraduationCap, HelpCircle, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/lib/supabase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = () => {
  const location = useLocation();
  
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  });
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="h-16 w-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            )}
          </Link>

          {/* Navigation Links */}
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <Button
                      variant={isActive("/") ? "default" : "ghost"}
                      className={isActive("/") ? "bg-primary hover:bg-primary/90" : ""}
                      size="icon"
                    >
                      <Home className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>الصفحة الرئيسية</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/courses">
                    <Button
                      variant={isActive("/courses") ? "default" : "ghost"}
                      className={isActive("/courses") ? "bg-primary hover:bg-primary/90" : ""}
                      size="icon"
                    >
                      <GraduationCap className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>الدورات</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/calendar">
                    <Button
                      variant={isActive("/calendar") ? "default" : "ghost"}
                      className={isActive("/calendar") ? "bg-primary hover:bg-primary/90" : ""}
                      size="icon"
                    >
                      <Calendar className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>التقويم</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/faq">
                    <Button
                      variant={isActive("/faq") ? "default" : "ghost"}
                      className={isActive("/faq") ? "bg-primary hover:bg-primary/90" : ""}
                      size="icon"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>الأسئلة الشائعة</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/admin">
                    <Button
                      variant={isActive("/admin") ? "default" : "ghost"}
                      className={isActive("/admin") ? "bg-primary hover:bg-primary/90" : ""}
                      size="icon"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>لوحة التحكم</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
