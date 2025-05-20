
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, TestTubeDiagonal, BarChart, CheckSquare, XSquare, TrendingUp, Info, ExternalLink, FileText, Sigma, HelpCircle } from 'lucide-react';
import { getInitialScientificLottoData, type ProcessedWinningNumber, type CalculatedAverages } from '@/app/lotto-recommendation/scientific/actions';
import { cn } from '@/lib/utils';

const createAnalysisFormSchema = (latestDrawNo: number | null) => z.object({
  numberOfDrawsForAnalysis: z.string()
    .min(1, "분석할 회차 수를 입력해주세요.")
    .refine(val => {
      const num = parseInt(val, 10);
      if (isNaN(num)) return false;
      if (num < 5) return false;
      if (latestDrawNo !== null && num > latestDrawNo) return false;
      return true;
    }, { 
      message: latestDrawNo 
                 ? `분석할 회차 수는 5에서 ${latestDrawNo} 사이의 숫자여야 합니다.` 
                 : "분석할 회차 수는 5 이상이어야 합니다. (최신 회차 정보 로딩 중)" 
    }),
});


type AnalysisFormValues = z.infer<ReturnType<typeof createAnalysisFormSchema>>;

const recommendationFormSchema = z.object({
  includeNumbers: z.string().optional().refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => parseInt(n.trim(), 10));
    return nums.every(n => !isNaN(n) && n >= 1 && n <= 45);
  }, { message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." })
  .refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => n.trim()).filter(n => n !== "");
    return new Set(nums).size === nums.length;
  }, { message: "포함할 숫자에 중복된 값이 있습니다."}),
  excludeNumbers: z.string().optional().refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => parseInt(n.trim(), 10));
    return nums.every(n => !isNaN(n) && n >= 1 && n <= 45);
  }, { message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." })
  .refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => n.trim()).filter(n => n !== "");
    return new Set(nums).size === nums.length;
  }, { message: "제외할 숫자에 중복된 값이 있습니다."}),
}).refine(data => {
    if (!data.includeNumbers || !data.excludeNumbers) return true;
    const includeArr = data.includeNumbers.split(',').map(n => n.trim()).filter(n => n !== "");
    const excludeArr = data.excludeNumbers.split(',').map(n => n.trim()).filter(n => n !== "");
    return !includeArr.some(n => excludeArr.includes(n));
}, { message: "포함할 숫자와 제외할 숫자에 중복된 값이 있습니다.", path: ["includeNumbers"] });


type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;

const getLottoBallColorClass = (number: number): string => {
  if (number >= 1 && number <= 10) return 'bg-yellow-400 text-black';
  if (number >= 11 && number <= 20) return 'bg-blue-500 text-white';
  if (number >= 21 && number <= 30) return 'bg-red-500 text-white';
  if (number >= 31 && number <= 40) return 'bg-gray-600 text-white';
  if (number >= 41 && number <= 45) return 'bg-green-500 text-white';
  return 'bg-gray-300 text-black'; 
};

const LottoBall = ({ number, size = 'medium' }: { number: number, size?: 'small' | 'medium' }) => {
  const sizeClasses = size === 'small' ? 'h-9 w-9 text-sm' : 'h-10 w-10 text-lg';
  return (
    <div className={`flex items-center justify-center rounded-full font-bold shadow-md ${sizeClasses} ${getLottoBallColorClass(number)}`}>
      {number}
    </div>
  );
};

