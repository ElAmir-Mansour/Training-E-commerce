import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Star, Users, Clock, MapPin, Monitor, Play, Search, Calendar, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

const AllCourses = () => {
  const isCourseEnded = (course: any) => {
    if (course.is_ended) return true;
    if (course.end_date) {
      return new Date(course.end_date) < new Date();
    }
    return false;
  };

  const { data: allCourses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [courseTypeFilter, setCourseTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Filter courses
  const filteredCourses = allCourses.filter((course: any) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourseType = courseTypeFilter === "all" || course.course_type === courseTypeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "open" && !course.is_registration_closed) ||
      (statusFilter === "closed" && course.is_registration_closed) ||
      (statusFilter === "active" && !isCourseEnded(course)) ||
      (statusFilter === "ended" && isCourseEnded(course));
    const matchesPrice = priceFilter === "all" || 
      (priceFilter === "free" && course.is_free) ||
      (priceFilter === "paid" && !course.is_free);

    return matchesSearch && matchesCourseType && matchesStatus && matchesPrice;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a: any, b: any) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "students":
        return b.students - a.students;
      case "latest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            جميع الدورات التدريبية
          </h1>
          <p className="text-center text-muted-foreground text-lg mb-8">
            استكشف مجموعة واسعة من الدورات التدريبية المتخصصة
          </p>

          {/* Filters and Search */}
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن دورة بالاسم أو المدرب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الدورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="in-person">حضورية</SelectItem>
                  <SelectItem value="online">عن بعد</SelectItem>
                  <SelectItem value="asynchronous">غير متزامنة</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة الدورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="open">التسجيل مفتوح</SelectItem>
                  <SelectItem value="closed">التسجيل مغلق</SelectItem>
                  <SelectItem value="active">جارية</SelectItem>
                  <SelectItem value="ended">منتهية</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="السعر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">الأحدث</SelectItem>
                  <SelectItem value="rating">التقييم</SelectItem>
                  <SelectItem value="students">عدد المسجلين</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="text-center text-muted-foreground">
              عرض {sortedCourses.length} من أصل {allCourses.length} دورة
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {sortedCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد دورات تطابق معايير البحث</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedCourses.map((course: any) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all">
                  <div className="relative">
                    {isCourseEnded(course) && (
                      <Badge className="absolute top-2 right-2 bg-destructive">
                        انتهت
                      </Badge>
                    )}
                    {course.is_registration_closed && !isCourseEnded(course) && (
                      <Badge className="absolute top-2 right-2 bg-orange-500">
                        اكتمل العدد
                      </Badge>
                    )}
                    <img 
                      src={course.image_url || '/placeholder.svg'} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      {course.course_type === 'in-person' && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="w-3 h-3" />
                          حضورية
                        </Badge>
                      )}
                      {course.course_type === 'online' && (
                        <Badge variant="outline" className="gap-1">
                          <Monitor className="w-3 h-3" />
                          عن بعد
                        </Badge>
                      )}
                      {course.course_type === 'asynchronous' && (
                        <Badge variant="outline" className="gap-1">
                          <Play className="w-3 h-3" />
                          غير متزامنة
                        </Badge>
                      )}
                      {course.is_free ? (
                        <Badge className="bg-green-600">مجاني</Badge>
                      ) : course.discounted_price && course.discounted_price > 0 ? (
                        <Badge className="bg-red-600">{course.discounted_price} ريال</Badge>
                      ) : course.original_price ? (
                        <Badge className="bg-red-600">{course.original_price} ريال</Badge>
                      ) : null}
                    </div>

                    <h3 className="text-xl font-bold line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Course Dates Section */}
                    {(course.start_date || course.end_date || course.registration_deadline) && (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        {course.start_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">
                              يبدأ: <span className="text-foreground font-medium">{format(new Date(course.start_date), "dd MMMM yyyy", { locale: ar })}</span>
                            </span>
                          </div>
                        )}
                        {course.end_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarClock className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">
                              ينتهي: <span className="text-foreground font-medium">{format(new Date(course.end_date), "dd MMMM yyyy", { locale: ar })}</span>
                            </span>
                          </div>
                        )}
                        {course.registration_deadline && (
                          <div className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                            differenceInDays(new Date(course.registration_deadline), new Date()) < 3
                              ? 'bg-red-50 dark:bg-red-950/20'
                              : differenceInDays(new Date(course.registration_deadline), new Date()) < 7
                              ? 'bg-orange-50 dark:bg-orange-950/20'
                              : 'bg-blue-50 dark:bg-blue-950/20'
                          }`}>
                            <CalendarClock className={`w-4 h-4 ${
                              differenceInDays(new Date(course.registration_deadline), new Date()) < 3
                                ? 'text-red-600 dark:text-red-400'
                                : differenceInDays(new Date(course.registration_deadline), new Date()) < 7
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`} />
                            <span className={`font-medium ${
                              differenceInDays(new Date(course.registration_deadline), new Date()) < 3
                                ? 'text-red-600 dark:text-red-400'
                                : differenceInDays(new Date(course.registration_deadline), new Date()) < 7
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              آخر موعد للتسجيل: {format(new Date(course.registration_deadline), "dd MMMM yyyy", { locale: ar })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <Link to={`/course/${course.id}`}>
                      <Button className="w-full" variant="gradient">
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllCourses;
