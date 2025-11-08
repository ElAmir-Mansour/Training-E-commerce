import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarDayCell } from "./CalendarDayCell";

interface Course {
  id: string;
  title: string;
  instructor: string;
  start_date: string;
  end_date?: string;
  registration_deadline?: string;
  duration?: string;
  course_type?: string;
  is_registration_closed?: boolean;
  is_ended?: boolean;
  description?: string;
}

interface MonthCalendarGridProps {
  currentDate: Date;
  courses: Course[];
}

const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const MonthCalendarGrid = ({ currentDate, courses }: MonthCalendarGridProps) => {
  // Get all days to display (including padding from prev/next month)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group courses by date
  const coursesByDate = courses.reduce((acc, course) => {
    if (course.start_date) {
      const startDate = new Date(course.start_date);
      const endDate = course.end_date ? new Date(course.end_date) : startDate;
      
      // إنشاء مصفوفة بكل الأيام بين start_date و end_date
      const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      // إضافة الدورة لكل يوم في النطاق
      daysInRange.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(course);
      });
    }
    return acc;
  }, {} as Record<string, Course[]>);

  const getCoursesForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return coursesByDate[dateKey] || [];
  };

  return (
    <div className="w-full">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground py-2 bg-muted/50 rounded-md"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const coursesForDay = getCoursesForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <CalendarDayCell
              key={day.toString()}
              date={day}
              courses={coursesForDay}
              isCurrentMonth={isCurrentMonth}
              isCurrentDay={isCurrentDay}
            />
          );
        })}
      </div>
    </div>
  );
};
