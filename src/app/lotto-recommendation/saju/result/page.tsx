
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { recommendLottoNumbers, type LottoNumberRecommendationInput, type LottoNumberRecommendationOutput } from '@/ai/flows/lotto-number-recommendation-flow';
import { getLatestLottoDraw, type LatestWinningNumber } from '@/app/lotto-recommendation/saju/actions';
import { Ticket, Home, Sparkles, MessageSquare, Hash, ExternalLink, RotateCcw, Newspaper, AlertTriangle } from 'lucide-react';

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

function SajuLottoResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LottoNumberRecommendationOutput | null>(null);
  const [inputName, setInputName] = useState<string>("");

  const [latestDraw, setLatestDraw] = useState<LatestWinningNumber | null>(null);
  const [isLoadingLatestDraw, setIsLoadingLatestDraw] = useState(true);
  const [latestDrawError, setLatestDrawError] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const birthDate = searchParams.get('birthDate');
    const calendarType = searchParams.get('calendarType') as LottoNumberRecommendationInput['calendarType'];
    const birthTime = searchParams.get('birthTime');

    if (!name || !birthDate || !calendarType || !birthTime) {
      setError("필수 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      setIsLoadingLatestDraw(false);
      return;
    }
    
    setInputName(name);

    const input: LottoNumberRecommendationInput = {
      name,
      birthDate,
      calendarType,
      birthTime,
    };

    const fetchRecommendation = recommendLottoNumbers(input)
      .then(recommendationResult => {
        setResult(recommendationResult);
      })
      .catch(err => {
        console.error("사주 로또 번호 추천 결과 오류:", err);
        setError(prev => prev ? `${prev}\n추천 오류: ${err.message}` : `추천 오류: ${err instanceof Error ? err.message : "사주 로또 번호 추천 결과를 가져오는 중 알 수 없는 오류가 발생했습니다."}`);
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
        console.error("Error fetching latest draw for result page:", err);
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
          {isLoading ? "사주를 분석하여 번호를 생성 중입니다..." : "최신 당첨 정보를 불러오는 중..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTitle>오류</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/lotto-recommendation/saju')} variant="outline" className="mt-4">
          새 추천 시도
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/lotto-recommendation/saju')} variant="outline" className="mt-4">
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
            <Sparkles className="h-8 w-8 text-primary" /> {inputName}님을 위한 사주 로또 번호
          </CardTitle>
          <CardDescription className="text-md pt-1 break-words">
            AI가 당신의 사주를 분석하여 추천하는 특별한 행운의 번호 조합입니다.
          </CardDescription>
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
                  <LottoBall key={`latest-res-${num}`} number={num} size="small"/>
                ))}
                <span className="text-sm font-medium text-foreground ml-1 sm:ml-2">+ 보너스:</span>
                <LottoBall number={latestDraw.bnusNo} size="small"/>
              </div>
            </div>
          )}

          {result.lottoSets.map((set, index) => (
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
                <p className="text-base text-muted-foreground whitespace-pre-wrap">
                  <strong className="text-secondary-foreground">AI 해설:</strong> {set.reasoning}
                </p>
              </CardContent>
            </Card>
          ))}
            
          <div className="pt-6 border-t">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground mb-2">
              <MessageSquare className="h-6 w-6"/> AI의 전반적인 행운 조언
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.overallAdvice}</p>
          </div>
        </CardContent>
         <CardFooter className="pt-8 border-t flex-col sm:flex-row items-center gap-4">
           {/* ShareButton removed */}
        </CardFooter>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/lotto-recommendation/saju" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            다른 정보로 추천받기
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

export default function SajuLottoResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <SajuLottoResultContent />
    </Suspense>
  );
}

