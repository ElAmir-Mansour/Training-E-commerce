import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Clock, Users, Award, CheckCircle2, Download, FileQuestion, FileText, Eye, MapPin, Monitor, Play, ExternalLink, ClipboardCheck, Share2, Copy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById, fetchCourses } from "@/lib/supabase";
import { toast } from "sonner";
import ContactDialog from "@/components/ContactDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }
  
  return null;
};

// Helper function to convert various external URLs to embed URLs
const getEmbedUrl = (url: string, type: string) => {
  if (!url) return null;
  
  switch(type) {
    case 'youtube':
      return getYouTubeEmbedUrl(url);
    
    case 'vimeo':
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      return vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : null;
    
    case 'google_drive':
      const driveMatch = url.match(/\/d\/([^\/]+)/);
      return driveMatch ? `https://drive.google.com/file/d/${driveMatch[1]}/preview` : null;
    
    case 'external_video':
    case 'external_audio':
      return url; // استخدام الرابط كما هو
    
    default:
      return null;
  }
};

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourseById(id!),
    enabled: !!id,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("تم بدء التنزيل");
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error("فشل تنزيل الملف");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4">الدورة غير موجودة</h1>
          <Link to="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get similar courses (same type, exclude current)
  const similarCourses = allCourses
    .filter((c: any) => c.id !== course.id && c.course_type === course.course_type)
    .slice(0, 3);
  
  // If not enough similar courses, fill with random courses
  const displayCourses = similarCourses.length >= 3 
    ? similarCourses 
    : [...similarCourses, ...allCourses.filter((c: any) => c.id !== course.id && !similarCourses.find((s: any) => s.id === c.id)).slice(0, 3 - similarCourses.length)];

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `${course.title} - تحقق من هذه الدورة المميزة!`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success("تم نسخ الرابط بنجاح");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Image Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-20">
        <div className="w-full relative">
          {(course as any).is_ended && (
            <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-4 py-2 rounded-md font-bold text-lg shadow-lg">
              انتهت الدورة
            </div>
          )}
          <img 
            src={course.image_url || '/placeholder.svg'} 
            alt={course.title}
            className="w-full h-auto object-contain max-h-[600px]"
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-background">
        <div className="px-4 md:px-8 lg:px-12 py-16 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {course.title}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                {/* Course Type Badge */}
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                  {(course as any).course_type === 'in-person' && (
                    <>
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-primary font-bold">حضورية</span>
                    </>
                  )}
                  {(course as any).course_type === 'online' && (
                    <>
                      <Monitor className="w-5 h-5 text-primary" />
                      <span className="text-primary font-bold">عن بعد</span>
                    </>
                  )}
                  {(course as any).course_type === 'asynchronous' && (
                    <>
                      <Play className="w-5 h-5 text-primary" />
                      <span className="text-primary font-bold">غير متزامنة</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-muted-foreground">التقييم</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">{course.students.toLocaleString()}</span>
                  <span className="text-muted-foreground">متدرب</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">{course.duration}</span>
                </div>
                
                {/* Price Display */}
                {(course as any).is_free ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold text-xl">مجاني</span>
                  </div>
                ) : (course as any).discounted_price && (course as any).discounted_price > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground line-through">{(course as any).original_price} ريال</span>
                    <span className="text-red-600 font-bold text-2xl">{(course as any).discounted_price} ريال</span>
                    <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full font-medium">
                      خصم {Math.round((1 - (course as any).discounted_price / (course as any).original_price) * 100)}%
                    </span>
                  </div>
                ) : (course as any).original_price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold text-2xl">{(course as any).original_price} ريال</span>
                  </div>
                ) : null}
              </div>

              {/* Instructor */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {course.instructor.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المدرب</p>
                    <p className="font-medium text-red-600">{course.instructor}</p>
                  </div>
                </div>
                {course.instructor_credentials && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">الخبرات والشهادات:</p>
                    <p className="whitespace-pre-line">{course.instructor_credentials}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Buttons & Course Info */}
            <div className="space-y-6">
              {/* Platform Access Button */}
              {((course as any).course_type === 'online' || (course as any).course_type === 'asynchronous') && 
               (course as any).is_platform_active && 
               (course as any).platform_url && (
                <a href={(course as any).platform_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button 
                    size="lg" 
                    variant="gradient"
                    className="w-full text-lg"
                  >
                    <ExternalLink className="ml-2 h-5 w-5" />
                    دخول المنصة
                  </Button>
                </a>
              )}
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {course.is_registration_closed ? (
                  <div className="col-span-2 bg-destructive/10 border border-destructive text-destructive text-center py-4 rounded-lg text-base font-medium">
                    اكتمل العدد
                  </div>
                ) : (
                  <>
                    {course.registration_url ? (
                      <a href={course.registration_url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button 
                          size="default" 
                          variant="gradient"
                          className="w-full"
                        >
                          <ExternalLink className="ml-2 h-4 w-4" />
                          التسجيل
                        </Button>
                      </a>
                    ) : (
                      <Button 
                        size="default" 
                        variant="gradient"
                        onClick={() => setIsContactDialogOpen(true)}
                      >
                        <Users className="ml-2 h-4 w-4" />
                        التسجيل
                      </Button>
                    )}
                    
                    <Button 
                      size="default" 
                      variant="gradient"
                      onClick={() => setIsContactDialogOpen(true)}
                    >
                      <FileQuestion className="ml-2 h-4 w-4" />
                      استفسر
                    </Button>
                  </>
                )}
                
                {/* Evaluation Button */}
                <Button 
                  size="default" 
                  variant="outline"
                  onClick={() => navigate(`/evaluation/${id}`)}
                >
                  <ClipboardCheck className="ml-2 h-4 w-4" />
                  تقييم الدورة
                </Button>
                
                {course.is_certificate_active && course.certificate_url && (
                  <a href={course.certificate_url} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button 
                      size="default" 
                      variant="gradient"
                      className="w-full"
                    >
                      <Download className="ml-2 h-4 w-4" />
                      الشهادة
                    </Button>
                  </a>
                )}
              </div>

              {/* Course Includes */}
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="font-medium text-sm">تشمل الدورة:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>وصول مدى الحياة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>شهادة إتمام معتمدة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>دعم فني مباشر</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>مشاريع عملية</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {course.video_url && getYouTubeEmbedUrl(course.video_url) && (
        <section className="py-16 bg-muted/50">
          <div className="px-4 md:px-8 lg:px-12">
            <h2 className="text-3xl font-bold text-center mb-12">فيديو تعريفي بالدورة</h2>
            <div className="max-w-6xl mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={getYouTubeEmbedUrl(course.video_url) || ''}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Course Topics */}
      {course.course_topics && course.course_topics.length > 0 && (
        <section className="py-16 bg-background">
          <div className="px-4 md:px-8 lg:px-12">
            <h2 className="text-3xl font-bold text-center mb-12">أبرز محاور الدورة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {course.course_topics.map((topic, index) => (
                <Card key={index} className="p-6 border-2 border-border bg-muted/50 hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">{topic}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Materials */}
      {course.course_materials && Array.isArray(course.course_materials) && course.course_materials.length > 0 && (
        <section className="py-16 bg-background">
          <div className="px-4 md:px-8 lg:px-12">
            <h2 className="text-3xl font-bold text-center mb-12">المواد الإثرائية للدورة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {(course.course_materials as Array<{ name: string; file_url: string }>).map((material, index) => (
                <Card key={index} className="p-6 border-2 border-border bg-muted/50 hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-1">{material.name}</h3>
                        <p className="text-xs text-muted-foreground">ملف PDF</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href={material.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                        >
                          <Eye className="ml-2 h-4 w-4" />
                          فتح الملف
                        </Button>
                      </a>
                      <Button 
                        variant="gradient" 
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownload(material.file_url, material.name)}
                      >
                        <Download className="ml-2 h-4 w-4" />
                        تنزيل
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional Images Gallery */}
      {course.additional_images && course.additional_images.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="px-4 md:px-8 lg:px-12">
            <h2 className="text-3xl font-bold text-center mb-12">صور من الدورة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {course.additional_images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${course.title} - صورة ${index + 1}`}
                  className="w-full aspect-video object-cover shadow-lg hover:shadow-xl transition-shadow"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recorded Content Section */}
      {(course as any).is_ended && 
       (course as any).is_recorded_content_active && 
       (course as any).recorded_content_url && (
        <section className="py-16 bg-gradient-to-br from-primary/5 to-background">
          <div className="px-4 md:px-8 lg:px-12">
            <div className="text-center mb-12">
              <Play className="inline-block w-12 h-12 text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-4">شاهد الدورة كاملة الآن</h2>
              <p className="text-muted-foreground">يمكنك الآن متابعة محتوى الدورة المسجل بالكامل</p>
            </div>
            
            <Card className="p-6 max-w-6xl mx-auto shadow-lg">
              {((course as any).recorded_content_type === 'youtube' || 
                (course as any).recorded_content_type === 'vimeo' || 
                (course as any).recorded_content_type === 'google_drive') && 
                getEmbedUrl((course as any).recorded_content_url, (course as any).recorded_content_type) && (
                <iframe
                  src={getEmbedUrl((course as any).recorded_content_url, (course as any).recorded_content_type) || ''}
                  className="w-full aspect-video rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="محتوى الدورة المسجل"
                />
              )}
              
              {(course as any).recorded_content_type === 'external_video' && (
                <video 
                  controls 
                  className="w-full rounded-lg"
                  src={(course as any).recorded_content_url}
                >
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              )}
              
              {(course as any).recorded_content_type === 'external_audio' && (
                <div className="py-8">
                  <audio 
                    controls 
                    className="w-full"
                    src={(course as any).recorded_content_url}
                  >
                    متصفحك لا يدعم تشغيل الصوت
                  </audio>
                </div>
              )}
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <Eye className="inline-block w-4 h-4 ml-2" />
                هذا المحتوى متاح لأن الدورة قد انتهت
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Share Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">شارك هذه الدورة</h3>
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare('whatsapp')}
                className="gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                واتساب
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare('twitter')}
                className="gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                تويتر
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleShare('copy')}
                className="gap-2"
              >
                <Copy className="w-5 h-5" />
                نسخ الرابط
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Courses */}
      {displayCourses.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">دورات مشابهة</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {displayCourses.map((similarCourse: any) => (
                <Card key={similarCourse.id} className="overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all">
                  <img 
                    src={similarCourse.image_url || '/placeholder.svg'} 
                    alt={similarCourse.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold line-clamp-2">{similarCourse.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{similarCourse.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{similarCourse.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{similarCourse.students}</span>
                      </div>
                    </div>
                    <Link to={`/course/${similarCourse.id}`}>
                      <Button className="w-full" variant="gradient">
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="px-4 md:px-8 lg:px-12">
          <Card className="p-12 text-center bg-gradient-to-br from-primary to-primary-glow border-0 max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              جاهز لبدء رحلتك التعليمية؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              انضم الآن وابدأ التعلم مع أفضل المدربين
            </p>
            {course.is_registration_closed ? (
              <div className="bg-white/20 border border-white/40 text-white text-center py-6 px-8 rounded-lg text-lg font-medium inline-block">
                اكتمل العدد
              </div>
            ) : course.registration_url ? (
              <a href={course.registration_url} target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  variant="gradient"
                  className="text-lg px-8 py-6"
                >
                  <ExternalLink className="ml-2 h-5 w-5" />
                  سجل الآن
                </Button>
              </a>
            ) : (
              <Button 
                size="lg" 
                variant="gradient"
                className="text-lg px-8 py-6"
                onClick={() => setIsContactDialogOpen(true)}
              >
                <Users className="ml-2 h-5 w-5" />
                سجل الآن
              </Button>
            )}
          </Card>
        </div>
      </section>

      <Footer />
      
      <ContactDialog 
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
      />
    </div>
  );
};

export default CourseDetails;
