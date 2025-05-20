
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRelationshipCompatibility, type RelationshipCompatibilityInput, type RelationshipCompatibilityOutput } from '@/ai/flows/relationship-compatibility-flow';
import { Home, Sparkles, User, Heart, Palette, BookOpen, Users2, CheckCircle, AlertTriangle, Gift, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import type { ChartConfig } from '@/components/ui/chart';

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

const ohaengChartConfig = {
  wood: { label: "목(木)", color: "hsl(var(--chart-1))" },
  fire: { label: "화(火)", color: "hsl(var(--chart-2))" },
  earth: { label: "토(土)", color: "hsl(var(--chart-3))" },
  metal: { label: "금(金)", color: "hsl(var(--chart-4))" },
  water: { label: "수(水)", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const OhaengPieChart = ({ dataString, personLabel }: { dataString: string; personLabel: string }) => {
  // Example dataString: "목2, 화1, 토1, 금1, 수0"
  const ohaengData = dataString.split(',').map(item => {
    const parts = item.trim().match(/([가-힣]+)(\d+)/);
    if (!parts) return null;
    const nameKorean = parts[1];
    const value = parseInt(parts[2], 10);
    const nameKey = Object.keys(ohaengChartConfig).find(key => 
        ohaengChartConfig[key as keyof typeof ohaengChartConfig].label.startsWith(nameKorean)
    ) as keyof typeof ohaengChartConfig | undefined;

    if (!nameKey || value === 0) return null;
    return { nameKey, name: ohaengChartConfig[nameKey].label, value, fill: ohaengChartConfig[nameKey].color };
  }).filter(item => item !== null && item.value > 0);

  if (!ohaengData || ohaengData.length === 0) {
    return <p className="text-sm text-muted-foreground break-words">{personLabel}: 오행 데이터 분석 중 또는 데이터 없음.</p>;
  }

  return (
    <div>
      <h4 className="text-md font-semibold mb-1 text-secondary-foreground break-words">{personLabel} 오행 분포</h4>
      <ChartContainer config={ohaengChartConfig} className="mx-auto aspect-square h-[150px]">
        <RechartsPieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={ohaengData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} label={({ name, percent }) => `${name.substring(0,1)}: ${(percent * 100).toFixed(0)}%`}>
            {ohaengData.map((entry) => (
              <Cell key={`cell-${entry.nameKey}`} fill={entry.fill} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
};


function RelationshipCompatibilityResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RelationshipCompatibilityOutput | null>(null);
  const [person1Name, setPerson1Name] = useState("");
  const [person2Name, setPerson2Name] = useState("");

  useEffect(() => {
    const p1Name = searchParams.get('p1_name');
    const p1BirthDate = searchParams.get('p1_birthDate');
    const p1CalendarType = searchParams.get('p1_calendarType') as RelationshipCompatibilityInput['person1']['calendarType'];
    const p1BirthTime = searchParams.get('p1_birthTime');
    const p1Gender = searchParams.get('p1_gender') as RelationshipCompatibilityInput['person1']['gender'];

    const p2Name = searchParams.get('p2_name');
    const p2BirthDate = searchParams.get('p2_birthDate');
    const p2CalendarType = searchParams.get('p2_calendarType') as RelationshipCompatibilityInput['person2']['calendarType'];
    const p2BirthTime = searchParams.get('p2_birthTime');
    const p2Gender = searchParams.get('p2_gender') as RelationshipCompatibilityInput['person2']['gender'];
    
    if (!p1Name || !p1BirthDate || !p1CalendarType || !p1BirthTime || !p1Gender ||
        !p2Name || !p2BirthDate || !p2CalendarType || !p2BirthTime || !p2Gender) {
      setError("필수 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setPerson1Name(p1Name);
    setPerson2Name(p2Name);

    const input: RelationshipCompatibilityInput = {
      person1: { name: p1Name, birthDate: p1BirthDate, calendarType: p1CalendarType, birthTime: p1BirthTime, gender: p1Gender },
      person2: { name: p2Name, birthDate: p2BirthDate, calendarType: p2CalendarType, birthTime: p2BirthTime, gender: p2Gender },
    };

    getRelationshipCompatibility(input)
      .then(compatibilityResult => {
        setResult(compatibilityResult);
      })
      .catch(err => {
        console.error("궁합 분석 결과 오류:", err);
        setError(err instanceof Error ? err.message : "궁합 분석 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">두 분의 인연을 분석하고 있습니다...</p>
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
        <Button onClick={() => router.push('/relationship-compatibility')} variant="outline" className="mt-4">
          새 궁합 보기
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/relationship-compatibility')} variant="outline" className="mt-4">
          새 궁합 보기
        </Button>
      </div>
    );
  }
  
  const { 
 overallScore, overallGrade, sajuCompatibility, ohaengAnalysis, 
    sibsinYukchinAnalysis, nameHanjaHarmony, overallInterpretation, 
 strengths, weaknesses, improvementAdvice, luckyNumbers 
  } = result;

  const getGradeColor = (grade: string) => {
    if (['최상', '상'].includes(grade)) return 'text-green-600 dark:text-green-400';
    if (['중상', '중'].includes(grade)) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6 py-6 flex flex-col flex-1">
      <Card className="shadow-lg border-primary/30 bg-primary/5 dark:bg-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Heart className="h-8 w-8" /> {person1Name}님과 {person2Name}님의 천생연분 궁합
          </CardTitle>
          <CardDescription className="text-md pt-2 text-primary break-words">
            <strong>궁합 총점: {overallScore}점</strong> / <strong className={`font-semibold px-1 py-0.5 rounded-md text-lg ${getGradeColor(overallGrade)}`}>{overallGrade}</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      <SectionCard title="사주팔자 조화도 분석" icon={User}>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{sajuCompatibility.analysisText}</p>
      </SectionCard>
      
      <SectionCard title="오행 상생·상극 분석" icon={Palette}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <OhaengPieChart dataString={ohaengAnalysis.person1Ohaeng} personLabel={`${person1Name}님`} />
          <OhaengPieChart dataString={ohaengAnalysis.person2Ohaeng} personLabel={`${person2Name}님`} />
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{ohaengAnalysis.compatibilityDescription}</p>
      </SectionCard>

      <SectionCard title="십신 및 육친 관계 분석" icon={Users2}>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{sibsinYukchinAnalysis.description}</p>
      </SectionCard>

      <SectionCard title="이름 한자 조화도 분석" icon={BookOpen}>
        <div className="space-y-2">
            <div>
                <h4 className="font-semibold text-md text-secondary-foreground break-words">{person1Name}님 이름 분석:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{nameHanjaHarmony.person1NameAnalysis}</p>
            </div>
            <div>
                <h4 className="font-semibold text-md text-secondary-foreground break-words">{person2Name}님 이름 분석:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{nameHanjaHarmony.person2NameAnalysis}</p>
            </div>
            <div>
                <h4 className="font-semibold text-md text-secondary-foreground break-words">이름 간 조화:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{nameHanjaHarmony.compatibilityDescription}</p>
            </div>
        </div>
      </SectionCard>
      
      <SectionCard title="종합 해석 및 조언" icon={Sparkles} className="bg-card border-primary/50">
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-md text-secondary-foreground break-words">종합 해석:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{overallInterpretation}</p>
            </div>
            <div>
                <h4 className="font-semibold text-md text-secondary-foreground break-words">관계의 강점:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{strengths}</p>
            </div>
            <div>
                <h4 className="font-semibold text-md text-secondary-foreground break-words">관계의 약점 및 주의사항:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{weaknesses}</p>
            </div>
            <div>
                <h4 className="font-semibold text-md text-secondary-foreground break-words">관계 개선을 위한 조언:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{improvementAdvice}</p>
            </div>
        </div>
      </SectionCard>
      
      <SectionCard title="행운의 숫자" icon={Gift}>
        <div className="flex space-x-3">
            {luckyNumbers.map((num) => (
                <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold text-lg shadow-md">
                {num}
                </span>
            ))}
        </div>
      </SectionCard>


      <CardFooter className="pt-8 border-t flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={() => router.push('/relationship-compatibility')} variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" />
          다른 궁합 보기
        </Button>
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

export default function RelationshipCompatibilityResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <RelationshipCompatibilityResultContent />
    </Suspense>
  );
}


