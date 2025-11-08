import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EvaluationQuickStartProps {
  courseId: string;
  courseTitle: string;
  hasEvaluationForm: boolean;
}

const EvaluationQuickStart = ({ courseId, courseTitle, hasEvaluationForm }: EvaluationQuickStartProps) => {
  if (hasEvaluationForm) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">تم إنشاء نموذج التقييم لهذه الدورة</p>
              <p className="text-sm text-green-700">يمكن للمتدربين الآن تقييم الدورة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="h-8 w-8 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-orange-900">لم يتم إنشاء نموذج تقييم لهذه الدورة</p>
              <p className="text-sm text-orange-700">قم بإنشاء نموذج لتمكين المتدربين من التقييم</p>
            </div>
          </div>
          <Link to="/admin" className="self-start md:self-auto" onClick={() => {
            // Scroll to evaluation section after navigation
            setTimeout(() => {
              const element = document.getElementById('evaluation-section');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}>
            <Button variant="default" className="whitespace-nowrap w-full md:w-auto">
              <Plus className="ml-2 h-4 w-4" />
              إنشاء نموذج تقييم
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationQuickStart;
