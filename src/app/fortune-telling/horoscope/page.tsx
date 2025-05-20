
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Star, Home, CalendarIcon, Sparkles, Wand2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { CALENDAR_TYPES, GENDER_OPTIONS } from '@/lib/constants';
import { HanjaSelectionModal } from '@/components/hanja-selection-modal';
import { splitKoreanName, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  name: z.string().min(1, "이름을 입력해주세요."),
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "성별을 선택해주세요."}) }),
});

type HoroscopeFormValues = z.infer<typeof formSchema>;

export default function HoroscopePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isHanjaModalOpen, setIsHanjaModalOpen] = useState(false);
  const [nameSyllablesForModal, setNameSyllablesForModal] = useState<string[]>([]);
  const [originalNameToConvert, setOriginalNameToConvert] = useState<string>("");
  const [targetFieldNameForHanja, setTargetFieldNameForHanja] = useState<FieldPath<HoroscopeFormValues> | null>(null);

  const form = useForm<HoroscopeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      calendarType: "solar",
      name: "",
      gender: "male",
    },
  });

  const handleOpenHanjaModal = (fieldName: FieldPath<HoroscopeFormValues>) => {
    const currentNameValue = form.getValues(fieldName);
    const koreanOnlyName = currentNameValue.replace(/\s*\(.*\)\s*$/, "").trim();

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


  async function onSubmit(values: HoroscopeFormValues) {
    setIsSubmitting(true);
    const queryParams = new URLSearchParams({
      name: values.name,
      birthDate: values.birthDate,
      calendarType: values.calendarType,
      gender: values.gender,
    }).toString();
    
    router.push(`/fortune-telling/horoscope/result?${queryParams}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Star className="text-primary h-6 w-6" /> 별자리 운세
          </CardTitle>
          <CardDescription className="break-words">
            당신의 별자리를 확인하고 이번 주 운세를 알아보세요.
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
                          <Input placeholder="이름을 입력하세요" {...field} />
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
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            fromYear={1900}
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
                {isSubmitting ? <LoadingSpinner size={20} /> : "별자리 운세 보기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/fortune-telling" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            다른 운세보기
          </Button>
        </Link>
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

