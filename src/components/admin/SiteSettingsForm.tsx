import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";

const SiteSettingsForm = () => {
  const queryClient = useQueryClient();
  const [siteName, setSiteName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>("");
  const [showHeroImage, setShowHeroImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  });

  // Update state when settings are loaded
  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name);
      setLogoPreview(settings.logo_url || '');
      setHeroImagePreview((settings as any).hero_image_url || '');
      setShowHeroImage((settings as any).show_hero_image || false);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let finalLogoUrl = logoPreview;
      let finalHeroImageUrl = heroImagePreview;

      // Upload new logo if selected
      if (logoFile) {
        setIsUploading(true);
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        finalLogoUrl = publicUrl;
        setIsUploading(false);
      }

      // Upload new hero image if selected
      if (heroImageFile) {
        setIsUploading(true);
        const fileExt = heroImageFile.name.split('.').pop();
        const fileName = `hero-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, heroImageFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        finalHeroImageUrl = publicUrl;
        setIsUploading(false);
      }

      return updateSiteSettings(siteName, finalLogoUrl, finalHeroImageUrl, showHeroImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success("تم تحديث إعدادات الموقع بنجاح");
      setLogoFile(null);
      setHeroImageFile(null);
    },
    onError: () => {
      setIsUploading(false);
      toast.error("حدث خطأ أثناء التحديث");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Card className="p-6 border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
      <h2 className="text-2xl font-bold mb-6">إعدادات الموقع</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">اسم الموقع</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="أدخل اسم الموقع"
            className="text-right bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">شعار الموقع</Label>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-right bg-white"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('logo')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {logoPreview && (
              <div className="flex items-center gap-4">
                <img 
                  src={logoPreview} 
                  alt="معاينة الشعار" 
                  className="h-20 w-20 object-contain border border-border rounded-lg p-2 bg-white"
                />
                <p className="text-sm text-muted-foreground">معاينة الشعار</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="showHeroImage"
              checked={showHeroImage}
              onChange={(e) => setShowHeroImage(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="showHeroImage" className="cursor-pointer">
              عرض صورة في الصفحة الرئيسية (تحت عنوان المنصة)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImage">صورة الصفحة الرئيسية</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  id="heroImage"
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="text-right bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('heroImage')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {heroImagePreview && (
                <div className="space-y-2">
                  <img 
                    src={heroImagePreview} 
                    alt="معاينة الصورة" 
                    className="w-full max-w-md object-contain border border-border rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">معاينة الصورة - ستظهر بحجم كبير متناسب مع الشاشة</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={updateMutation.isPending || isUploading}
        >
          <Save className="ml-2 h-5 w-5" />
          {isUploading ? "جاري رفع الملفات..." : updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </form>
    </Card>
  );
};

export default SiteSettingsForm;
