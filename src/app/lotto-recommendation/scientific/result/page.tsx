
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ScientificLottoRecommendationOutput } from '@/ai/flows/scientific-lotto-recommendation-flow';
import { getLottoRecommendationsAction } from '@/app/lotto-recommendation/scientific/actions';
import { getLatestLottoDraw, type LatestWinningNumber } from '@/app/lotto-recommendation/saju/actions'; 
import { Home, TestTubeDiagonal, Sparkles, Hash, FileText, ExternalLink, RotateCcw, Newspaper, AlertTriangle, Info } from 'lucide-react';

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

interface AnalysisDataForUI {
  analyzedDrawsCount: number;
  averageSum: number;
  averageEvenOddRatio: string;
  frequentNumbers: { num: number; count: number }[];
  leastFrequentNumbers: { num: number; count: number }[];
  notAppearedNumbers: number[];
}

function ScientificLottoResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<ScientificLottoRecommendationOutput | null>(null);
  
  const [includeNumbersStr, setIncludeNumbersStr] = useState<string>("");
  const [excludeNumbersStr, setExcludeNumbersStr] = useState<string>("");
  const [analysisDataForUI, setAnalysisDataForUI] = useState<AnalysisDataForUI | null>(null);


  const [latestDraw, setLatestDraw] = useState<LatestWinningNumber | null>(null);
  const [isLoadingLatestDraw, setIsLoadingLatestDraw] = useState(true);
  const [latestDrawError, setLatestDrawError] = useState<string | null>(null);


  useEffect(() => {
    const includeParam = searchParams.get('includeNumbers');
    const excludeParam = searchParams.get('excludeNumbers');
    const numDrawsParam = searchParams.get('numberOfDrawsForAnalysis');
    
    if (!numDrawsParam) {
        setError("분석할 회차 수 정보가 누락되었습니다.");
        setIsLoading(false);
        setIsLoadingLatestDraw(false);
        return;
    }
    
    setIncludeNumbersStr(includeParam || "없음");
    setExcludeNumbersStr(excludeParam || "없음");

    const fetchRecommendation = getLottoRecommendationsAction({
      includeNumbersStr: includeParam || undefined,
      excludeNumbersStr: excludeParam || undefined,
      numberOfDrawsForAnalysisStr: numDrawsParam,
    })
    .then(result => {
      if (result.error) {
        setError(prev => prev ? `${prev}\n추천 오류: ${result.error}` : `추천 오류: ${result.error}`);
      } else {
        setLlmResult(result.llmResponse || null);
        if(result.analysisDataForUI) {
            setAnalysisDataForUI(result.analysisDataForUI);
        }
      }
    })
    .catch(err => {
      console.error("과학적 로또 번호 추천 결과 오류:", err);
      setError(prev => prev ? `${prev}\n추천 오류: ${err.message}`: `추천 오류: ${err instanceof Error ? err.message : "과학적 로또 번호 추천 결과를 가져오는 중 알 수 없는 오류가 발생했습니다."}`);
    });

    const fetchLatestLotto = getLatestLottoDraw()
      .then(data => {
        if (data.error) {
          setLatestDrawError(data.error);
        } else if (data.latestDraw) {
          setLatestDraw(data.latestDraw);
        }
      })
      .catch(err => {
        setLatestDrawError("최신 당첨 번호 로딩 중 알 수 없는 오류 발생");
        console.error("Error fetching latest draw for scientific result page:", err);
      })
      .finally(() => {
        setIsLoadingLatestDraw(false);
      });
    
    Promise.all([fetchRecommendation, fetchLatestLotto]).finally(() => {
      setIsLoading(false);
    });

  }, [searchParams]);


  if (isLoading || isLoadingLatestDraw) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">
          {isLoading ? "AI가 데이터를 분석하여 번호를 생성 중입니다..." : "최신 당첨 정보를 불러오는 중..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/lotto-recommendation/scientific')} variant="outline" className="mt-4">
          새 추천 시도
        </Button>
      </div>
    );
  }

  if (!llmResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
        <Button onClick={() => router.push('/lotto-recommendation/scientific')} variant="outline" className="mt-4">
          새 추천 시도
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" /> AI 분석 기반 추천 번호
          </CardTitle>
           <CardDescription className="text-md pt-1 flex items-start gap-1 break-words">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
              <span>
                AI가 과거 데이터 통계 (최근 {analysisDataForUI?.analyzedDrawsCount || "지정된"}회차 기준)와 입력하신 조건을 종합적으로 고려하여 추천한 번호 조합입니다.
              </span>
            </CardDescription>
            {(includeNumbersStr !== "없음" || excludeNumbersStr !== "없음") && (
                <div className="mt-2 text-sm text-muted-foreground break-words">
                    {includeNumbersStr !== "없음" && <span>포함된 숫자: {includeNumbersStr}</span>}
                    {includeNumbersStr !== "없음" && excludeNumbersStr !== "없음" && <span> / </span>}
                    {excludeNumbersStr !== "없음" && <span>제외된 숫자: {excludeNumbersStr}</span>}
                </div>
            )}
        </CardHeader>
        <CardContent className="space-y-8">
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
                  <LottoBall key={`latest-sci-res-${num}`} number={num} size="small"/>
                ))}
                <span className="text-sm font-medium text-foreground ml-1 sm:ml-2">+ 보너스:</span>
                <LottoBall number={latestDraw.bnusNo} size="small"/>
              </div>
            </div>
          )}

          {analysisDataForUI && (
            <Card className="p-6 bg-secondary/30 shadow-md">
                <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-xl text-secondary-foreground flex items-center gap-2">
                        <FileText className="h-5 w-5" /> 과거 데이터 분석 (최근 {analysisDataForUI.analyzedDrawsCount}회차 기준)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <p className="text-muted-foreground break-words">평균 당첨 번호 합계: <strong>{analysisDataForUI.averageSum.toFixed(1)}</strong></p>
                  <p className="text-muted-foreground break-words">가장 흔한 짝수:홀수 비율: <strong>{analysisDataForUI.averageEvenOddRatio}</strong></p>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px] whitespace-nowrap">구분</TableHead>
                          {Array.from({ length: Math.max(analysisDataForUI.frequentNumbers.length, analysisDataForUI.leastFrequentNumbers.length, 1) }).map((_, index) => (
                            <TableHead key={`header-num-${index}`} className="text-center whitespace-nowrap">번호 {index + 1}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analysisDataForUI.frequentNumbers.length > 0 && (
                          <>
                            <TableRow>
                              <TableCell rowSpan={2} className="font-semibold align-middle text-foreground whitespace-nowrap">자주 당첨된 번호</TableCell>
                              {analysisDataForUI.frequentNumbers.map(item => (
                                <TableCell key={`freq-num-${item.num}`} className="text-center font-medium text-foreground whitespace-nowrap">{item.num}</TableCell>
                              ))}
                              {Array.from({ length: Math.max(0, Math.max(analysisDataForUI.frequentNumbers.length, analysisDataForUI.leastFrequentNumbers.length) - analysisDataForUI.frequentNumbers.length) }).map((_, i) => <TableCell key={`freq-empty-pad-${i}`} />)}
                            </TableRow>
                            <TableRow>
                              {analysisDataForUI.frequentNumbers.map(item => (
                                <TableCell key={`freq-count-${item.num}`} className="text-center text-xs text-muted-foreground whitespace-nowrap">({item.count}회)</TableCell>
                              ))}
                              {Array.from({ length: Math.max(0, Math.max(analysisDataForUI.frequentNumbers.length, analysisDataForUI.leastFrequentNumbers.length) - analysisDataForUI.frequentNumbers.length) }).map((_, i) => <TableCell key={`freq-empty-count-pad-${i}`} />)}
                            </TableRow>
                          </>
                        )}
                        {analysisDataForUI.leastFrequentNumbers.length > 0 && (
                           <>
                            <TableRow>
                              <TableCell rowSpan={2} className="font-semibold align-middle text-foreground whitespace-nowrap">가장 적게 당첨된 번호</TableCell>
                              {analysisDataForUI.leastFrequentNumbers.map(item => (
                                <TableCell key={`least-num-${item.num}`} className="text-center font-medium text-foreground whitespace-nowrap">{item.num}</TableCell>
                              ))}
                               {Array.from({ length: Math.max(0, Math.max(analysisDataForUI.frequentNumbers.length, analysisDataForUI.leastFrequentNumbers.length) - analysisDataForUI.leastFrequentNumbers.length) }).map((_, i) => <TableCell key={`least-empty-pad-${i}`} />)}
                            </TableRow>
                            <TableRow>
                              {analysisDataForUI.leastFrequentNumbers.map(item => (
                                <TableCell key={`least-count-${item.num}`} className="text-center text-xs text-muted-foreground whitespace-nowrap">({item.count}회)</TableCell>
                              ))}
                              {Array.from({ length: Math.max(0, Math.max(analysisDataForUI.frequentNumbers.length, analysisDataForUI.leastFrequentNumbers.length) - analysisDataForUI.leastFrequentNumbers.length) }).map((_, i) => <TableCell key={`least-empty-count-pad-${i}`} />)}
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {analysisDataForUI.notAppearedNumbers && analysisDataForUI.notAppearedNumbers.length > 0 && (
                    <p className="text-sm text-muted-foreground break-words">최근 {analysisDataForUI.analyzedDrawsCount}회 동안 미출현한 주요 숫자: <strong>{analysisDataForUI.notAppearedNumbers.join(', ')}</strong></p>
                  )}
                </CardContent>
            </Card>
          )}


          {llmResult.recommendedSets.map((set, index) => (
            <Card key={index} className="p-6 bg-secondary/30 shadow-md">
               <CardHeader className="p-0 pb-3">
                 <CardTitle className="text-xl text-secondary-foreground flex items-center gap-2">
                  <Hash className="h-5 w-5" /> 추천 번호 세트 {index + 1}
                 </CardTitle>
               </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="flex space-x-2 flex-wrap gap-y-2">
                  {set.numbers.map((num) => (
                    <LottoBall key={`${index}-${num}`} number={num} />
                  ))}
                </div>
                <p className="text-base text-muted-foreground whitespace-pre-wrap break-words">
                    <strong className="text-secondary-foreground">AI 추천 근거:</strong> {set.reasoning}
                </p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
         <CardFooter className="pt-8 border-t flex-col sm:flex-row items-center gap-4">
          
        </CardFooter>
      </Card>
      
      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/lotto-recommendation/scientific" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            다른 조건으로 추천받기
          </Button>
        </Link>
        <Link href="/lotto-recommendation" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <TestTubeDiagonal className="mr-2 h-4 w-4" />
            다른 로또 정보
          </Button>
        </Link>
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

export default function ScientificLottoResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <ScientificLottoResultContent />
    </Suspense>
  );
}


