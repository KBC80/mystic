
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
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
import { PenTool, Home, CalendarIcon, Wand2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HanjaSelectionModal } from '@/components/hanja-selection-modal';
import { splitKoreanName, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "성별을 선택해주세요."}) }),
});

type NameInterpretationFormValues = z.infer<typeof formSchema>;

export default function NameInterpretationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isHanjaModalOpen, setIsHanjaModalOpen] = useState(false);
  const [nameSyllablesForModal, setNameSyllablesForModal] = useState<string[]>([]);
  const [originalNameToConvert, setOriginalNameToConvert] = useState<string>("");
  const [targetFieldNameForHanja, setTargetFieldNameForHanja] = useState<FieldPath<NameInterpretationFormValues> | null>(null);


  const form = useForm<NameInterpretationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      calendarType: "solar",
      birthTime: "모름",
      gender: "male",
    },
  });
  
  const handleOpenHanjaModal = (fieldName: FieldPath<NameInterpretationFormValues>) => {
    const currentNameValue = form.getValues(fieldName);
    // 이름에서 한자 부분 (괄호 안 내용)을 제거하고 한글만 추출
    const koreanOnlyName = currentNameValue.replace(/\s*\(.*\)\s*$/, "").trim();

    if (!koreanOnlyName) {
      toast({ title: "알림", description: "한자로 변환할 한글 이름을 입력해주세요." });
      return;
    }
    const syllables = splitKoreanName(koreanOnlyName);
    if (syllables.length > 0) {
      setNameSyllablesForModal(syllables);
      setOriginalNameToConvert(koreanOnlyName); // 한자 변환 시 기준이 될 한글 이름
      setTargetFieldNameForHanja(fieldName);
      setIsHanjaModalOpen(true);
    } else {
      toast({ title: "알림", description: "한자로 변환할 한글 이름이 없습니다." });
    }
  };

  const handleHanjaConversionComplete = (selections: (HanjaDetail | null)[]) => {
    if (targetFieldNameForHanja) {
      const koreanOnlyName = originalNameToConvert; // 모달 열 때 저장한 한글 이름 사용
      const syllables = nameSyllablesForModal; // 모달 열 때 사용한 음절 사용

      let hanjaPart = "";
      let allConverted = true;
      let someConverted = false;

      for (let i = 0; i < syllables.length; i++) {
        if (selections[i]) {
          hanjaPart += selections[i]!.hanja;
          someConverted = true;
        } else {
          // "한글 그대로"를 선택했거나, 선택하지 않은 경우 (모달에서 이 경우를 어떻게 처리하느냐에 따라 다름)
          // 현재 모달은 모든 글자를 한자로 선택하거나, 모두 한글로 유지하도록 유도.
          allConverted = false; 
        }
      }
      
      if (someConverted && !allConverted) {
          toast({
              title: "알림",
              description: "모든 글자를 한자로 변환하거나, 모든 글자를 한글로 유지해주세요. (부분 변환 미지원)",
              variant: "default" // destructive 대신 default 사용
          });
          // 부분 변환을 원하지 않으므로, 아무것도 변경하지 않거나 원본 한글 이름으로 되돌릴 수 있습니다.
          // form.setValue(targetFieldNameForHanja, koreanOnlyName, { shouldValidate: true });
      } else if (allConverted && hanjaPart.length === syllables.length) { // 모든 음절이 한자로 성공적으로 변환됨
          form.setValue(targetFieldNameForHanja, `${koreanOnlyName} (${hanjaPart})`, { shouldValidate: true });
      } else { // 모든 음절을 한글로 유지하기로 선택했거나, 변환 시도 안함
          form.setValue(targetFieldNameForHanja, koreanOnlyName, { shouldValidate: true });
      }
      setIsHanjaModalOpen(false);
    }
  };


  async function onSubmit(values: NameInterpretationFormValues) {
    setIsSubmitting(true);
    const queryParams = new URLSearchParams({
      name: values.name,
      birthDate: values.birthDate,
      calendarType: values.calendarType,
      birthTime: values.birthTime,
      gender: values.gender,
    }).toString();
    
    router.push(`/name-interpretation/result?${queryParams}`);
  }
  

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <PenTool className="text-primary h-6 w-6" /> 이름 풀이
          </CardTitle>
          <CardDescription className="break-words">
            생년월일시, 이름, 성별 정보를 입력하여 이름에 담긴 깊은 의미와 인생 경로를 알아보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="예: 홍길동" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleOpenHanjaModal("name")}>
                          <Wand2 className="mr-1 h-4 w-4" />한자 변환
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
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
                  name="calendarType"
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
                  name="birthTime"
                  render={({ field }) => (
                    <FormItem>
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
                <FormField
                  control={form.control}
                  name="gender"
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
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "내 이름의 비밀 풀기"}
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

