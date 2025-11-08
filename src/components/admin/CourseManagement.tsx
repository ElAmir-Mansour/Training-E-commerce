import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourses, updateCourse, addCourse, deleteCourse, fetchEvaluationForms } from "@/lib/supabase";
import { toast } from "sonner";
import { Edit, Trash2, Plus, X, Save, Upload, Play, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EvaluationQuickStart from "./EvaluationQuickStart";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CourseManagement = () => {
  const queryClient = useQueryClient();
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    image_url: "",
    instructor: "",
    instructor_credentials: "",
    duration: "",
    registration_url: "",
    additional_images: [] as string[],
    is_registration_closed: false,
    course_topics: [] as string[],
    certificate_url: "",
    is_certificate_active: false,
    video_url: "",
    course_materials: [] as Array<{ name: string; file_url: string }>,
    is_free: false,
    original_price: 0,
    discounted_price: 0,
    course_type: "in-person" as "in-person" | "online" | "asynchronous",
    platform_url: "",
    is_platform_active: false,
    recorded_content_url: "",
    recorded_content_urls: [] as string[],
    recorded_content_type: "youtube" as "youtube" | "vimeo" | "google_drive" | "external_video" | "external_audio",
    is_recorded_content_active: false,
    start_date: "",
    end_date: "",
    registration_deadline: "",
  });
  const [newRecordedContentUrl, setNewRecordedContentUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAdditionalImage, setUploadingAdditionalImage] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const { data: evaluationForms = [] } = useQuery({
    queryKey: ['evaluationForms'],
    queryFn: fetchEvaluationForms,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateCourse(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("✓ تم حفظ التعديلات بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التحديث");
    },
  });

  const addMutation = useMutation({
    mutationFn: addCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("تم إضافة الدورة بنجاح");
      setIsAddDialogOpen(false);
      setNewCourse({
        title: "",
        description: "",
        image_url: "",
        instructor: "",
        instructor_credentials: "",
        duration: "",
        registration_url: "",
        additional_images: [],
        is_registration_closed: false,
        course_topics: [],
        certificate_url: "",
        is_certificate_active: false,
        video_url: "",
        course_materials: [],
        is_free: false,
        original_price: 0,
        discounted_price: 0,
        course_type: "in-person",
        platform_url: "",
        is_platform_active: false,
        recorded_content_url: "",
        recorded_content_urls: [],
        recorded_content_type: "youtube",
        is_recorded_content_active: false,
        start_date: "",
        end_date: "",
        registration_deadline: "",
      });
      setNewRecordedContentUrl("");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الإضافة");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("تم حذف الدورة بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateMutation.mutate({
        id: editingCourse.id,
        updates: {
          title: editingCourse.title,
          description: editingCourse.description,
          image_url: editingCourse.image_url,
          instructor: editingCourse.instructor,
          instructor_credentials: editingCourse.instructor_credentials,
          duration: editingCourse.duration,
          registration_url: editingCourse.registration_url,
          additional_images: editingCourse.additional_images || [],
          is_registration_closed: editingCourse.is_registration_closed || false,
          is_ended: (editingCourse as any).is_ended || false,
          course_topics: editingCourse.course_topics || [],
          certificate_url: editingCourse.certificate_url,
          is_certificate_active: editingCourse.is_certificate_active || false,
          video_url: editingCourse.video_url || "",
          course_materials: editingCourse.course_materials || [],
          is_free: editingCourse.is_free || false,
          original_price: editingCourse.original_price || 0,
          discounted_price: editingCourse.discounted_price || 0,
          course_type: editingCourse.course_type || "in-person",
          platform_url: editingCourse.platform_url || "",
          is_platform_active: editingCourse.is_platform_active || false,
          recorded_content_url: editingCourse.recorded_content_url || "",
          recorded_content_urls: editingCourse.recorded_content_urls || [],
          recorded_content_type: editingCourse.recorded_content_type || "youtube",
          is_recorded_content_active: editingCourse.is_recorded_content_active || false,
          start_date: editingCourse.start_date ? new Date(editingCourse.start_date).toISOString() : null,
          end_date: editingCourse.end_date ? new Date(editingCourse.end_date).toISOString() : null,
          registration_deadline: editingCourse.registration_deadline ? new Date(editingCourse.registration_deadline).toISOString() : null,
        },
      });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData = {
      ...newCourse,
      start_date: newCourse.start_date ? new Date(newCourse.start_date).toISOString() : undefined,
      end_date: newCourse.end_date ? new Date(newCourse.end_date).toISOString() : undefined,
      registration_deadline: newCourse.registration_deadline ? new Date(newCourse.registration_deadline).toISOString() : undefined,
    };
    addMutation.mutate(courseData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `course-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (isEditing && editingCourse) {
        setEditingCourse({ ...editingCourse, image_url: publicUrl });
      } else {
        setNewCourse({ ...newCourse, image_url: publicUrl });
      }

      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 5MB");
      e.target.value = '';
      return;
    }

    setUploadingAdditionalImage(true);
    
    // إضافة timeout
    const uploadTimeout = setTimeout(() => {
      setUploadingAdditionalImage(false);
      toast.error("انتهت مهلة الرفع. يرجى المحاولة مرة أخرى");
      if (e.target) {
        e.target.value = '';
      }
    }, 30000); // 30 ثانية

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `course-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (isEditing && editingCourse) {
        const currentImages = editingCourse.additional_images || [];
        setEditingCourse({ ...editingCourse, additional_images: [...currentImages, publicUrl] });
      } else {
        const currentImages = newCourse.additional_images || [];
        setNewCourse({ ...newCourse, additional_images: [...currentImages, publicUrl] });
      }

      clearTimeout(uploadTimeout);
      toast.success("تم رفع الصورة الإضافية بنجاح");
      
      // إعادة تعيين حقل الإدخال
      if (e.target) {
        e.target.value = '';
      }
    } catch (error: any) {
      clearTimeout(uploadTimeout);
      console.error('Error uploading additional image:', error);
      toast.error(`حدث خطأ أثناء رفع الصورة: ${error.message || 'خطأ غير معروف'}`);
      if (e.target) {
        e.target.value = '';
      }
    } finally {
      setUploadingAdditionalImage(false);
    }
  };

  const removeAdditionalImage = (index: number, isEditing = false) => {
    if (isEditing && editingCourse) {
      const newImages = [...(editingCourse.additional_images || [])];
      newImages.splice(index, 1);
      setEditingCourse({ ...editingCourse, additional_images: newImages });
    } else {
      const newImages = [...(newCourse.additional_images || [])];
      newImages.splice(index, 1);
      setNewCourse({ ...newCourse, additional_images: newImages });
    }
  };

  const addTopic = (isEditing = false) => {
    if (newTopic.trim()) {
      if (isEditing && editingCourse) {
        const topics = [...(editingCourse.course_topics || []), newTopic.trim()];
        setEditingCourse({ ...editingCourse, course_topics: topics });
      } else {
        const topics = [...(newCourse.course_topics || []), newTopic.trim()];
        setNewCourse({ ...newCourse, course_topics: topics });
      }
      setNewTopic("");
    }
  };

  const removeTopic = (index: number, isEditing = false) => {
    if (isEditing && editingCourse) {
      const topics = [...(editingCourse.course_topics || [])];
      topics.splice(index, 1);
      setEditingCourse({ ...editingCourse, course_topics: topics });
    } else {
      const topics = [...(newCourse.course_topics || [])];
      topics.splice(index, 1);
      setNewCourse({ ...newCourse, course_topics: topics });
    }
  };

  const addRecordedContentUrl = (isEditing = false) => {
    if (newRecordedContentUrl.trim()) {
      if (isEditing && editingCourse) {
        const urls = [...(editingCourse.recorded_content_urls || []), newRecordedContentUrl.trim()];
        setEditingCourse({ ...editingCourse, recorded_content_urls: urls });
      } else {
        const urls = [...(newCourse.recorded_content_urls || []), newRecordedContentUrl.trim()];
        setNewCourse({ ...newCourse, recorded_content_urls: urls });
      }
      setNewRecordedContentUrl("");
    }
  };

  const removeRecordedContentUrl = (index: number, isEditing = false) => {
    if (isEditing && editingCourse) {
      const urls = [...(editingCourse.recorded_content_urls || [])];
      urls.splice(index, 1);
      setEditingCourse({ ...editingCourse, recorded_content_urls: urls });
    } else {
      const urls = [...(newCourse.recorded_content_urls || [])];
      urls.splice(index, 1);
      setNewCourse({ ...newCourse, recorded_content_urls: urls });
    }
  };

  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("يجب أن يكون الملف بصيغة PDF");
      return;
    }

    if (!newMaterialName.trim()) {
      toast.error("يرجى إدخال اسم المادة");
      return;
    }

    setUploadingMaterial(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      const newMaterial = {
        name: newMaterialName.trim(),
        file_url: publicUrl,
      };

      if (isEditing && editingCourse) {
        const currentMaterials = editingCourse.course_materials || [];
        setEditingCourse({ ...editingCourse, course_materials: [...currentMaterials, newMaterial] });
      } else {
        const currentMaterials = newCourse.course_materials || [];
        setNewCourse({ ...newCourse, course_materials: [...currentMaterials, newMaterial] });
      }

      setNewMaterialName("");
      toast.success("تم رفع المادة بنجاح");
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error("حدث خطأ أثناء رفع المادة");
    } finally {
      setUploadingMaterial(false);
    }
  };

  const removeMaterial = (index: number, isEditing = false) => {
    if (isEditing && editingCourse) {
      const materials = [...(editingCourse.course_materials || [])];
      materials.splice(index, 1);
      setEditingCourse({ ...editingCourse, course_materials: materials });
    } else {
      const materials = [...(newCourse.course_materials || [])];
      materials.splice(index, 1);
      setNewCourse({ ...newCourse, course_materials: materials });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">إدارة الدورات</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="ml-2 h-5 w-5" />
              إضافة دورة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة دورة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-title">عنوان الدورة</Label>
                <Input
                  id="new-title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  required
                  className="text-right bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-description">الوصف</Label>
                <Textarea
                  id="new-description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  required
                  className="text-right min-h-24 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-image">صورة الدورة</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    disabled={uploadingImage}
                    className="text-right"
                  />
                  {uploadingImage && <span className="text-sm text-muted-foreground">جاري الرفع...</span>}
                </div>
                {newCourse.image_url && (
                  <img src={newCourse.image_url} alt="معاينة" className="w-32 h-32 object-cover rounded-md" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-instructor">المدرب</Label>
                <Input
                  id="new-instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  required
                  className="text-right bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-instructor-credentials">خبرات وشهادات المدرب</Label>
                <Textarea
                  id="new-instructor-credentials"
                  value={newCourse.instructor_credentials}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor_credentials: e.target.value })}
                  placeholder="مثال: دكتوراه في علوم الحاسوب، 10 سنوات خبرة..."
                  className="text-right min-h-20 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-duration">المدة</Label>
                <Input
                  id="new-duration"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  required
                  className="text-right bg-white"
                />
              </div>
              
              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="new-start-date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    تاريخ بداية الدورة
                  </Label>
                  <Input
                    id="new-start-date"
                    type="datetime-local"
                    value={newCourse.start_date}
                    onChange={(e) => setNewCourse({ ...newCourse, start_date: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-end-date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    تاريخ نهاية الدورة (اختياري)
                  </Label>
                  <Input
                    id="new-end-date"
                    type="datetime-local"
                    value={newCourse.end_date}
                    onChange={(e) => setNewCourse({ ...newCourse, end_date: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-reg-deadline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    آخر موعد للتسجيل (اختياري)
                  </Label>
                  <Input
                    id="new-reg-deadline"
                    type="datetime-local"
                    value={newCourse.registration_deadline}
                    onChange={(e) => setNewCourse({ ...newCourse, registration_deadline: e.target.value })}
                    className="bg-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>أبرز محاور الدورة</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTopic(false);
                      }
                    }}
                    placeholder="أضف محور جديد"
                    className="text-right bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => addTopic(false)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newCourse.course_topics && newCourse.course_topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newCourse.course_topics.map((topic, idx) => (
                      <div key={idx} className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
                        <span className="text-sm">{topic}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 hover:bg-destructive/20"
                          onClick={() => removeTopic(idx, false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-registration">رابط التسجيل</Label>
                <Input
                  id="new-registration"
                  value={newCourse.registration_url}
                  onChange={(e) => setNewCourse({ ...newCourse, registration_url: e.target.value })}
                  placeholder="https://..."
                  className="text-right bg-white"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-additional-images">صور إضافية</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-additional-images"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAdditionalImageUpload(e, false)}
                    disabled={uploadingAdditionalImage}
                    className="text-right"
                  />
                  {uploadingAdditionalImage && <span className="text-sm text-muted-foreground">جاري الرفع...</span>}
                </div>
                {newCourse.additional_images && newCourse.additional_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {newCourse.additional_images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`إضافية ${idx + 1}`} className="w-full h-24 object-cover rounded-md" />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeAdditionalImage(idx, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="new-registration-closed"
                  checked={newCourse.is_registration_closed}
                  onChange={(e) => setNewCourse({ ...newCourse, is_registration_closed: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="new-registration-closed" className="cursor-pointer">
                  التسجيل مغلق (اكتمل العدد)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="new-course-ended"
                  checked={(newCourse as any).is_ended || false}
                  onChange={(e) => setNewCourse({ ...newCourse, is_ended: e.target.checked } as any)}
                  className="rounded"
                />
                <Label htmlFor="new-course-ended" className="cursor-pointer">
                  <span className="text-red-600 font-semibold">انتهت الدورة</span> (تبقى كأرشيف)
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-certificate-url">رابط الشهادة</Label>
                <Input
                  id="new-certificate-url"
                  value={newCourse.certificate_url}
                  onChange={(e) => setNewCourse({ ...newCourse, certificate_url: e.target.value })}
                  placeholder="https://..."
                  className="text-right bg-white"
                  dir="ltr"
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="new-certificate-active"
                  checked={newCourse.is_certificate_active}
                  onChange={(e) => setNewCourse({ ...newCourse, is_certificate_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="new-certificate-active" className="cursor-pointer">
                  تفعيل زر الحصول على الشهادة
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-video-url">رابط فيديو الدورة (يوتيوب)</Label>
                <Input
                  id="new-video-url"
                  value={newCourse.video_url}
                  onChange={(e) => setNewCourse({ ...newCourse, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="text-right bg-white"
                  dir="ltr"
                />
              </div>
              
              {/* Recorded Content Section - Add */}
              <div className="space-y-4 pt-4 border-t border-border bg-gradient-to-br from-primary/5 to-background p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-semibold">📹 المحتوى المسجل (بعد انتهاء الدورة)</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>إضافة رابط فيديو</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newRecordedContentUrl}
                      onChange={(e) => setNewRecordedContentUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... أو رابط آخر"
                      className="text-right flex-1 bg-white"
                      dir="ltr"
                    />
                    <Button 
                      type="button" 
                      onClick={() => addRecordedContentUrl(false)}
                      variant="secondary"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة
                    </Button>
                  </div>
                </div>
                
                {newCourse.recorded_content_urls && newCourse.recorded_content_urls.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الفيديوهات المضافة:</Label>
                    {newCourse.recorded_content_urls.map((url, idx) => (
                      <div key={idx} className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Play className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm truncate" dir="ltr">{url}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRecordedContentUrl(idx, false)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="new-recorded-content-type">نوع المحتوى</Label>
                  <select
                    id="new-recorded-content-type"
                    value={newCourse.recorded_content_type}
                    onChange={(e) => setNewCourse({ ...newCourse, recorded_content_type: e.target.value as any })}
                    className="w-full p-2 border border-border rounded-md text-right bg-white"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="google_drive">Google Drive</option>
                    <option value="external_video">رابط فيديو خارجي</option>
                    <option value="external_audio">رابط صوت خارجي</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="new-recorded-content-active"
                    checked={newCourse.is_recorded_content_active}
                    onChange={(e) => setNewCourse({ ...newCourse, is_recorded_content_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="new-recorded-content-active" className="cursor-pointer">
                    إتاحة المحتوى المسجل للزوار
                  </Label>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  ملاحظة: سيظهر المحتوى المسجل فقط للدورات المنتهية عند تفعيل هذا الخيار
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>المواد الإثرائية (PDF)</Label>
                <div className="space-y-2">
                  <Input
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    placeholder="اسم المادة (مثال: حقيبة الدورة، كتاب مرجعي)"
                    className="text-right bg-white"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleMaterialUpload(e, false)}
                      disabled={uploadingMaterial}
                      className="text-right"
                    />
                    {uploadingMaterial && <span className="text-sm text-muted-foreground">جاري الرفع...</span>}
                  </div>
                </div>
                {newCourse.course_materials && newCourse.course_materials.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {newCourse.course_materials.map((material, idx) => (
                      <div key={idx} className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{material.name}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMaterial(idx, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Course Type Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>نوع الدورة</Label>
                  <select
                    value={newCourse.course_type}
                    onChange={(e) => setNewCourse({ ...newCourse, course_type: e.target.value as any })}
                    className="w-full p-2 border border-border rounded-md text-right bg-white"
                  >
                    <option value="in-person">حضورية</option>
                    <option value="online">عن بعد (متزامنة)</option>
                    <option value="asynchronous">غير متزامنة</option>
                  </select>
                </div>
                
                {(newCourse.course_type === "online" || newCourse.course_type === "asynchronous") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="new-platform-url">رابط المنصة</Label>
                      <Input
                        id="new-platform-url"
                        value={newCourse.platform_url}
                        onChange={(e) => setNewCourse({ ...newCourse, platform_url: e.target.value })}
                        placeholder="https://..."
                        className="text-right bg-white"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="new-platform-active"
                        checked={newCourse.is_platform_active}
                        onChange={(e) => setNewCourse({ ...newCourse, is_platform_active: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="new-platform-active" className="cursor-pointer">
                        إتاحة رابط المنصة للطلاب
                      </Label>
                    </div>
                  </>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="new-is-free"
                    checked={newCourse.is_free}
                    onChange={(e) => setNewCourse({ ...newCourse, is_free: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="new-is-free" className="cursor-pointer">
                    دورة مجانية
                  </Label>
                </div>
                
                {!newCourse.is_free && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-original-price">السعر الأصلي (ريال)</Label>
                      <Input
                        id="new-original-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newCourse.original_price}
                        onChange={(e) => setNewCourse({ ...newCourse, original_price: parseFloat(e.target.value) || 0 })}
                        className="text-right bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-discounted-price">السعر بعد الخصم (اختياري)</Label>
                      <Input
                        id="new-discounted-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newCourse.discounted_price}
                        onChange={(e) => setNewCourse({ ...newCourse, discounted_price: parseFloat(e.target.value) || 0 })}
                        placeholder="اتركه فارغاً إذا لم يكن هناك خصم"
                        className="text-right bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                إضافة الدورة
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {courses.map((course: any) => (
          <div key={course.id} className="border-4 border-primary/30 rounded-lg p-6 shadow-xl bg-muted/40 hover:shadow-2xl transition-shadow">
            {editingCourse?.id === course.id ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${course.id}`}>عنوان الدورة</Label>
                    <Input
                      id={`title-${course.id}`}
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      className="text-right bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`instructor-${course.id}`}>المدرب</Label>
                    <Input
                      id={`instructor-${course.id}`}
                      value={editingCourse.instructor}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                      className="text-right bg-white"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`instructor-credentials-${course.id}`}>خبرات وشهادات المدرب</Label>
                    <Textarea
                      id={`instructor-credentials-${course.id}`}
                      value={editingCourse.instructor_credentials || ""}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructor_credentials: e.target.value })}
                      placeholder="مثال: دكتوراه في علوم الحاسوب، 10 سنوات خبرة..."
                      className="text-right min-h-24 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`description-${course.id}`}>الوصف</Label>
                  <Textarea
                    id={`description-${course.id}`}
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="text-right min-h-32 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`image-${course.id}`}>صورة الدورة</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`image-${course.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      disabled={uploadingImage}
                      className="text-right"
                    />
                    {uploadingImage && <span className="text-sm text-muted-foreground">جاري الرفع...</span>}
                  </div>
                  {editingCourse.image_url && (
                    <img src={editingCourse.image_url} alt="معاينة" className="w-32 h-32 object-cover rounded-md" />
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`duration-${course.id}`}>المدة</Label>
                    <Input
                      id={`duration-${course.id}`}
                      value={editingCourse.duration}
                      onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                      className="text-right bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>أبرز محاور الدورة</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTopic(true);
                          }
                        }}
                        placeholder="أضف محور جديد"
                        className="text-right bg-white"
                      />
                      <Button
                        type="button"
                        onClick={() => addTopic(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingCourse.course_topics && editingCourse.course_topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editingCourse.course_topics.map((topic: string, idx: number) => (
                          <div key={idx} className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
                            <span className="text-sm">{topic}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-destructive/20"
                              onClick={() => removeTopic(idx, true)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Date Fields for Editing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor={`start-date-${course.id}`} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      تاريخ بداية الدورة
                    </Label>
                    <Input
                      id={`start-date-${course.id}`}
                      type="datetime-local"
                      value={editingCourse.start_date ? new Date(editingCourse.start_date).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setEditingCourse({ ...editingCourse, start_date: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`end-date-${course.id}`} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      تاريخ نهاية الدورة (اختياري)
                    </Label>
                    <Input
                      id={`end-date-${course.id}`}
                      type="datetime-local"
                      value={editingCourse.end_date ? new Date(editingCourse.end_date).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setEditingCourse({ ...editingCourse, end_date: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`reg-deadline-${course.id}`} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      آخر موعد للتسجيل (اختياري)
                    </Label>
                    <Input
                      id={`reg-deadline-${course.id}`}
                      type="datetime-local"
                      value={editingCourse.registration_deadline ? new Date(editingCourse.registration_deadline).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setEditingCourse({ ...editingCourse, registration_deadline: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>أبرز محاور الدورة</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTopic(true);
                          }
                        }}
                        placeholder="أضف محور جديد"
                        className="text-right bg-white"
                      />
                      <Button
                        type="button"
                        onClick={() => addTopic(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingCourse.course_topics && editingCourse.course_topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editingCourse.course_topics.map((topic: string, idx: number) => (
                          <div key={idx} className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
                            <span className="text-sm">{topic}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 hover:bg-destructive/20"
                              onClick={() => removeTopic(idx, true)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`registration-${course.id}`}>رابط التسجيل</Label>
                  <Input
                    id={`registration-${course.id}`}
                    value={editingCourse.registration_url || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, registration_url: e.target.value })}
                    placeholder="https://..."
                    className="text-right bg-white"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`additional-images-${course.id}`}>صور إضافية</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`additional-images-${course.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAdditionalImageUpload(e, true)}
                      disabled={uploadingAdditionalImage}
                      className="text-right"
                    />
                    {uploadingAdditionalImage && <span className="text-sm text-muted-foreground">جاري الرفع...</span>}
                  </div>
                  {editingCourse.additional_images && editingCourse.additional_images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {editingCourse.additional_images.map((img: string, idx: number) => (
                        <div key={idx} className="relative">
                          <img src={img} alt={`إضافية ${idx + 1}`} className="w-full h-24 object-cover rounded-md" />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeAdditionalImage(idx, true)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id={`registration-closed-${course.id}`}
                    checked={editingCourse.is_registration_closed || false}
                    onChange={(e) => setEditingCourse({ ...editingCourse, is_registration_closed: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor={`registration-closed-${course.id}`} className="cursor-pointer">
                    التسجيل مغلق (اكتمل العدد)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id={`course-ended-${course.id}`}
                    checked={(editingCourse as any).is_ended || false}
                    onChange={(e) => setEditingCourse({ ...editingCourse, is_ended: e.target.checked } as any)}
                    className="rounded"
                  />
                  <Label htmlFor={`course-ended-${course.id}`} className="cursor-pointer">
                    <span className="text-red-600 font-semibold">انتهت الدورة</span> (تبقى كأرشيف)
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`certificate-url-${course.id}`}>رابط الشهادة</Label>
                  <Input
                    id={`certificate-url-${course.id}`}
                    value={editingCourse.certificate_url || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, certificate_url: e.target.value })}
                    placeholder="https://..."
                    className="text-right bg-white"
                    dir="ltr"
                  />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id={`certificate-active-${course.id}`}
                    checked={editingCourse.is_certificate_active || false}
                    onChange={(e) => setEditingCourse({ ...editingCourse, is_certificate_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor={`certificate-active-${course.id}`} className="cursor-pointer">
                    تفعيل زر الحصول على الشهادة
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`video-url-${course.id}`}>رابط فيديو الدورة (يوتيوب)</Label>
                  <Input
                    id={`video-url-${course.id}`}
                    value={editingCourse.video_url || ""}
                    onChange={(e) => setEditingCourse({ ...editingCourse, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="text-right bg-white"
                    dir="ltr"
                  />
                </div>
                
                {/* Recorded Content Section - Edit */}
                <div className="space-y-4 pt-4 border-t border-border bg-gradient-to-br from-primary/5 to-background p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-semibold">📹 المحتوى المسجل (بعد انتهاء الدورة)</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>إضافة رابط فيديو</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newRecordedContentUrl}
                        onChange={(e) => setNewRecordedContentUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... أو رابط آخر"
                        className="text-right flex-1 bg-white"
                        dir="ltr"
                      />
                      <Button 
                        type="button" 
                        onClick={() => addRecordedContentUrl(true)}
                        variant="secondary"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة
                      </Button>
                    </div>
                  </div>
                  
                  {editingCourse.recorded_content_urls && editingCourse.recorded_content_urls.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">الفيديوهات المضافة:</Label>
                      {editingCourse.recorded_content_urls.map((url: string, idx: number) => (
                        <div key={idx} className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Play className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm truncate" dir="ltr">{url}</span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRecordedContentUrl(idx, true)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor={`recorded-content-type-${course.id}`}>نوع المحتوى</Label>
                    <select
                      id={`recorded-content-type-${course.id}`}
                      value={editingCourse.recorded_content_type || "youtube"}
                      onChange={(e) => setEditingCourse({ ...editingCourse, recorded_content_type: e.target.value })}
                      className="w-full p-2 border border-border rounded-md text-right bg-white"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="google_drive">Google Drive</option>
                      <option value="external_video">رابط فيديو خارجي</option>
                      <option value="external_audio">رابط صوت خارجي</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`recorded-content-active-${course.id}`}
                      checked={editingCourse.is_recorded_content_active || false}
                      onChange={(e) => setEditingCourse({ ...editingCourse, is_recorded_content_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor={`recorded-content-active-${course.id}`} className="cursor-pointer">
                      إتاحة المحتوى المسجل للزوار
                    </Label>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    ملاحظة: سيظهر المحتوى المسجل فقط للدورات المنتهية عند تفعيل هذا الخيار
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>المواد الإثرائية (PDF)</Label>
                  <div className="space-y-2">
                    <Input
                      value={newMaterialName}
                      onChange={(e) => setNewMaterialName(e.target.value)}
                      placeholder="اسم المادة (مثال: حقيبة الدورة، كتاب مرجعي)"
                      className="text-right bg-white"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleMaterialUpload(e, true)}
                        disabled={uploadingMaterial}
                        className="text-right"
                      />
                      {uploadingMaterial && <span className="text-sm text-muted-foreground">جاري الرفع...</span>}
                    </div>
                  </div>
                  {editingCourse.course_materials && editingCourse.course_materials.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {editingCourse.course_materials.map((material: any, idx: number) => (
                        <div key={idx} className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-between">
                          <span className="text-sm font-medium">{material.name}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeMaterial(idx, true)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Course Type Section - Edit */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label>نوع الدورة</Label>
                    <select
                      value={editingCourse.course_type || "in-person"}
                      onChange={(e) => setEditingCourse({ ...editingCourse, course_type: e.target.value as any })}
                      className="w-full p-2 border border-border rounded-md text-right bg-white"
                    >
                      <option value="in-person">حضورية</option>
                      <option value="online">عن بعد (متزامنة)</option>
                      <option value="asynchronous">غير متزامنة</option>
                    </select>
                  </div>
                  
                  {(editingCourse.course_type === "online" || editingCourse.course_type === "asynchronous") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`platform-url-${course.id}`}>رابط المنصة</Label>
                        <Input
                          id={`platform-url-${course.id}`}
                          value={editingCourse.platform_url || ""}
                          onChange={(e) => setEditingCourse({ ...editingCourse, platform_url: e.target.value })}
                          placeholder="https://..."
                          className="text-right bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id={`platform-active-${course.id}`}
                          checked={editingCourse.is_platform_active || false}
                          onChange={(e) => setEditingCourse({ ...editingCourse, is_platform_active: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor={`platform-active-${course.id}`} className="cursor-pointer">
                          إتاحة رابط المنصة للطلاب
                        </Label>
                      </div>
                    </>
                  )}
                </div>

                {/* Price Section - Edit */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`is-free-${course.id}`}
                      checked={editingCourse.is_free || false}
                      onChange={(e) => setEditingCourse({ ...editingCourse, is_free: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor={`is-free-${course.id}`} className="cursor-pointer">
                      دورة مجانية
                    </Label>
                  </div>
                  
                  {!editingCourse.is_free && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`original-price-${course.id}`}>السعر الأصلي (ريال)</Label>
                        <Input
                          id={`original-price-${course.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingCourse.original_price || 0}
                          onChange={(e) => setEditingCourse({ ...editingCourse, original_price: parseFloat(e.target.value) || 0 })}
                          className="text-right bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`discounted-price-${course.id}`}>السعر بعد الخصم (اختياري)</Label>
                        <Input
                          id={`discounted-price-${course.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingCourse.discounted_price || 0}
                          onChange={(e) => setEditingCourse({ ...editingCourse, discounted_price: parseFloat(e.target.value) || 0 })}
                          placeholder="اتركه فارغاً إذا لم يكن هناك خصم"
                          className="text-right bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Save className="ml-2 h-4 w-4" />
                    حفظ
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingCourse(null)}
                  >
                    <X className="ml-2 h-4 w-4" />
                    إلغاء
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📚</span>
                    <h3 className="text-xl font-bold text-primary">{course.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>المدرب: {course.instructor}</span>
                    <span>المدة: {course.duration}</span>
                    <span>الطلاب: {course.students}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  {/* Evaluation Form Status */}
                  <div className="lg:min-w-[280px]">
                    <EvaluationQuickStart 
                      courseId={course.id}
                      courseTitle={course.title}
                      hasEvaluationForm={evaluationForms.some((form: any) => form.course_id === course.id)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 lg:justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCourse(course)}
                      className="hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف هذه الدورة؟")) {
                          deleteMutation.mutate(course.id);
                        }
                      }}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CourseManagement;
