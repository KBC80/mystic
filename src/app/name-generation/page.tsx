
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
import { GENDER_OPTIONS, CALENDAR_TYPES, EAST_ASIAN_BIRTH_TIMES } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner'; 
import { Baby, Parentheses, Home, CalendarIcon, Wand2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { HanjaSelectionModal } from '@/components/hanja-selection-modal';
import { splitKoreanName, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  fatherName: z.string().min(1, "아버지 성함을 입력해주세요."),
  fatherBirthDate: z.string().min(1, "아버지 생년월일을 입력해주세요."),
  fatherCalendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "아버지 달력 유형을 선택해주세요."}) }),
  fatherBirthTime: z.string().min(1, "아버지 태어난 시간을 선택해주세요."),
  motherName: z.string().min(1, "어머니 성함을 입력해주세요."),
  motherBirthDate: z.string().min(1, "어머니 생년월일을 입력해주세요."),
  motherCalendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "어머니 달력 유형을 선택해주세요."}) }),
  motherBirthTime: z.string().min(1, "어머니 태어난 시간을 선택해주세요."),
  childLastName: z.string().min(1, "자녀의 성을 입력해주세요.").max(2, "성은 한두 글자만 가능합니다."),
  childGender: z.enum(["male", "female"], { errorMap: () => ({ message: "자녀의 성별을 선택해주세요."}) }),
});

type NameGenerationFormValues = z.infer<typeof formSchema>;

export default function NameGenerationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isFatherCalendarOpen, setIsFatherCalendarOpen] = useState(false);
  const [isMotherCalendarOpen, setIsMotherCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isHanjaModalOpen, setIsHanjaModalOpen] = useState(false);
  const [nameSyllablesForModal, setNameSyllablesForModal] = useState<string[]>([]);
  const [originalNameToConvert, setOriginalNameToConvert] = useState<string>("");
  const [targetFieldNameForHanja, setTargetFieldNameForHanja] = useState<FieldPath<NameGenerationFormValues> | null>(null);


  const form = useForm<NameGenerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fatherName: "",
      fatherBirthDate: "",
      fatherCalendarType: "solar",
      fatherBirthTime: "모름",
      motherName: "",
      motherBirthDate: "",
      motherCalendarType: "solar",
      motherBirthTime: "모름",
      childLastName: "",
      childGender: "male",
    },
  });

  const handleOpenHanjaModal = (fieldName: FieldPath<NameGenerationFormValues>) => {
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


  async function onSubmit(values: NameGenerationFormValues) {
    setIsSubmitting(true);
    const queryParams = new URLSearchParams({
      fatherName: values.fatherName,
      fatherBirthDate: values.fatherBirthDate,
      fatherCalendarType: values.fatherCalendarType,
      fatherBirthTime: values.fatherBirthTime,
      motherName: values.motherName,
      motherBirthDate: values.motherBirthDate,
      motherCalendarType: values.motherCalendarType,
      motherBirthTime: values.motherBirthTime,
      childLastName: values.childLastName,
      childGender: values.childGender,
    }).toString();
    
    router.push(`/name-generation/result?${queryParams}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Baby className="text-primary h-6 w-6" /> 작명 도우미
          </CardTitle>
          <CardDescription className="break-words">
            부모님과 자녀 정보를 입력하시면 아이를 위한 아름답고 의미 있는 이름 다섯 개를 추천해 드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><Parentheses className="h-5 w-5"/>아버지 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아버지 성함</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder="홍길동" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" size="sm" onClick={() => handleOpenHanjaModal("fatherName")}>
                             <Wand2 className="mr-1 h-4 w-4" />한자 변환
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherBirthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>아버지 생년월일</FormLabel>
                        <Popover open={isFatherCalendarOpen} onOpenChange={setIsFatherCalendarOpen}>
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
                                  setIsFatherCalendarOpen(false);
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
                    name="fatherCalendarType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아버지 달력 유형</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="달력 유형 선택" />
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
                    name="fatherBirthTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아버지 태어난 시간</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="태어난 시간 선택" />
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
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><Parentheses className="h-5 w-5"/>어머니 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>어머니 성함</FormLabel>
                         <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder="성춘향" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" size="sm" onClick={() => handleOpenHanjaModal("motherName")}>
                             <Wand2 className="mr-1 h-4 w-4" />한자 변환
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="motherBirthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>어머니 생년월일</FormLabel>
                        <Popover open={isMotherCalendarOpen} onOpenChange={setIsMotherCalendarOpen}>
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
                                setIsMotherCalendarOpen(false);
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
                    name="motherCalendarType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>어머니 달력 유형</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="달력 유형 선택" />
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
                    name="motherBirthTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>어머니 태어난 시간</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="태어난 시간 선택" />
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
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><Baby className="h-5 w-5"/>자녀 정보</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name="childLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>자녀 성</FormLabel>
                          <FormControl>
                            <Input placeholder="예) 김" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="childGender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>자녀 성별</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="자녀의 성별을 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GENDER_OPTIONS.map((gender) => (
                                <SelectItem key={gender.value} value={gender.value}>
                                  {gender.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "길운 이름 생성하기"}
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

