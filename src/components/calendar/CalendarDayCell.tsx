import { format, isBefore, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { MapPin, Clock, Calendar } from "lucide-react";

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

interface CalendarDayCellProps {
  date: Date;
  courses: Course[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
}

const getCourseStatus = (course: Course) => {
  const now = new Date();
  const startDate = course.start_date ? new Date(course.start_date) : null;
  const endDate = course.end_date ? new Date(course.end_date) : null;
  const regDeadline = course.registration_deadline ? new Date(course.registration_deadline) : null;

  if (course.is_ended || (endDate && isBefore(endDate, now))) {
    return { color: "bg-gray-100 border-r-4 border-gray-400", badgeColor: "bg-gray-400", label: "انتهت", textColor: "text-gray-600" };
  }
  if (course.is_registration_closed || (regDeadline && isBefore(regDeadline, now))) {
    return { color: "bg-red-50 border-r-4 border-red-500", badgeColor: "bg-red-500", label: "مغلق", textColor: "text-red-600" };
  }
  if (startDate && isBefore(startDate, now)) {
    return { color: "bg-orange-50 border-r-4 border-orange-500", badgeColor: "bg-orange-500", label: "جارية", textColor: "text-orange-600" };
  }
  if (regDeadline && differenceInDays(regDeadline, now) < 7) {
    return { color: "bg-yellow-50 border-r-4 border-yellow-500", badgeColor: "bg-yellow-500", label: "قريباً", textColor: "text-yellow-600" };
  }
  return { color: "bg-green-50 border-r-4 border-green-500", badgeColor: "bg-green-500", label: "مفتوح", textColor: "text-green-600" };
};

const getDayBackgroundColor = (coursesCount: number) => {
  if (coursesCount === 0) return "bg-background";
  if (coursesCount === 1) return "bg-blue-50/50";
  if (coursesCount <= 3) return "bg-blue-100/70";
  return "bg-blue-200";
};

const getDayBorderStyle = (coursesCount: number) => {
  if (coursesCount === 1) return "ring-2 ring-green-500/70";
  if (coursesCount === 2) return "ring-2 ring-orange-500/70";
  if (coursesCount === 3) return "ring-2 ring-red-500/70";
  if (coursesCount >= 4) return "ring-2 ring-purple-500/70";
  return "";
};

export const CalendarDayCell = ({ date, courses, isCurrentMonth, isCurrentDay }: CalendarDayCellProps) => {
  const dayNumber = format(date, 'd');
  const hasCourses = courses.length > 0;

  if (!hasCourses) {
    // Simple cell for days without courses
    return (
      <div
        className={cn(
          "min-h-[100px] p-2 border rounded-md transition-colors",
          getDayBackgroundColor(0),
          getDayBorderStyle(0),
          !isCurrentMonth && "opacity-30",
          isCurrentDay && "ring-2 ring-primary"
        )}
      >
        <div className="font-semibold text-sm">{dayNumber}</div>
      </div>
    );
  }

  // Interactive cell with courses
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "min-h-[100px] p-2 border rounded-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
            getDayBackgroundColor(courses.length),
            !isCurrentDay && getDayBorderStyle(courses.length),
            !isCurrentMonth && "opacity-40",
            isCurrentDay && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-sm">{dayNumber}</span>
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {courses.length}
            </Badge>
          </div>

          {/* Preview of first 2 courses */}
          <div className="space-y-1">
            {courses.slice(0, 2).map((course) => {
              const status = getCourseStatus(course);
              return (
                <div
                  key={course.id}
                  className={cn(
                    "text-xs p-1 rounded truncate",
                    status.color
                  )}
                >
                  <span className={cn("font-medium", status.textColor)}>
                    {course.title}
                  </span>
                </div>
              );
            })}
            {courses.length > 2 && (
              <div className="text-xs text-muted-foreground px-1">
                +{courses.length - 2} أخرى
              </div>
            )}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-96 max-h-[500px] overflow-y-auto" side="top" align="center">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Calendar className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">
              {format(date, 'dd MMMM yyyy', { locale: ar })}
            </h4>
          </div>

          {courses.map((course) => {
            const status = getCourseStatus(course);
            return (
              <Card key={course.id} className="p-3 hover:bg-accent/50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-medium text-sm flex-1">{course.title}</h5>
                    <Badge className={status.badgeColor}>{status.label}</Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    👨‍🏫 {course.instructor}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                    )}
                    {course.course_type && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {course.course_type === 'in-person' ? '🏢 حضوري' :
                         course.course_type === 'online' ? '💻 أونلاين' : '📹 غير متزامن'}
                      </span>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t">
                      {course.description}
                    </p>
                  )}

                  <Link to={`/course/${course.id}`}>
                    <Button size="sm" className="w-full mt-2" variant="outline">
                      عرض التفاصيل
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
