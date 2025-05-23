
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath, UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { EAST_ASIAN_BIRTH_TIMES, CALENDAR_TYPES, GENDER_OPTIONS } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Heart, Home, CalendarIcon, User, Wand2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { HanjaSelectionModal } from '@/components/hanja-selection-modal';
import { splitKoreanName, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";

const personSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "성별을 선택해주세요."}) }),
});

const formSchema = z.object({
  person1: personSchema,
  person2: personSchema,
});

type RelationshipCompatibilityFormValues = z.infer<typeof formSchema>;

interface PersonFormFieldsProps {
  personNumber: 1 | 2;
  form: UseFormReturn<RelationshipCompatibilityFormValues>;
  openHanjaModal: (fieldName: FieldPath<RelationshipCompatibilityFormValues>) => void;
}

const PersonFormFields: React.FC<PersonFormFieldsProps> = ({ personNumber, form, openHanjaModal }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const prefix = `person${personNumber}` as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
      <FormField
        control={form.control}
        name={`${prefix}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>이름</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl>
                <Input placeholder="예: 홍길동" {...field} />
              </FormControl>
              <Button type="button" variant="outline" size="sm" onClick={() => openHanjaModal(`${prefix}.name`)}>
                <Wand2 className="mr-1 h-4 w-4" />한자 변환
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${prefix}.gender`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>성별</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="성별을 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${prefix}.birthDate`}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>생년월일</FormLabel>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP", { locale: ko })
                    ) : (
                      <span>생년월일을 선택하세요</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      setIsCalendarOpen(false);
                    }
                  }
                  disabled={(date) =>
                    date > new Date() || date < new Date("1920-01-01")
                  }
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                  captionLayout="dropdown-buttons"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${prefix}.calendarType`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>달력 유형</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="달력 유형을 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CALENDAR_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${prefix}.birthTime`}
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>태어난 시간</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="태어난 시간을 선택하세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EAST_ASIAN_BIRTH_TIMES.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};


