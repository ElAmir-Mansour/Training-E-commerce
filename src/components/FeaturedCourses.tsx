import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Clock, Users, ArrowLeft, MapPin, Monitor, Play, Calendar, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/supabase";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

const FeaturedCourses = () => {
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const isCourseEnded = (course: any) => {
    if (course.is_ended) return true;
    if (course.end_date) {
      return new Date(course.end_date) < new Date();
    }
    return false;
  };
  
  return (
    <section className="py-12 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {courses.slice(0, 6).map((course: any, index: number) => (
            <Card 
              key={course.id}
              className="group relative overflow-hidden border-border/50 bg-[var(--gradient-card)] backdrop-blur-sm hover:shadow-[var(--shadow-hover)] transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Course Image */}
              <div className="relative h-56 overflow-hidden bg-muted/30">
                {isCourseEnded(course) && (
                  <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-3 py-1 rounded-md font-bold text-sm shadow-lg">
                    انتهت الدورة
                  </div>
                )}
                <img 
                  src={course.image_url || '/placeholder.svg'} 
                  alt={course.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">المدرب: {course.instructor}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                </div>

                {/* Course Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {/* Course Type Badge */}
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                    {(course as any).course_type === 'in-person' && (
                      <>
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">حضورية</span>
                      </>
                    )}
                    {(course as any).course_type === 'online' && (
                      <>
                        <Monitor className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">عن بعد</span>
                      </>
                    )}
                    {(course as any).course_type === 'asynchronous' && (
                      <>
                        <Play className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">غير متزامنة</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()}</span>
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

                {/* Price Display */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {(course as any).is_free ? (
                    <div className="flex items-center">
                      <span className="text-green-600 font-bold">مجاني</span>
                    </div>
                  ) : (course as any).discounted_price && (course as any).discounted_price > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground line-through text-xs">{(course as any).original_price} ريال</span>
                      <span className="text-red-600 font-bold text-lg">{(course as any).discounted_price} ريال</span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                        -{Math.round((1 - (course as any).discounted_price / (course as any).original_price) * 100)}%
                      </span>
                    </div>
                  ) : (course as any).original_price ? (
                    <div className="flex items-center">
                      <span className="text-red-600 font-bold">{(course as any).original_price} ريال</span>
                    </div>
                  ) : null}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/50">
                  {course.is_registration_closed ? (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-1.5 rounded-md text-sm font-medium">
                      اكتمل العدد
                    </div>
                  ) : course.registration_url ? (
                    <a href={course.registration_url} target="_blank" rel="noopener noreferrer">
                      <Button 
                        size="sm"
                        variant="gradient"
                      >
                        التسجيل
                      </Button>
                    </a>
                  ) : null}
                  <Link to={`/course/${course.id}`} className="mr-auto">
                    <Button 
                      size="sm"
                      variant="gradient"
                      className="group/btn"
                    >
                      التفاصيل
                      <ArrowLeft className="mr-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/courses">
            <Button 
              size="lg"
              variant="gradient"
            >
              عرض جميع الدورات
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
