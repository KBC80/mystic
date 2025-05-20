"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, SparklesIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import { personalizedHoroscope, type PersonalizedHoroscopeInput, type PersonalizedHoroscopeOutput } from "@/ai/flows/personalized-horoscopes";
import { useToast } from "@/hooks/use-toast";

const zodiacSigns = [
  "Aries (양자리)", "Taurus (황소자리)", "Gemini (쌍둥이자리)", "Cancer (게자리)", 
  "Leo (사자자리)", "Virgo (처녀자리)", "Libra (천칭자리)", "Scorpio (전갈자리)", 
  "Sagittarius (궁수자리)", "Capricorn (염소자리)", "Aquarius (물병자리)", "Pisces (물고기자리)"
] as const;


const formSchema = z.object({
  birthDate: z.date({ required_error: "생년월일을 입력해주세요." }),
  zodiacSign: z.enum(zodiacSigns, { required_error: "별자리를 선택해주세요." }),
});

type FormValues = z.infer<typeof formSchema>;

async function handleGetHoroscope(data: PersonalizedHoroscopeInput): Promise<PersonalizedHoroscopeOutput | { error: string }> {
  "use server";
  try {
    const result = await personalizedHoroscope(data);
    return result;
  } catch (error) {
    console.error("Horoscope generation error:", error);
    return { error: "운세 생성에 실패했습니다. 다시 시도해주세요." };
  }
}

export default function PersonalizedHoroscopesPage() {
  const [horoscopeResult, setHoroscopeResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setHoroscopeResult(null);

    const inputForAI: PersonalizedHoroscopeInput = {
      birthDate: format(data.birthDate, "yyyy-MM-dd"),
      zodiacSign: data.zodiacSign,
    };
    
    const result = await handleGetHoroscope(inputForAI);

    if ('error' in result) {
      toast({
        variant: "destructive",
        title: "오류",
        description: result.error,
      });
    } else {
      setHoroscopeResult(result.horoscope);
    }
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">재미로 보는 운세</CardTitle>
              <CardDescription>생년월일과 별자리를 입력하여 맞춤 운세를 확인하세요.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>생년월일</FormLabel>
                    <Popover>
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
                              format(field.value, "PPP")
                            ) : (
                              <span>날짜를 선택하세요</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zodiacSign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>별자리</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="별자리를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zodiacSigns.map(sign => (
                            <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <LoadingSpinner size="sm" className="mr-2"/> : null}
                운세 보기
              </Button>
            </form>
          </Form>
        </CardContent>
        {isLoading && <LoadingSpinner />}
        {horoscopeResult && !isLoading && (
          <CardFooter>
            <Card className="w-full bg-muted/50 p-4">
              <CardTitle className="text-lg mb-2">오늘의 운세</CardTitle>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{horoscopeResult}</p>
            </Card>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