export default function ScientificLottoRecommendationPage() {
  const router = useRouter();
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isSubmittingRecommendation, setIsSubmittingRecommendation] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  
  const [recentDrawsForDisplay, setRecentDrawsForDisplay] = useState<ProcessedWinningNumber[]>([]);
  const [analysisResults, setAnalysisResults] = useState<CalculatedAverages | null>(null);
  const [analyzedDrawsCountInput, setAnalyzedDrawsCountInput] = useState<string>("24");
  const [latestDrawNo, setLatestDrawNo] = useState<number | null>(null);


  const analysisSchema = useMemo(() => createAnalysisFormSchema(latestDrawNo), [latestDrawNo]);

  const analysisForm = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      numberOfDrawsForAnalysis: "24",
    },
     mode: "onChange", // To reflect dynamic error messages from schema
  });

  const recommendationForm = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      includeNumbers: "",
      excludeNumbers: "",
    },
  });

  useEffect(() => {
    async function loadInitialData() {
      setIsInitialLoading(true);
      setError(null);
      try {
        const data = await getInitialScientificLottoData(); 
        if (data.error) {
          setError(data.error);
        } else {
          if (data.recentDraws) setRecentDrawsForDisplay(data.recentDraws);
          if (data.latestDrawNo) {
            setLatestDrawNo(data.latestDrawNo);
            // Adjust default value if it's now invalid
            const currentDefault = parseInt(analysisForm.getValues("numberOfDrawsForAnalysis"), 10);
            if (data.latestDrawNo < currentDefault && data.latestDrawNo >= 5) {
              analysisForm.setValue("numberOfDrawsForAnalysis", data.latestDrawNo.toString(), { shouldValidate: true });
            } else if (currentDefault < 5){
               analysisForm.setValue("numberOfDrawsForAnalysis", "5", { shouldValidate: true });
            }
             analysisForm.trigger("numberOfDrawsForAnalysis"); // Re-validate with new latestDrawNo
          }
        }
      } catch (err) {
        console.error("초기 데이터 로딩 오류:", err);
        setError(err instanceof Error ? err.message : "초기 데이터 로딩 중 오류 발생");
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // analysisForm is not stable in deps array if schema changes

  useEffect(() => {
    if (latestDrawNo !== null) {
      const currentValStr = analysisForm.getValues("numberOfDrawsForAnalysis");
      const currentVal = parseInt(currentValStr, 10);
      
      if (!isNaN(currentVal)) {
        if (currentVal > latestDrawNo) {
          analysisForm.setValue("numberOfDrawsForAnalysis", latestDrawNo.toString(), { shouldValidate: true });
        } else if (currentVal < 5) {
           analysisForm.setValue("numberOfDrawsForAnalysis", "5", { shouldValidate: true });
        }
      } else if (currentValStr === "" && analysisForm.formState.isSubmitted) { 
        // If empty and submitted, let validation handle it
      } else if (latestDrawNo < 24 && currentValStr === "24"){ // Initial default might be too high
         analysisForm.setValue("numberOfDrawsForAnalysis", latestDrawNo.toString(), { shouldValidate: true });
      }
      analysisForm.trigger("numberOfDrawsForAnalysis");
    }
  }, [latestDrawNo, analysisForm]);


  async function onAnalysisSubmit(values: AnalysisFormValues) {
    setIsLoadingAnalysis(true);
    setError(null);
    setAnalysisResults(null);
    const numDrawsToAnalyze = parseInt(values.numberOfDrawsForAnalysis, 10);
    if (latestDrawNo !== null && numDrawsToAnalyze > latestDrawNo) {
        setError(`분석할 회차 수는 최신 회차(${latestDrawNo}회)를 넘을 수 없습니다.`);
        setIsLoadingAnalysis(false);
        analysisForm.setValue("numberOfDrawsForAnalysis", latestDrawNo.toString(), {shouldValidate: true});
        return;
    }

    setAnalyzedDrawsCountInput(values.numberOfDrawsForAnalysis);
    try {
      const data = await getInitialScientificLottoData(values.numberOfDrawsForAnalysis);
      if (data.error) {
        setError(data.error);
      } else {
        if (data.averages) setAnalysisResults(data.averages);
        if (data.latestDrawNo && !latestDrawNo) setLatestDrawNo(data.latestDrawNo); // Update if not already set
      }
    } catch (err) {
      console.error("과거 데이터 분석 오류:", err);
      setError(err instanceof Error ? err.message : "과거 데이터 분석 중 오류 발생");
    } finally {
      setIsLoadingAnalysis(false);
    }
  }

  async function onRecommendationSubmit(values: RecommendationFormValues) {
    setIsSubmittingRecommendation(true);
    const queryParams = new URLSearchParams();
    if (values.includeNumbers) queryParams.append('includeNumbers', values.includeNumbers);
    if (values.excludeNumbers) queryParams.append('excludeNumbers', values.excludeNumbers);
    queryParams.append('numberOfDrawsForAnalysis', analyzedDrawsCountInput); 
    
    router.push(`/lotto-recommendation/scientific/result?${queryParams.toString()}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TestTubeDiagonal className="text-primary h-6 w-6" /> 과학적 로또 번호 추천
          </CardTitle>
          <CardDescription className="flex items-start gap-1 break-words">
             <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
            <span>
                실제 동행복권 API 데이터를 기반으로 로또 번호를 추천해 드립니다. 분석할 회차 수를 입력하고, 필요시 조건을 설정하세요.
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {isInitialLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground break-words">최신 당첨 번호 로딩 중...</p>
        </div>
      )}
      
      {error && !isInitialLoading && !isLoadingAnalysis && !isSubmittingRecommendation && ( 
        <Alert variant="destructive" className="my-4">
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
      )}

      {!isInitialLoading && recentDrawsForDisplay.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BarChart className="h-5 w-5 text-secondary-foreground" />최근 당첨 번호 (최신 5회)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회차</TableHead>
                    <TableHead>추첨일</TableHead>
                    <TableHead>당첨 번호</TableHead>
                    <TableHead>보너스</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDrawsForDisplay.map((win) => (
                    <TableRow key={win.drwNo}>
                      <TableCell className="whitespace-nowrap">{win.drwNo}회</TableCell>
                      <TableCell className="whitespace-nowrap">{win.drwNoDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {win.numbers.map(num => (
                            <LottoBall key={num} number={num} size="small" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <LottoBall number={win.bnusNo} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             <CardDescription className="text-xs mt-2 text-muted-foreground break-words">* 최신 5회차의 당첨번호입니다. 실제 데이터는 동행복권 API를 통해 제공됩니다.</CardDescription>
          </CardContent>
        </Card>
      )}
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sigma className="h-5 w-5 text-primary" /> 과거 데이터 분석 조건 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...analysisForm}>
            <form onSubmit={analysisForm.handleSubmit(onAnalysisSubmit)} className="space-y-4">
              <FormField
                control={analysisForm.control}
                name="numberOfDrawsForAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                        <FileText className="h-4 w-4"/> 분석할 최근 회차 수 (5 ~ {latestDrawNo ?? '최신회차'})
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="5" 
                        max={latestDrawNo?.toString()}
                        placeholder={latestDrawNo ? `예: ${Math.min(24, latestDrawNo)}` : "예: 24"} 
                        {...field} 
                        disabled={latestDrawNo === null}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoadingAnalysis || latestDrawNo === null} className="w-full md:w-auto">
                {isLoadingAnalysis ? <LoadingSpinner size={20} /> : "과거 데이터 분석하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoadingAnalysis && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={28} />
          <p className="ml-2 text-muted-foreground break-words">과거 데이터 분석 중...</p>
        </div>
      )}

      {analysisResults && !isLoadingAnalysis && (
         <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary-foreground" />
                과거 데이터 분석 (최근 {analysisResults.analyzedDrawsCount}회차 기준)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-base text-muted-foreground break-words">
                    평균 당첨 번호 합계: <strong className="text-foreground">{analysisResults.averageSum.toFixed(1)}</strong> (일반적인 범위: 100-180)
                </p>
                <p className="text-base text-muted-foreground break-words">
                    가장 흔한 짝수:홀수 비율: <strong className="text-foreground">{analysisResults.averageEvenOddRatio}</strong>
                </p>

                 {(analysisResults.frequentNumbers && analysisResults.frequentNumbers.length > 0) || (analysisResults.leastFrequentNumbers && analysisResults.leastFrequentNumbers.length > 0) ? (
                    <div className="mt-3 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[150px] whitespace-nowrap">구분</TableHead>
                            {Array.from({ length: Math.max(analysisResults.frequentNumbers?.length || 0, analysisResults.leastFrequentNumbers?.length || 0, 1) }).map((_, index) => (
                              <TableHead key={`header-num-${index}`} className="text-center whitespace-nowrap">번호 {index + 1}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisResults.frequentNumbers && analysisResults.frequentNumbers.length > 0 && (
                            <>
                              <TableRow>
                                <TableCell rowSpan={2} className="font-semibold align-middle text-foreground whitespace-nowrap">자주 당첨된 번호</TableCell>
                                {analysisResults.frequentNumbers.map(item => (
                                  <TableCell key={`freq-num-${item.num}`} className="text-center font-medium whitespace-nowrap">{item.num}</TableCell>
                                ))}
                                {Array.from({ length: Math.max(0, Math.max(analysisResults.frequentNumbers?.length || 0, analysisResults.leastFrequentNumbers?.length || 0) - analysisResults.frequentNumbers.length) }).map((_, i) => <TableCell key={`freq-empty-pad-${i}`} />)}
                              </TableRow>
                              <TableRow>
                                {analysisResults.frequentNumbers.map(item => (
                                  <TableCell key={`freq-count-${item.num}`} className="text-center text-xs text-muted-foreground whitespace-nowrap">({item.count}회)</TableCell>
                                ))}
                                {Array.from({ length: Math.max(0, Math.max(analysisResults.frequentNumbers?.length || 0, analysisResults.leastFrequentNumbers?.length || 0) - analysisResults.frequentNumbers.length) }).map((_, i) => <TableCell key={`freq-empty-count-pad-${i}`} />)}
                              </TableRow>
                            </>
                          )}
                          {analysisResults.leastFrequentNumbers && analysisResults.leastFrequentNumbers.length > 0 && (
                             <>
                              <TableRow>
                                <TableCell rowSpan={2} className="font-semibold align-middle text-foreground whitespace-nowrap">가장 적게 당첨된 번호</TableCell>
                                {analysisResults.leastFrequentNumbers.map(item => (
                                  <TableCell key={`least-num-${item.num}`} className="text-center font-medium whitespace-nowrap">{item.num}</TableCell>
                                ))}
                                 {Array.from({ length: Math.max(0, Math.max(analysisResults.frequentNumbers?.length || 0, analysisResults.leastFrequentNumbers?.length || 0) - analysisResults.leastFrequentNumbers.length) }).map((_, i) => <TableCell key={`least-empty-pad-${i}`} />)}
                              </TableRow>
                              <TableRow>
                                {analysisResults.leastFrequentNumbers.map(item => (
                                  <TableCell key={`least-count-${item.num}`} className="text-center text-xs text-muted-foreground whitespace-nowrap">({item.count}회)</TableCell>
                                ))}
                                {Array.from({ length: Math.max(0, Math.max(analysisResults.frequentNumbers?.length || 0, analysisResults.leastFrequentNumbers?.length || 0) - analysisResults.leastFrequentNumbers.length) }).map((_, i) => <TableCell key={`least-empty-count-pad-${i}`} />)}
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground break-words">번호 빈도수 데이터를 표시할 수 없습니다.</p>
                  )}
            </CardContent>
        </Card>
      )}

      {analysisResults && !isLoadingAnalysis && ( 
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <HelpCircle className="text-primary h-5 w-5" /> AI 번호 추천 조건 설정
            </CardTitle>
            <CardDescription className="break-words">
              포함하거나 제외할 숫자를 선택하고, AI 추천 번호를 받아보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...recommendationForm}>
              <form onSubmit={recommendationForm.handleSubmit(onRecommendationSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={recommendationForm.control}
                    name="includeNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><CheckSquare className="h-4 w-4"/> 포함할 숫자 (선택, 최대 6개, 쉼표로 구분)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 7, 14, 21" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={recommendationForm.control}
                    name="excludeNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><XSquare className="h-4 w-4"/> 제외할 숫자 (선택, 쉼표로 구분)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 1, 10, 45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isSubmittingRecommendation || isLoadingAnalysis} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSubmittingRecommendation ? <LoadingSpinner size={20} /> : "AI 과학적 번호 추천 받기"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}


