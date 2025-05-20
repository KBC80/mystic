
"use client";

import { useState, useEffect } from 'react';
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
import { EAST_ASIAN_BIRTH_TIMES, CALENDAR_TYPES } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, Home, CalendarIcon, Newspaper, AlertTriangle, ExternalLink, Wand2 } from 'lucide-react';
import { getLatestLottoDraw, type LatestWinningNumber } from '@/app/lotto-recommendation/saju/actions';
import { cn } from "@/lib/utils";
import { HanjaSelectionModal } from '@/components/hanja-selection-modal';
import { splitKoreanName, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
});

type LottoRecommendationFormValues = z.infer<typeof formSchema>;

const getLottoBallColorClass = (number: number): string => {
  if (number >= 1 && number <= 10) return 'bg-yellow-400 text-black';
  if (number >= 11 && number <= 20) return 'bg-blue-500 text-white';
  if (number >= 21 && number <= 30) return 'bg-red-500 text-white';
  if (number >= 31 && number <= 40) return 'bg-gray-600 text-white';
  if (number >= 41 && number <= 45) return 'bg-green-500 text-white';
  return 'bg-gray-300 text-black'; 
};

const LottoBall = ({ number, size = 'medium' }: { number: number, size?: 'small' | 'medium' }) => {
  const sizeClasses = size === 'small' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-lg';
  return (
    <div className={`flex items-center justify-center rounded-full font-bold shadow-md ${sizeClasses} ${getLottoBallColorClass(number)}`}>
      {number}
    </div>
  );
};

export default function SajuLottoRecommendationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [latestDraw, setLatestDraw] = useState<LatestWinningNumber | null>(null);
  const [isLoadingLatestDraw, setIsLoadingLatestDraw] = useState(true);
  const [latestDrawError, setLatestDrawError] = useState<string | null>(null);

  const [isHanjaModalOpen, setIsHanjaModalOpen] = useState(false);
  const [nameSyllablesForModal, setNameSyllablesForModal] = useState<string[]>([]);
  const [originalNameToConvert, setOriginalNameToConvert] = useState<string>("");
  const [targetFieldNameForHanja, setTargetFieldNameForHanja] = useState<FieldPath<LottoRecommendationFormValues> | null>(null);


  useEffect(() => {
    async function fetchLatest() {
      setIsLoadingLatestDraw(true);
      setLatestDrawError(null);
      try {
        const data = await getLatestLottoDraw();
        if (data.error) {
          setLatestDrawError(data.error);
        } else if (data.latestDraw) {
          setLatestDraw(data.latestDraw);
        }
      } catch (err) {
        setLatestDrawError("최신 당첨 번호 로딩 중 알 수 없는 오류 발생");
        console.error("Error fetching latest draw:", err);
      } finally {
        setIsLoadingLatestDraw(false);
      }
    }
    fetchLatest();
  }, []);

  const form = useForm<LottoRecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      calendarType: "solar",
      birthTime: "모름",
      name: "",
    },
  });

  const handleOpenHanjaModal = (fieldName: FieldPath<LottoRecommendationFormValues>) => {
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


  async function onSubmit(values: LottoRecommendationFormValues) {
    setIsSubmitting(true);
    const queryParams = new URLSearchParams({
      name: values.name,
      birthDate: values.birthDate,
      calendarType: values.calendarType,
      birthTime: values.birthTime,
    }).toString();
    
    router.push(`/lotto-recommendation/saju/result?${queryParams}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Ticket className="text-primary h-6 w-6" /> 사주 로또 번호 추천
          </CardTitle>
          <CardDescription className="break-words">
            당신의 사주 정보를 입력하시면 특별한 행운 번호를 추천해 드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLatestDraw && (
            <div className="flex items-center justify-center my-4 p-4 border rounded-md bg-secondary/10">
              <LoadingSpinner size={24} />
              <p className="ml-2 text-sm text-muted-foreground break-words">최신 당첨 정보 로딩 중...</p>
            </div>
          )}
          {latestDrawError && !isLoadingLatestDraw && (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>최신 정보 로딩 오류</AlertTitle>
              <AlertDescription className="break-words">{latestDrawError}</AlertDescription>
            </Alert>
          )}
          {latestDraw && !isLoadingLatestDraw && !latestDrawError && (
            <div className="mb-6 p-4 border rounded-md bg-secondary/20 shadow-sm">
              <h3 className="text-lg font-semibold text-secondary-foreground flex items-center mb-3">
                <Newspaper className="mr-2 h-5 w-5 text-primary" />
                최신 ({latestDraw.drwNo}회) 당첨 번호
                <span className="text-xs text-muted-foreground ml-2">({latestDraw.drwNoDate})</span>
              </h3>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-y-2">
                <span className="text-sm font-medium text-foreground">당첨번호:</span>
                {latestDraw.numbers.map((num) => (
                  <LottoBall key={`latest-${num}`} number={num} size="small"/>
                ))}
                <span className="text-sm font-medium text-foreground ml-1 sm:ml-2">+ 보너스:</span>
                <LottoBall number={latestDraw.bnusNo} size="small"/>
              </div>
            </div>
          )}

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
              </div>
              <Button type="submit" disabled={isSubmitting || isLoadingLatestDraw} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "사주 행운 번호 받기"}
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
        <a href="https://dhlottery.co.kr" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            동행복권 사이트 바로가기
          </Button>
        </a>
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

