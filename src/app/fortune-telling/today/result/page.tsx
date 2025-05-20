
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDailyFortune, type GetDailyFortuneInput, type GetDailyFortuneOutput } from '@/ai/flows/todays-fortune-flow';
import { CalendarHeart, Heart, Shield, Briefcase, Users, Star, Gift, Home, Sparkles, Palmtree, RotateCcw } from 'lucide-react';

function TodaysFortuneResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GetDailyFortuneOutput | null>(null);
  const [inputName, setInputName] = useState<string>("");

  useEffect(() => {
    const name = searchParams.get('name');
    const birthDate = searchParams.get('birthDate');
    const calendarType = searchParams.get('calendarType') as GetDailyFortuneInput['calendarType'];
    const birthTime = searchParams.get('birthTime');
    const gender = searchParams.get('gender') as GetDailyFortuneInput['gender'];

    if (!name || !birthDate || !calendarType || !birthTime || !gender) {
      setError("필수 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setInputName(name);

    const input: GetDailyFortuneInput = {
      name,
      birthDate,
      calendarType,
      birthTime,
      gender,
    };

    getDailyFortune(input)
      .then(fortuneResult => {
        setResult(fortuneResult);
      })
      .catch(err => {
        console.error("오늘의 운세 결과 오류:", err);
        setError(err instanceof Error ? err.message : "오늘의 운세 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">별의 기운을 읽고 있습니다...</p>
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
        <Button onClick={() => router.push('/fortune-telling/today')} variant="outline" className="mt-4">
          다른 정보로 운세 보기
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/fortune-telling/today')} variant="outline" className="mt-4">
          다른 정보로 운세 보기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <CalendarHeart className="h-8 w-8 text-primary" /> 오늘의 운세 ({inputName}님)
          </CardTitle>
          <CardDescription className="text-md pt-1 flex items-center gap-1 break-words">
            <Sparkles className="h-4 w-4 text-yellow-500"/> 당신의 {result.gapjaYearName} ({result.zodiacColor} {result.zodiacAnimal})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground mb-2">
              <Star className="h-6 w-6 text-yellow-400"/> 종합운
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.overallFortune}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-secondary/30">
              <CardHeader className="pb-2 pt-4 flex flex-row items-center gap-2">
                <Heart className="h-6 w-6 text-pink-500"/>
                <CardTitle className="text-xl text-primary">애정운</CardTitle>
              </CardHeader>
              <CardContent className="pb-4"><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.love}</p></CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardHeader className="pb-2 pt-4 flex flex-row items-center gap-2">
                <Shield className="h-6 w-6 text-green-500"/>
                <CardTitle className="text-xl text-primary">건강운</CardTitle>
              </CardHeader>
              <CardContent className="pb-4"><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.health}</p></CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardHeader className="pb-2 pt-4 flex flex-row items-center gap-2">
                <Briefcase className="h-6 w-6 text-blue-500"/>
                <CardTitle className="text-xl text-primary">직업운/학업운</CardTitle>
              </CardHeader>
              <CardContent className="pb-4"><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.work}</p></CardContent>
            </Card>
            <Card className="bg-secondary/30">
              <CardHeader className="pb-2 pt-4 flex flex-row items-center gap-2">
                <Users className="h-6 w-6 text-purple-500"/>
                <CardTitle className="text-xl text-primary">대인관계운</CardTitle>
              </CardHeader>
              <CardContent className="pb-4"><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.relationships}</p></CardContent>
            </Card>
          </div>
            
          <div className="pt-6 border-t">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground mb-2">
              <Gift className="h-6 w-6 text-red-500"/> 오늘의 행운의 숫자
            </h3>
            <div className="flex space-x-3 mt-2">
              {result.luckyNumbers.map((num) => (
                <span key={num} className="flex items-center justify-center h-12 w-12 rounded-full bg-accent text-accent-foreground font-bold text-xl shadow-md">
                  {num}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
         <CardFooter className="pt-8 border-t flex-col sm:flex-row items-center gap-4">
            {/* ShareButton removed */}
        </CardFooter>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/fortune-telling/today" passHref>
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                다른 정보로 운세 보기
            </Button>
        </Link>
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

export default function TodaysFortuneResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <TodaysFortuneResultContent />
    </Suspense>
  );
}

