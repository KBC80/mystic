
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLifePathNumberAnalysis, type LifePathNumberInput, type LifePathNumberOutput } from '@/ai/flows/life-path-number-flow';
import { getTarotImageForNumerology } from '@/lib/numerology-utils';
import html2canvas from 'html2canvas';
import { Home, Brain, Sparkles, Sigma, Briefcase, Users, Lightbulb, Gift, RotateCcw, Share, AlertTriangle, Palette, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

const SectionCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; className?: string; }> = ({ title, icon: Icon, children, className }) => (
  <Card className={cn("bg-secondary/20 shadow-md", className)}>
    <CardHeader className="pb-3 pt-5">
      <CardTitle className="text-xl text-primary flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

function LifePathNumberResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resultAreaRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LifePathNumberOutput | null>(null);
  const [inputBirthDate, setInputBirthDate] = useState<string>("");
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [tarotImage, setTarotImage] = useState<{ name: string; imageUrl: string; dataAiHint: string; } | null>(null);


  useEffect(() => {
    const birthDate = searchParams.get('birthDate');

    if (!birthDate) {
      setError("생년월일 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setInputBirthDate(birthDate);

    const input: LifePathNumberInput = { birthDate };

    getLifePathNumberAnalysis(input)
      .then(analysisResult => {
        setResult(analysisResult);
        if (analysisResult?.lifePathNumber) {
          setTarotImage(getTarotImageForNumerology(analysisResult.lifePathNumber));
        }
      })
      .catch(err => {
        console.error("인생여정수 분석 결과 오류:", err);
        setError(err instanceof Error ? err.message : "인생여정수 분석 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  const handleDownloadImage = async () => {
    if (!resultAreaRef.current) {
      alert("이미지 저장에 필요한 결과 영역을 찾을 수 없습니다.");
      return;
    }
    setIsSavingImage(true);
    try {
      const canvas = await html2canvas(resultAreaRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `인생여정수_${result?.lifePathNumber}_결과.png`;
      link.click();
    } catch (err) {
      console.error("이미지 저장 중 오류 발생:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">당신의 인생여정수를 분석 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>분석 오류</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/fortune-telling/numerology/life-path')} variant="outline" className="mt-4">
          다른 생년월일로 분석
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/fortune-telling/numerology/life-path')} variant="outline" className="mt-4">
          다른 생년월일로 분석
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-6 flex flex-col flex-1">
      <div ref={resultAreaRef}>
        <Card className="shadow-lg border-primary/30 bg-primary/5 dark:bg-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl text-primary flex items-center gap-3">
              <Brain className="h-8 w-8" /> 인생여정수: {result.lifePathNumber}
            </CardTitle>
            <CardDescription className="text-md pt-2 text-muted-foreground break-words">
              생년월일 ({inputBirthDate})을 바탕으로 분석된 당신의 인생여정수와 그 의미입니다.
            </CardDescription>
          </CardHeader>
           {tarotImage && (
            <CardContent className="flex flex-col items-center justify-center pt-2 pb-4">
              <p className="text-sm font-medium text-secondary-foreground mb-1">인생여정수 {result.lifePathNumber}의 타로 상징: {tarotImage.name}</p>
              <Image
                src={tarotImage.imageUrl}
                alt={tarotImage.name}
                width={100} 
                height={150}
                className="rounded-md shadow-md"
                data-ai-hint={tarotImage.dataAiHint}
              />
            </CardContent>
          )}
          <CardContent className="pt-2"> {/* 핵심 의미는 여기에 계속 표시 */}
            <p className="text-lg font-semibold text-secondary-foreground">{result.numberMeaning}</p>
          </CardContent>
        </Card>

        <SectionCard title="성격 특성" icon={Sparkles} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.personalityTraits}</p>
        </SectionCard>

        <SectionCard title="삶의 목적 / 과제" icon={Sigma} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.lifePurpose}</p>
        </SectionCard>

        <SectionCard title="추천 직업" icon={Briefcase} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.careerSuggestions}</p>
        </SectionCard>
        
        <SectionCard title="관계 궁합" icon={Users} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.relationshipCompatibility}</p>
        </SectionCard>

        <SectionCard title="삶의 조언" icon={Lightbulb} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.advice}</p>
        </SectionCard>
        
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Gift className="h-5 w-5"/> 인생여정수 행운의 숫자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
                {result.luckyNumbers.map((num) => (
                    <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold text-lg shadow-md">
                    {num}
                    </span>
                ))}
            </div>
          </CardContent>
          <CardFooter className="pt-6 border-t">
             <Button onClick={handleDownloadImage} disabled={isSavingImage} className="w-full sm:w-auto">
                <Share className="mr-2 h-4 w-4" />
                {isSavingImage ? '이미지 저장 중...' : '결과 이미지 저장'}
             </Button>
          </CardFooter>
        </Card>
      </div>

      <CardFooter className="mt-4 pt-6 border-t flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={() => router.push('/fortune-telling/numerology/life-path')} variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          다른 생년월일로 분석
        </Button>
         <Link href="/fortune-telling/numerology" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Sigma className="mr-2 h-4 w-4" />
            다른 수비학 운세
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
      </CardFooter>
    </div>
  );
}

export default function LifePathNumberResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <LifePathNumberResultContent />
    </Suspense>
  );
}
