import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Mail, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";


const AdminRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-first-admin", {
        body: { email, password },
      });

      if (error) {
        throw error;
      }

      toast.success("تم إنشاء حساب المدير بنجاح. سيتم تحويلك لصفحة تسجيل الدخول");
      setTimeout(() => {
        navigate("/admin-login");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message.includes("already exists")) {
        toast.error("يوجد حساب مدير بالفعل.");
      } else {
        toast.error("حدث خطأ في إنشاء الحساب");
      }
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
              إنشاء حساب المدير
            </h1>
            <p className="text-muted-foreground">
              أنشئ حساب المدير الأول للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
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
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
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
              {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب المدير"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 ملاحظة: هذه الصفحة لإنشاء حساب المدير الأول فقط
            </p>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AdminRegister;
