
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { elderFutharkRunes, type Rune } from '@/lib/runes';
import { interpretRunes, type RuneReadingInput, type RuneReadingOutput } from '@/ai/flows/rune-reading-flow';
import Image from 'next/image';
import { WandSparkles, Home, Shuffle, HandCoins, HelpCircle, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";

const formSchema = z.object({
  question: z.string().optional(),
  numToDraw: z.enum(["3", "5"]),
});

type RuneReadingFormValues = z.infer<typeof formSchema>;

const RuneDisplay = ({ rune, isReversed, reveal = false, size = 'small' }: { rune: Rune; isReversed?: boolean; reveal?: boolean; size?: 'small' | 'medium' }) => {
  const baseSizeClasses = size === 'small' ? "w-14 md:w-20" : "w-24"; 
  const symbolSizeClass = size === 'small' ? "text-2xl md:text-3xl" : "text-4xl";
  const nameSizeClass = size === 'small' ? "text-[9px] md:text-[10px]" : "text-sm";
  const directionSizeClass = size === 'small' ? "text-[8px] md:text-[9px]" : "text-xs";

  if (!reveal) {
    return (
      <div className={cn(baseSizeClasses, "aspect-[2/3] bg-secondary rounded-lg flex items-center justify-center relative shadow-md overflow-hidden")}>
        <Image src="/image/rune-back.png" alt="룬 뒷면" fill style={{ objectFit: 'cover' }} className="rounded-lg" data-ai-hint="rune back"/>
      </div>
    );
  }

  return (
    <div
      className={cn(baseSizeClasses, "aspect-[2/3] rounded-lg shadow-xl flex flex-col items-center justify-center text-center p-1 relative bg-cover bg-center border border-black/20")}
      style={{ backgroundImage: "url('/image/rune-front.png')" }}
      data-ai-hint="rune front"
    >
      <div className={cn(symbolSizeClass, "font-bold text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_70%)]", isReversed && "transform rotate-180")}>
        {rune.symbol}
      </div>
      <p className={cn(nameSizeClass, "font-medium text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_70%)] mt-1 break-words")}>
        {rune.koreanName}
      </p>
      {isReversed !== undefined && (
        <p className={cn(directionSizeClass, "text-gray-200 [text-shadow:_0_1px_1px_rgb(0_0_0_/_70%)] break-words")}>
          {isReversed ? "역방향" : "정방향"}
        </p>
      )}
    </div>
  );
};


export default function RuneReadingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'shuffling' | 'drawing' | 'interpreting' | 'results'>('initial');
  const [shuffledRunes, setShuffledRunes] = useState<Rune[]>([]);
  const [drawnRunesWithStatus, setDrawnRunesWithStatus] = useState<{ rune: Rune; isReversed: boolean }[]>([]);
  const [interpretation, setInterpretation] = useState<RuneReadingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RuneReadingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      numToDraw: "3",
    },
  });

  const { watch } = form;
  const numToDraw = parseInt(watch("numToDraw"), 10);

  const handleStartReading = () => {
    setError(null);
    setStep('shuffling');
    setIsLoading(true);
    setTimeout(() => {
      const deck = [...elderFutharkRunes].sort(() => 0.5 - Math.random());
      setShuffledRunes(deck);
      setDrawnRunesWithStatus([]);
      setInterpretation(null);
      setIsLoading(false);
      setStep('drawing');
    }, 1000); // Simulate shuffling
  };

  const handleDrawRune = (runeToDraw: Rune) => {
    if (drawnRunesWithStatus.length >= numToDraw || drawnRunesWithStatus.find(dr => dr.rune.id === runeToDraw.id)) {
      return;
    }
    const isReversed = Math.random() < 0.5; // 50% chance of being reversed
    setDrawnRunesWithStatus(prev => [...prev, { rune: runeToDraw, isReversed }]);
  };

  const handleInterpretRunes = async () => {
    if (drawnRunesWithStatus.length !== numToDraw) {
      setError(`${numToDraw}개의 룬을 모두 선택해주세요.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setStep('interpreting');

    const input: RuneReadingInput = {
      question: form.getValues("question") || undefined,
      drawnRunes: drawnRunesWithStatus.map(dr => ({ name: dr.rune.name, isReversed: dr.isReversed })),
    };

    try {
      const result = await interpretRunes(input);
      setInterpretation(result);
      setStep('results');
    } catch (err) {
      console.error("룬 해석 오류:", err);
      setError(err instanceof Error ? err.message : "룬 해석 중 알 수 없는 오류가 발생했습니다.");
      setStep('drawing'); 
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetReading = () => {
    form.reset();
    setStep('initial');
    setShuffledRunes([]);
    setDrawnRunesWithStatus([]);
    setInterpretation(null);
    setError(null);
    setIsLoading(false);
  };

  const halfIndex = Math.ceil(shuffledRunes.length / 2);
  const firstRowRunes = shuffledRunes.slice(0, halfIndex);
  const secondRowRunes = shuffledRunes.slice(halfIndex);


  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <WandSparkles className="text-primary h-6 w-6" /> 룬 문자 점
          </CardTitle>
          <CardDescription className="break-words">
            고대 룬 문자의 지혜를 통해 현재 상황에 대한 통찰과 조언을 얻어보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'initial' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleStartReading)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>질문 (선택 사항)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="예: 현재 제 연애운은 어떤가요?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numToDraw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>뽑을 룬 개수</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="개수 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3개 뽑기</SelectItem>
                          <SelectItem value="5">5개 뽑기</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  룬 점 시작하기
                </Button>
              </form>
            </Form>
          )}

          {(step === 'shuffling' || (step === 'interpreting' && isLoading)) && (
            <div className="flex flex-col items-center justify-center py-10 min-h-[200px] space-y-3">
              <LoadingSpinner size={32} />
              <p className="text-muted-foreground break-words">
                {step === 'shuffling' ? "룬을 섞고 있습니다..." : "룬의 메시지를 해석 중입니다..."}
              </p>
            </div>
          )}

          {step === 'drawing' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold break-words">룬을 선택하세요 ({drawnRunesWithStatus.length}/{numToDraw})</h3>
                <p className="text-sm text-muted-foreground break-words">마음이 이끄는 대로 {numToDraw}개의 룬을 선택해주세요.</p>
              </div>
              <div className="space-y-2">
                {[firstRowRunes, secondRowRunes].map((rowRunes, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent py-1">
                    <div className="flex items-end h-auto whitespace-nowrap px-4">
                      {rowRunes.map((rune, cardIndex) => (
                        <button
                          key={rune.id}
                          onClick={() => handleDrawRune(rune)}
                          disabled={drawnRunesWithStatus.length >= numToDraw || drawnRunesWithStatus.some(dr => dr.rune.id === rune.id)}
                          className={cn(
                              "transition-all duration-200 transform",
                              cardIndex > 0 ? 'ml-[-28px] md:ml-[-40px]' : 'ml-0', // Overlap for w-14/md:w-20
                              drawnRunesWithStatus.some(dr => dr.rune.id === rune.id) && "opacity-30 cursor-not-allowed",
                              !drawnRunesWithStatus.some(dr => dr.rune.id === rune.id) && !(drawnRunesWithStatus.length >= numToDraw) && "hover:scale-105 hover:-translate-y-2"
                          )}
                          aria-label={`룬 ${rune.koreanName} 선택`}
                        >
                          <RuneDisplay rune={rune} reveal={false} size="small" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {drawnRunesWithStatus.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-center mb-2 break-words">선택한 룬:</h4>
                  <div className="flex flex-wrap justify-center gap-2 p-2 border rounded-md bg-card">
                    {drawnRunesWithStatus.map(({ rune, isReversed }) => (
                      <RuneDisplay key={`drawn-${rune.id}`} rune={rune} isReversed={isReversed} reveal={true} size="small"/>
                    ))}
                  </div>
                </div>
              )}
              {drawnRunesWithStatus.length === numToDraw && (
                <Button onClick={handleInterpretRunes} disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 mt-4">
                  {isLoading ? <LoadingSpinner size={20} /> : "해석 보기"}
                </Button>
              )}
            </div>
          )}

          {error && (step === 'drawing' || step === 'initial') && (
             <Alert variant="destructive" className="mt-4">
               <AlertTitle>오류</AlertTitle>
               <AlertDescription className="break-words">{error}</AlertDescription>
             </Alert>
           )}
          
          {step === 'results' && interpretation && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-primary flex items-center gap-2">
                    <Sparkles className="h-6 w-6"/> 룬 해석 결과
                  </CardTitle>
                  {form.getValues("question") && <CardDescription className="break-words">질문: {form.getValues("question")}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-secondary-foreground mb-3 break-words">뽑힌 룬:</h3>
                    <div className="flex flex-wrap justify-center gap-4 p-2 border rounded-md bg-secondary/20">
                        {interpretation.runeInterpretations.map(interp => {
                             const runeDetail = elderFutharkRunes.find(r => r.name === interp.name);
                             return runeDetail ? <RuneDisplay key={`res-${interp.name}`} rune={runeDetail} isReversed={interp.isReversed} reveal={true} size="medium" /> : null;
                        })}
                    </div>
                  </div>

                  {interpretation.runeInterpretations.map((interp, index) => (
                    <div key={index} className="pb-3 border-b last:border-b-0">
                      <h4 className="text-lg font-semibold text-secondary-foreground flex items-center gap-1 break-words">
                        {interp.koreanName} ({interp.symbol}) - {interp.isReversed ? "역방향" : "정방향"}
                      </h4>
                      <p className="text-muted-foreground whitespace-pre-wrap break-words">{interp.interpretation}</p>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <h3 className="text-xl font-semibold text-secondary-foreground mb-2 flex items-center gap-1 break-words">
                        <HelpCircle className="h-5 w-5"/> 종합 해석 및 조언
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap break-words">{interpretation.overallInterpretation}</p>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground mb-2 break-words">
                        <HandCoins className="h-5 w-5"/> 행운의 숫자
                    </h3>
                     <div className="flex space-x-3">
                        {interpretation.luckyNumbers.map((num) => (
                            <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold text-lg shadow-md">
                            {num}
                            </span>
                        ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={resetReading} variant="outline" className="w-full md:w-auto">
                        <RotateCcw className="mr-2 h-4 w-4"/> 새로운 점 보기
                    </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      
      {step === 'initial' && (
          <Card className="shadow-md mt-8">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" /> 룬 문자 소개
                </CardTitle>
                <CardDescription className="break-words">각 룬 문자의 기본적인 의미를 알아보세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {elderFutharkRunes.map(rune => (
                        <AccordionItem value={rune.id} key={rune.id}>
                            <AccordionTrigger className="text-base hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-primary w-8 text-center">{rune.symbol}</span>
                                    <span className="break-words">{rune.koreanName} ({rune.name})</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground pl-11 break-words">
                                {rune.description}
                                <br/><strong>정방향 키워드:</strong> {rune.keywordsUpright}
                                {rune.keywordsReversed && rune.id !== "gebo" && rune.id !== "hagalaz" && rune.id !== "isa" && rune.id !== "jera" && rune.id !== "sowilo" && rune.id !== "ingwaz" && rune.id !== "dagaz" &&
                                 <><br/><strong>역방향 키워드:</strong> {rune.keywordsReversed}</>}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      )}


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
    </div>
  );
}


