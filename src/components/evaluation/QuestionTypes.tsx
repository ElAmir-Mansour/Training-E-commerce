import { Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

interface Question {
  id: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'likert';
  category: string;
  question: string;
  required: boolean;
  options?: string[] | null;
}

interface QuestionTypeProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const RatingQuestion = ({ question, value, onChange }: QuestionTypeProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const rating = value?.value || 0;

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {question.question}
        {question.required && <span className="text-destructive mr-1">*</span>}
      </Label>
      <div className="flex gap-2" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange({ value: star, category: question.category })}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= (hoveredStar || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="mr-3 text-sm text-muted-foreground self-center">
            {rating} من 5
          </span>
        )}
      </div>
    </div>
  );
};

export const TextQuestion = ({ question, value, onChange }: QuestionTypeProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor={question.id} className="text-base font-medium">
        {question.question}
        {question.required && <span className="text-destructive mr-1">*</span>}
      </Label>
      <Textarea
        id={question.id}
        value={value?.value || ''}
        onChange={(e) => onChange({ value: e.target.value, category: question.category })}
        placeholder="اكتب إجابتك هنا..."
        className="min-h-[100px] resize-none"
        required={question.required}
      />
    </div>
  );
};

export const MultipleChoiceQuestion = ({ question, value, onChange }: QuestionTypeProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {question.question}
        {question.required && <span className="text-destructive mr-1">*</span>}
      </Label>
      <RadioGroup
        value={value?.value || ''}
        onValueChange={(val) => onChange({ value: val, category: question.category })}
        required={question.required}
      >
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value={option} id={`${question.id}-${index}`} />
            <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer font-normal">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export const LikertScaleQuestion = ({ question, value, onChange }: QuestionTypeProps) => {
  const likertOptions = [
    { label: 'موافق بشدة', value: 5, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'موافق', value: 4, color: 'bg-green-400 hover:bg-green-500' },
    { label: 'محايد', value: 3, color: 'bg-gray-400 hover:bg-gray-500' },
    { label: 'غير موافق', value: 2, color: 'bg-red-400 hover:bg-red-500' },
    { label: 'غير موافق بشدة', value: 1, color: 'bg-red-500 hover:bg-red-600' },
  ];

  const selectedValue = value?.value || 0;

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {question.question}
        {question.required && <span className="text-destructive mr-1">*</span>}
      </Label>
      <div className="flex flex-col gap-2">
        {likertOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange({ value: option.value, category: question.category })}
            className={`
              relative p-2 rounded-lg border-2 transition-all text-white font-medium text-center text-sm
              ${selectedValue === option.value 
                ? `${option.color} border-primary scale-105 shadow-lg` 
                : `${option.color} border-transparent opacity-70 hover:opacity-100`
              }
            `}
          >
            <div className="flex flex-row items-center gap-2">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedValue === option.value ? 'border-white bg-white/20' : 'border-white/50'}
              `}>
                {selectedValue === option.value && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-xs leading-tight">{option.label}</span>
            </div>
          </button>
        ))}
      </div>
      {selectedValue > 0 && (
        <p className="text-sm text-muted-foreground">
          الدرجة المختارة: <span className="font-bold">{selectedValue}</span> من 5
        </p>
      )}
    </div>
  );
};
