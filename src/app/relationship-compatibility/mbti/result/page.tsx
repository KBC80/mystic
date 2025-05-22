
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getMbtiCompatibility, type MbtiCompatibilityInput, type MbtiCompatibilityOutput } from '@/ai/flows/mbti-compatibility-flow';
import html2canvas from 'html2canvas';
import { Brain, Home, Users, Heart, Sparkles, Gift, Activity, Lightbulb, ThumbsUp, ThumbsDown, RotateCcw, Share, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

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

function MbtiCompatibilityResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MbtiCompatibilityOutput | null>(null);
  const [person1Mbti, setPerson1Mbti] = useState("");
  const [person2Mbti, setPerson2Mbti] = useState("");
  const [person1Name, setPerson1Name] = useState<string | null>(null);
  const [person2Name, setPerson2Name] = useState<string | null>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const resultAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p1Mbti = searchParams.get('p1mbti');
    const p2Mbti = searchParams.get('p2mbti');
    const p1Name = searchParams.get('p1name');
    const p2Name = searchParams.get('p2name');

    if (!p1Mbti || !p2Mbti) {
      setError("MBTI 유형 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setPerson1Mbti(p1Mbti);
    setPerson2Mbti(p2Mbti);
    if (p1Name) setPerson1Name(p1Name);
    if (p2Name) setPerson2Name(p2Name);

    const input: MbtiCompatibilityInput = {
      person1Mbti: p1Mbti as MbtiCompatibilityInput['person1Mbti'],
      person2Mbti: p2Mbti as MbtiCompatibilityInput['person2Mbti'],
      person1Name: p1Name || undefined,
      person2Name: p2Name || undefined,
    };

    getMbtiCompatibility(input)
      .then(compatibilityResult => {
        setResult(compatibilityResult);
      })
      .catch(err => {
        console.error("MBTI 궁합 분석 결과 오류:", err);
        setError(err instanceof Error ? err.message : "MBTI 궁합 분석 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
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
      const namePart1 = person1Name ? person1Name.substring(0,5) : person1Mbti;
      const namePart2 = person2Name ? person2Name.substring(0,5) : person2Mbti;
      link.download = `${namePart1}_${namePart2}_MBTI궁합.png`;
      link.click();
    } catch (error) {
      console.error("이미지 저장 중 오류 발생:", error);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingImage(false);
    }
  };

  const getGradeColorClass = (grade?: string) => {
    if (!grade) return 'bg-muted';
    if (grade === "천생연분") return 'bg-green-500';
    if (grade === "아주 잘 맞아요") return 'bg-blue-500';
    if (grade === "꽤 잘 맞아요") return 'bg-yellow-500';
    if (grade === "노력이 필요해요") return 'bg-orange-500';
    return 'bg-red-500';
  };


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">MBTI 궁합을 분석하고 있습니다...</p>
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
        <Button onClick={() => router.push('/relationship-compatibility/mbti')} variant="outline" className="mt-4">
          다른 MBTI로 궁합 보기
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
        <Button onClick={() => router.push('/relationship-compatibility/mbti')} variant="outline" className="mt-4">
          다른 MBTI로 궁합 보기
        </Button>
      </div>
    );
  }
  
  const { 
    compatibilityScore, compatibilityGrade, overallDescription, 
    strengths, weaknesses, improvementTips, recommendedActivities, luckyNumbers 
  } = result;

  const displayName1 = person1Name ? `${person1Name} (${person1Mbti})` : person1Mbti;
  const displayName2 = person2Name ? `${person2Name} (${person2Mbti})` : person2Mbti;

  return (
    <div className="space-y-6 py-6 flex flex-col flex-1">
      <div ref={resultAreaRef}>
        <Card className="shadow-lg border-primary/30 bg-primary/5 dark:bg-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl text-primary flex items-center gap-3">
              <Brain className="h-8 w-8" /> {displayName1}님과 {displayName2}님의 MBTI 궁합
            </CardTitle>
             <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-semibold text-secondary-foreground">궁합 점수: {compatibilityScore}점</span>
                    <span className={cn("px-3 py-1 text-sm font-semibold rounded-full text-white", getGradeColorClass(compatibilityGrade))}>
                        {compatibilityGrade}
                    </span>
                </div>
                <Progress value={compatibilityScore} className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-pink-400 [&>div]:via-purple-400 [&>div]:to-indigo-400" />
             </div>
            <CardDescription className="text-sm pt-2 text-muted-foreground break-words">
              MBTI 유형을 통해 서로의 성향을 이해하고, 더 나은 관계를 만들어가는 데 참고해보세요.
            </CardDescription>
          </CardHeader>
        </Card>

        <SectionCard title="종합 궁합 설명" icon={Sparkles} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{overallDescription}</p>
        </SectionCard>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
            <SectionCard title="관계의 강점" icon={ThumbsUp}>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{strengths}</p>
            </SectionCard>
            <SectionCard title="관계의 약점 및 주의사항" icon={ThumbsDown}>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{weaknesses}</p>
            </SectionCard>
        </div>

        <SectionCard title="관계 개선을 위한 조언" icon={Lightbulb} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{improvementTips}</p>
        </SectionCard>

        <SectionCard title="함께하면 좋은 활동 추천" icon={Activity} className="mt-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{recommendedActivities}</p>
        </SectionCard>
        
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <Gift className="h-5 w-5"/> 행운의 숫자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
                {luckyNumbers.map((num) => (
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
        <Button onClick={() => router.push('/relationship-compatibility/mbti')} variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          다른 MBTI로 궁합 보기
        </Button>
        <Link href="/relationship-compatibility" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Heart className="mr-2 h-4 w-4" />
            다른 궁합 보기
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

export default function MbtiCompatibilityResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <MbtiCompatibilityResultContent />
    </Suspense>
  );
}
