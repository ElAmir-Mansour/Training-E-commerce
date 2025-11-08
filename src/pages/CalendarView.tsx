import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchCoursesForMonth } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { format, isAfter, isBefore } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronLeft, ChevronRight, TrendingUp, CheckCircle, Clock as ClockIcon, XCircle } from "lucide-react";
import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['calendar-courses', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: () => fetchCoursesForMonth(currentDate.getFullYear(), currentDate.getMonth()),
  });

  // Calculate statistics
  const statistics = useMemo(() => {
    const now = new Date();
    let total = courses.length;
    let open = 0;
    let ongoing = 0;
    let closed = 0;
    let ended = 0;

    courses.forEach(course => {
      const startDate = course.start_date ? new Date(course.start_date) : null;
      const endDate = course.end_date ? new Date(course.end_date) : null;
      const regDeadline = course.registration_deadline ? new Date(course.registration_deadline) : null;

      if (course.is_ended || (endDate && isBefore(endDate, now))) {
        ended++;
      } else if (course.is_registration_closed || (regDeadline && isBefore(regDeadline, now))) {
        closed++;
      } else if (startDate && isBefore(startDate, now)) {
        ongoing++;
      } else {
        open++;
      }
    });

    return { total, open, ongoing, closed, ended };
  }, [courses]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            تقويم الدورات
          </h1>
          <p className="text-muted-foreground">
            اكتشف مواعيد الدورات القادمة بسهولة
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{statistics.total}</div>
                <div className="text-xs text-muted-foreground">إجمالي الدورات</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{statistics.open}</div>
                <div className="text-xs text-muted-foreground">مفتوحة للتسجيل</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{statistics.ongoing}</div>
                <div className="text-xs text-muted-foreground">جارية</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{statistics.ended}</div>
                <div className="text-xs text-muted-foreground">انتهت</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar Grid */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">
              {format(currentDate, 'MMMM yyyy', { locale: ar })}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <Skeleton key={i} className="h-[100px] rounded-md" />
                ))}
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد دورات في هذا الشهر</p>
              <p className="text-sm text-muted-foreground mt-2">جرب الانتقال لشهر آخر</p>
            </div>
          ) : (
            <MonthCalendarGrid currentDate={currentDate} courses={courses} />
          )}

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold mb-3">دليل الألوان:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-50 border-r-2 border-green-500"></div>
                <span>مفتوح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-50 border-r-2 border-yellow-500"></div>
                <span>قريباً</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-orange-50 border-r-2 border-orange-500"></div>
                <span>جارية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-50 border-r-2 border-red-500"></div>
                <span>مغلق</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gray-100 border-r-2 border-gray-400"></div>
                <span>انتهت</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
