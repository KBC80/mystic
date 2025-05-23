
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Share, AlertTriangle } from 'lucide-react';
import { getYearlyFortune, type GetYearlyFortuneInput, type GetYearlyFortuneOutput } from '@/ai/flows/yearly-fortune-flow';
import { TrendingUp, Heart, Shield, Briefcase, Users, Star, Gift, Home, Sparkles, Palmtree, Coins, CalendarDays, RotateCcw } from 'lucide-react';

const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function YearlyFortuneResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GetYearlyFortuneOutput | null>(null);
  const [inputName, setInputName] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [isSavingImage, setIsSavingImage] = useState(false);
  const resultAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const name = searchParams.get('name');
    const birthDate = searchParams.get('birthDate');
    const calendarType = searchParams.get('calendarType') as GetYearlyFortuneInput['calendarType'];
    const birthTime = searchParams.get('birthTime');
    const gender = searchParams.get('gender') as GetYearlyFortuneInput['gender'];

    if (!name || !birthDate || !calendarType || !birthTime || !gender) {
      setError("필수 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setInputName(name);
    setCurrentYear(new Date().getFullYear());


    const input: GetYearlyFortuneInput = {
      name,
      birthDate,
      calendarType,
      birthTime,
      gender,
    };

    getYearlyFortune(input)
      .then(fortuneResult => {
        setResult(fortuneResult);
      })
      .catch(err => {
        console.error("올해 운세 결과 오류:", err);
        setError(err instanceof Error ? err.message : "올해 운세 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  const handleDownloadImage = async () => {
    if (!resultAreaRef.current) {
      console.error("결과 영역을 찾을 수 없습니다.");
      alert("이미지 저장에 필요한 정보를 찾을 수 없습니다.");
      return;
    }
    setIsSavingImage(true);
    try {
      const canvas = await html2canvas(resultAreaRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      const nameForFile = inputName.replace(/\s*\(.*\)\s*$/, "").trim() || "올해운세";
      link.download = `${nameForFile}_${currentYear}년운세결과.png`;
      link.click();
    } catch (error) {
      console.error("이미지 저장 중 오류 발생:", error);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">올 한 해의 기운을 분석하고 있습니다...</p>
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
        <Button onClick={() => router.push('/fortune-telling/year')} variant="outline" className="mt-4">
          다른 정보로 운세 보기
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/fortune-telling/year')} variant="outline" className="mt-4">
          다른 정보로 운세 보기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg" ref={resultAreaRef}>
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" /> {currentYear}년 운세 ({inputName}님)
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Card className="bg-secondary/30">
              <CardHeader className="pb-2 pt-4 flex flex-row items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-600"/>
                <CardTitle className="text-xl text-primary">재물운</CardTitle>
              </CardHeader>
              <CardContent className="pb-4"><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.financial}</p></CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground mb-3">
              <CalendarDays className="h-6 w-6 text-indigo-500"/> 월별 운세
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {result.monthlyBreakdown.map((fortune, index) => (
                <Card key={index} className="p-3 bg-secondary/20">
                  <CardHeader className="p-0 pb-1">
                    <CardTitle className="text-md text-primary">{MONTH_NAMES[index]}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">{fortune}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
            
          <div className="pt-6 border-t">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground mb-2">
              <Gift className="h-6 w-6 text-red-500"/> 올해의 행운의 숫자
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
           <Button onClick={handleDownloadImage} disabled={isSavingImage} className="w-full sm:w-auto">
               <Share className="mr-2 h-4 w-4" />
               {isSavingImage ? '이미지 저장 중...' : '결과 이미지 저장'}
           </Button>
        </CardFooter>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/fortune-telling/year" passHref>
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

export default function YearlyFortuneResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <YearlyFortuneResultContent />
    </Suspense>
  );
}
