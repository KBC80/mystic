
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateAuspiciousName, type GenerateAuspiciousNameInput, type GenerateAuspiciousNameOutput } from '@/ai/flows/name-generation-flow';
import { Baby, Sparkles, Home } from 'lucide-react';

function NameGenerationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateAuspiciousNameOutput | null>(null);
  const [childLastName, setChildLastName] = useState<string>("");
  const [childGender, setChildGender] = useState<string>("");


  useEffect(() => {
    const fatherName = searchParams.get('fatherName');
    const fatherBirthDate = searchParams.get('fatherBirthDate');
    const fatherCalendarType = searchParams.get('fatherCalendarType') as GenerateAuspiciousNameInput['fatherCalendarType'];
    const fatherBirthTime = searchParams.get('fatherBirthTime');
    const motherName = searchParams.get('motherName');
    const motherBirthDate = searchParams.get('motherBirthDate');
    const motherCalendarType = searchParams.get('motherCalendarType') as GenerateAuspiciousNameInput['motherCalendarType'];
    const motherBirthTime = searchParams.get('motherBirthTime');
    const cLastName = searchParams.get('childLastName');
    const cGender = searchParams.get('childGender') as GenerateAuspiciousNameInput['childGender'];

    if (!fatherName || !fatherBirthDate || !fatherCalendarType || !fatherBirthTime ||
        !motherName || !motherBirthDate || !motherCalendarType || !motherBirthTime ||
        !cLastName || !cGender) {
      setError("필수 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setChildLastName(cLastName);
    setChildGender(cGender === 'male' ? '아들' : '딸');


    const input: GenerateAuspiciousNameInput = {
      fatherName, fatherBirthDate, fatherCalendarType, fatherBirthTime,
      motherName, motherBirthDate, motherCalendarType, motherBirthTime,
      childLastName: cLastName, childGender: cGender,
    };

    generateAuspiciousName(input)
      .then(generationResult => {
        setResult(generationResult);
      })
      .catch(err => {
        console.error("이름 생성 결과 오류:", err);
        setError(err instanceof Error ? err.message : "이름 생성 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">완벽한 이름을 만들고 있습니다...</p>
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
        <Button onClick={() => router.push('/name-generation')} variant="outline" className="mt-4">
          새 작명 시도
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/name-generation')} variant="outline" className="mt-4">
          새 작명 시도
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" /> {childLastName}씨 {childGender}를 위한 추천 이름
          </CardTitle>
          <CardDescription className="text-md pt-1 break-words">
            부모님의 사주와 자녀의 성별을 고려하여 AI가 추천하는 길운의 이름들입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.recommendedNames.map((name, index) => (
            <Card key={index} className="p-6 bg-secondary/30 shadow-md">
              <h3 className="text-2xl font-bold text-primary mb-2">{name.name} {name.hanja && <span className="text-xl text-muted-foreground">({name.hanja})</span>}</h3>
              <div className="space-y-2 text-base">
                <p className="text-muted-foreground whitespace-pre-wrap"><strong className="text-secondary-foreground">이름 의미 및 풀이:</strong> {name.meaning}</p>
                <p className="text-muted-foreground whitespace-pre-wrap"><strong className="text-secondary-foreground">음양오행 및 사주 조화:</strong> {name.yinYangFiveElements}</p>
              </div>
            </Card>
          ))}
        </CardContent>
         <CardFooter className="pt-8 border-t flex-col sm:flex-row items-center gap-4">
           {/* ShareButton removed */}
        </CardFooter>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/name-generation" passHref>
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                <Baby className="mr-2 h-4 w-4" />
                다른 조건으로 작명하기
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


export default function NameGenerationResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">결과 페이지 로딩 중...</p>
      </div>
    }>
      <NameGenerationResultContent />
    </Suspense>
  );
}

