
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { dreamInterpretation, type DreamInterpretationOutput, type DreamInterpretationInput } from '@/ai/flows/dream-interpretation';
import { CloudMoon, Sparkles, AlertTriangle, Gift, WandSparkles, Home, MessageCircle, RotateCcw } from 'lucide-react';

function DreamInterpretationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DreamInterpretationOutput | null>(null);
  const [dreamContent, setDreamContent] = useState<string>("");

  useEffect(() => {
    const content = searchParams.get('dreamContent');

    if (!content) {
      setError("해석할 꿈 내용이 없습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setDreamContent(content);

    const input: DreamInterpretationInput = { dreamContent: content };

    dreamInterpretation(input)
      .then(interpretationResult => {
        setResult(interpretationResult);
      })
      .catch(err => {
        console.error("꿈 해석 결과 오류:", err);
        setError(err instanceof Error ? err.message : "꿈 해석 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  const getOmenText = (omen?: 'good' | 'bad' | 'neutral') => {
    if (!omen) return '알 수 없음';
    switch (omen) {
      case 'good':
        return '좋은 징조';
      case 'bad':
        return '나쁜 징조';
      default:
        return '중립적인 징조';
    }
  };

  const getOmenStyle = (omen?: 'good' | 'bad' | 'neutral') => {
     if (!omen) return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900';
    switch (omen) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'bad':
        return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">당신의 꿈의 신비를 풀고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTitle>해석 오류</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dream-interpretation')} variant="outline" className="mt-4">
          다른 꿈 해석하기
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/dream-interpretation')} variant="outline" className="mt-4">
          다른 꿈 해석하기
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <WandSparkles className="h-8 w-8 text-primary"/> 당신의 꿈 해석
          </CardTitle>
          <CardDescription className="text-md pt-1 flex items-start gap-1 break-words">
            <MessageCircle className="h-4 w-4 mt-1 text-muted-foreground shrink-0"/>
            <span className="italic">"{dreamContent.length > 100 ? `${dreamContent.substring(0, 100)}...` : dreamContent}"</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
              <Sparkles className="h-6 w-6 text-yellow-400"/> 꿈 요약
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.summary}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
              <CloudMoon className="h-6 w-6"/> 상징 분석
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.symbolAnalysis}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
              <Sparkles className="h-6 w-6 text-purple-400"/> 꿈의 징조
            </h3>
            <p className={`px-4 py-2 inline-block rounded-lg text-md font-semibold shadow-md ${getOmenStyle(result.omen)}`}>
              {getOmenText(result.omen)}
            </p>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
                <AlertTriangle className="h-6 w-6 text-orange-500"/> 추가 주의사항
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.additionalCautions}</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
                <Sparkles className="h-6 w-6 text-green-500"/> 좋은 운세
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.goodFortune}</p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground mb-2">
              <Gift className="h-6 w-6 text-red-500"/> 꿈에서 나온 행운의 숫자
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
        <Link href="/dream-interpretation" passHref>
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                다른 꿈 해석하기
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

export default function DreamInterpretationResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <DreamInterpretationResultContent />
    </Suspense>
  );
}

