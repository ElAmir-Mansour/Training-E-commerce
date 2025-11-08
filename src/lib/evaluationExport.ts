interface EvaluationResponse {
  id: string;
  trainee_name: string;
  trainee_email?: string;
  trainee_phone?: string;
  responses: Record<string, any>;
  submitted_at: string;
}

interface Question {
  id: string;
  type: string;
  category: string;
  question: string;
}

export const exportToExcel = async (
  responses: EvaluationResponse[],
  questions: Question[],
  courseTitle: string
) => {
  // Calculate statistics
  const stats = calculateStats(responses, questions);
  
  // Create CSV content
  let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support
  
  // Sheet 1: Executive Summary
  csvContent += `تقرير تقييم الدورة: ${courseTitle}\n`;
  csvContent += `عدد المشاركين في التقييم: ${responses.length}\n`;
  csvContent += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}\n\n`;
  
  csvContent += 'الملخص التنفيذي\n';
  csvContent += 'الفئة,المتوسط,النسبة المئوية\n';
  
  Object.entries(stats.byCategory).forEach(([category, data]: [string, any]) => {
    const categoryName = getCategoryName(category);
    csvContent += `${categoryName},${data.average.toFixed(2)},${data.percentage}%\n`;
  });
  
  csvContent += `المتوسط العام,${stats.overall.average.toFixed(2)},${stats.overall.percentage}%\n\n`;
  
  // Sheet 2: Detailed Responses
  csvContent += '\n\nالبيانات التفصيلية\n';
  csvContent += 'التاريخ,الاسم,البريد الإلكتروني,رقم الجوال';
  
  questions.forEach(q => {
    csvContent += `,${q.question}`;
  });
  csvContent += '\n';
  
  responses.forEach(response => {
    const date = new Date(response.submitted_at).toLocaleDateString('ar-SA');
    csvContent += `${date},${response.trainee_name},${response.trainee_email || ''},${response.trainee_phone || ''}`;
    
    questions.forEach(q => {
      const answer = response.responses[q.id]?.value || '';
      csvContent += `,${answer}`;
    });
    csvContent += '\n';
  });
  
  // Sheet 3: Question Analysis
  csvContent += '\n\nتحليل الأسئلة\n';
  csvContent += 'السؤال,الفئة,النوع,المتوسط,عدد الإجابات\n';
  
  questions.forEach(q => {
    if (q.type === 'rating' || q.type === 'likert') {
      const questionResponses = responses
        .map(r => r.responses[q.id]?.value)
        .filter(v => v !== undefined && v !== null);
      
      const average = questionResponses.length > 0
        ? questionResponses.reduce((sum, val) => sum + val, 0) / questionResponses.length
        : 0;
      
      csvContent += `"${q.question}",${getCategoryName(q.category)},${q.type},${average.toFixed(2)},${questionResponses.length}\n`;
    }
  });
  
  // Sheet 4: Text Responses
  csvContent += '\n\nالتعليقات النصية\n';
  csvContent += 'السؤال,التعليق,اسم المتدرب,التاريخ\n';
  
  questions.forEach(q => {
    if (q.type === 'text') {
      responses.forEach(response => {
        const answer = response.responses[q.id]?.value;
        if (answer && answer.trim()) {
          const date = new Date(response.submitted_at).toLocaleDateString('ar-SA');
          csvContent += `"${q.question}","${answer}",${response.trainee_name},${date}\n`;
        }
      });
    }
  });
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `تقييم_${courseTitle}_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const calculateStats = (responses: EvaluationResponse[], questions: Question[]) => {
  const categories = ['course', 'trainer', 'center', 'venue', 'general'];
  const categoryStats: Record<string, { total: number; count: number; average: number; percentage: number }> = {};
  
  categories.forEach(category => {
    const categoryQuestions = questions.filter(q => q.category === category && (q.type === 'rating' || q.type === 'likert'));
    let total = 0;
    let count = 0;
    
    categoryQuestions.forEach(q => {
      responses.forEach(response => {
        const value = response.responses[q.id]?.value;
        if (value !== undefined && value !== null) {
          total += value;
          count++;
        }
      });
    });
    
    const average = count > 0 ? total / count : 0;
    const percentage = Math.round((average / 5) * 100);
    
    categoryStats[category] = { total, count, average, percentage };
  });
  
  // Calculate overall
  let overallTotal = 0;
  let overallCount = 0;
  
  Object.values(categoryStats).forEach(stat => {
    overallTotal += stat.total;
    overallCount += stat.count;
  });
  
  const overallAverage = overallCount > 0 ? overallTotal / overallCount : 0;
  const overallPercentage = Math.round((overallAverage / 5) * 100);
  
  return {
    byCategory: categoryStats,
    overall: {
      average: overallAverage,
      percentage: overallPercentage
    }
  };
};

const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {
    course: 'الدورة التدريبية',
    trainer: 'المدرب',
    center: 'المركز التدريبي',
    venue: 'المكان والتجهيزات',
    general: 'عام'
  };
  return names[category] || category;
};