export default function RelationshipCompatibilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isHanjaModalOpen, setIsHanjaModalOpen] = useState(false);
  const [nameSyllablesForModal, setNameSyllablesForModal] = useState<string[]>([]);
  const [originalNameToConvert, setOriginalNameToConvert] = useState<string>("");
  const [targetFieldNameForHanja, setTargetFieldNameForHanja] = useState<FieldPath<RelationshipCompatibilityFormValues> | null>(null);

  const form = useForm<RelationshipCompatibilityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person1: { name: "", birthDate: "", calendarType: "solar", birthTime: "모름", gender: "male" },
      person2: { name: "", birthDate: "", calendarType: "solar", birthTime: "모름", gender: "female" },
    },
  });

  const handleOpenHanjaModal = (fieldName: FieldPath<RelationshipCompatibilityFormValues>) => {
    const currentNameValue = form.getValues(fieldName);

    // currentNameValue가 문자열이고 비어있지 않은지 확인
    if (typeof currentNameValue !== 'string' || !currentNameValue) {
        toast({ title: "알림", description: "한자로 변환할 한글 이름을 입력해주세요." });
        return; // 문자열이 아니거나 비어있으면 여기서 함수 종료
    }

    // 이제 currentNameValue는 확실히 string 타입
    const koreanOnlyName = currentNameValue.replace(/\s*\(.*?\)\s*$/, "").trim(); // 정규식 약간 수정

    if (!koreanOnlyName) {
      toast({ title: "알림", description: "한자로 변환할 한글 이름을 입력해주세요." });
      return;
    }
    const syllables = splitKoreanName(koreanOnlyName);
    if (syllables.length > 0) {
      setNameSyllablesForModal(syllables);
      setOriginalNameToConvert(koreanOnlyName);
      setTargetFieldNameForHanja(fieldName);
      setIsHanjaModalOpen(true);
    } else {
      toast({ title: "알림", description: "한자로 변환할 한글 이름이 없습니다." });
    }
  };

  const handleHanjaConversionComplete = (selections: (HanjaDetail | null)[]) => {
    if (targetFieldNameForHanja) {
      const koreanOnlyName = originalNameToConvert;
      const syllables = nameSyllablesForModal;

      let hanjaPart = "";
      let allConverted = true;
      let someConverted = false;

      for (let i = 0; i < syllables.length; i++) {
        if (selections[i]) {
          hanjaPart += selections[i]!.hanja;
          someConverted = true;
        } else {
          allConverted = false; 
        }
      }
      
      if (someConverted && !allConverted) {
          toast({
              title: "알림",
              description: "모든 글자를 한자로 변환하거나, 모든 글자를 한글로 유지해주세요. (부분 변환 미지원)",
              variant: "default"
          });
      } else if (allConverted && hanjaPart.length === syllables.length) {
          form.setValue(targetFieldNameForHanja, `${koreanOnlyName} (${hanjaPart})`, { shouldValidate: true });
      } else { 
          form.setValue(targetFieldNameForHanja, koreanOnlyName, { shouldValidate: true });
      }
      setIsHanjaModalOpen(false);
    }
  };


  async function onSubmit(values: RelationshipCompatibilityFormValues) {
    setIsSubmitting(true);
    
    const queryParams = new URLSearchParams();
    Object.entries(values.person1).forEach(([key, value]) => queryParams.append(`p1_${key}`, value));

    // person2의 값을 처리하되, gender는 유효한 값만 사용
    let person2GenderIsValid = false;
    Object.entries(values.person2).forEach(([key, value]) => {
      if (key === 'gender') {
        // value가 문자열이고 'female' 또는 'male'로 시작하면 해당 값만 사용
        let cleanedGenderValue = value;
        if (typeof value === 'string') {
            if (value.startsWith('female')) {
                cleanedGenderValue = 'female';
 person2GenderIsValid = true;
            } else if (value.startsWith('male')) {
                cleanedGenderValue = 'male';
 person2GenderIsValid = true;
            }
        }
        if (cleanedGenderValue) {
            queryParams.append(`p2_${key}`, cleanedGenderValue);
        } else {
            // 유효하지 않은 gender 값이 들어온 경우 로깅 및 에러 처리
            console.error(`Invalid gender value for person2: ${value}`);
            toast({ title: "오류", description: "두 번째 분의 성별 정보가 올바르지 않습니다. 다시 시도해주세요." });
            setIsSubmitting(false);
        }
      } else {
        queryParams.append(`p2_${key}`, value);
      }
    });
    
    // 유효하지 않은 gender 값으로 인해 함수가 중간에 종료된 경우 리다이렉트 방지
    if (!person2GenderIsValid) {
 return;
    }
    router.push(`/relationship-compatibility/saju/result?${queryParams.toString()}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Heart className="text-primary h-6 w-6" /> 천생연분 궁합
          </CardTitle>
          <CardDescription className="break-words">
            두 분의 이름과 생년월일시 정보를 입력하여 서로의 궁합을 알아보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><User className="h-5 w-5"/>첫 번째 분 정보</h3>
                <PersonFormFields personNumber={1} form={form} openHanjaModal={handleOpenHanjaModal} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><User className="h-5 w-5"/>두 번째 분 정보</h3>
                <PersonFormFields personNumber={2} form={form} openHanjaModal={handleOpenHanjaModal} />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "궁합 결과 보기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>

      {isHanjaModalOpen && targetFieldNameForHanja && (
        <HanjaSelectionModal
          isOpen={isHanjaModalOpen}
          onClose={() => setIsHanjaModalOpen(false)}
          nameSyllables={nameSyllablesForModal}
          originalName={originalNameToConvert}
          onComplete={handleHanjaConversionComplete}
          targetFieldName={targetFieldNameForHanja}
        />
      )}
    </div>
  );
}

