import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Shield, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { assignAdminRole } from "@/lib/supabase";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        toast.error("حدث خطأ في تسجيل الدخول");
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      // If user doesn't have admin role
      if (!roleData) {
        // Check if any admin exists in the system
        const { data: existingAdmins, error: adminCheckError } = await supabase
          .from("user_roles")
          .select("id")
          .eq("role", "admin")
          .limit(1);

        // If no admin exists, make this user the first admin
        if (!adminCheckError && (!existingAdmins || existingAdmins.length === 0)) {
          try {
            await assignAdminRole(data.user.id);
            toast.success("تم تسجيل الدخول وتفعيل صلاحيات المدير بنجاح");
            setIsLoading(false);
            navigate("/admin", { replace: true });
            return;
          } catch (assignError) {
            console.error("Error assigning admin role:", assignError);
          }
        }

        // User is not admin and can't become one
        await supabase.auth.signOut();
        toast.error("ليس لديك صلاحيات للوصول إلى لوحة التحكم");
        setIsLoading(false);
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("حدث خطأ في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              تسجيل دخول المدير
            </h1>
            <p className="text-muted-foreground">
              أدخل بيانات الدخول للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <a href="/admin-register" className="text-primary hover:underline">
                إنشاء حساب مدير
              </a>
            </p>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;
