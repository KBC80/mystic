
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { tarotCardReading, type TarotCardReadingOutput, type TarotCardReadingInput } from '@/ai/flows/tarot-card-reading';
import { generateDeck, type TarotCard as TarotCardType } from '@/lib/tarot-cards'; 
import Image from 'next/image';
import { WandSparkles, CheckCircle2, Gift, Home, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const TarotCardDisplay = ({ card }: { card: TarotCardType }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-40 h-auto aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg mb-2">
        <Image src={card.imageUrl} alt={card.name} fill sizes="20vw" style={{ objectFit: 'cover' }} data-ai-hint={card.dataAiHint} />
      </div>
      <p className="font-semibold text-center text-sm break-words">{card.name}</p>
    </div>
  );
};

function TarotResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TarotCardReadingOutput | null>(null);
  const [selectedCardDetails, setSelectedCardDetails] = useState<TarotCardType[]>([]);
  const [question, setQuestion] = useState<string>("");

  useEffect(() => {
    const q = searchParams.get('q');
    const c1Name = searchParams.get('c1');
    const c2Name = searchParams.get('c2');
    const c3Name = searchParams.get('c3');

    if (!q || !c1Name || !c2Name || !c3Name) {
      setError("필수 정보(질문 또는 카드)가 누락되었습니다.");
      setIsLoading(false);
      return;
    }
    
    setQuestion(q);

    const deck = generateDeck();
    const foundCards: TarotCardType[] = [];
    [c1Name, c2Name, c3Name].forEach(name => {
      const card = deck.find(d => d.name === name);
      if (card) {
        foundCards.push({ ...card, isFaceUp: true });
      }
    });

    if (foundCards.length !== 3) {
      setError("선택한 카드를 찾는 데 문제가 발생했습니다.");
      setIsLoading(false);
      return;
    }
    setSelectedCardDetails(foundCards);

    const input: TarotCardReadingInput = {
      question: q,
      card1: c1Name,
      card2: c2Name,
      card3: c3Name,
    };

    tarotCardReading(input)
      .then(interpretationResult => {
        setResult(interpretationResult);
      })
      .catch(err => {
        console.error("타로 리딩 결과 오류:", err);
        setError(err instanceof Error ? err.message : "타로 리딩 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">당신의 운명을 해석하고 있습니다...</p>
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
        <Button onClick={() => router.push('/tarot-reading')} variant="outline" className="mt-4">
          새 리딩 시작
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground break-words">결과를 표시할 수 없습니다.</p>
        <Button onClick={() => router.push('/tarot-reading')} variant="outline" className="mt-4">
          새 리딩 시작
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <WandSparkles className="h-8 w-8 text-primary" /> 당신의 타로 운세 결과
          </CardTitle>
          <CardDescription className="text-md pt-1 break-words">질문: "{question}"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center mb-8 pt-4">
            {selectedCardDetails.map((card) => (
              <TarotCardDisplay key={card.id} card={card} />
            ))}
          </div>

          <div className="space-y-6">
            {selectedCardDetails.map((card, index) => (
              <div key={card.id}>
                <h3 className="text-xl font-semibold text-secondary-foreground mb-1 break-words">카드 {index + 1}: {card.name}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">
                  {index === 0 ? result.card1Interpretation : index === 1 ? result.card2Interpretation : result.card3Interpretation}
                </p>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t">
            <h3 className="text-2xl font-semibold flex items-center gap-2 mb-2"><CheckCircle2 className="h-6 w-6 text-green-500"/> 전반적인 조언</h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.overallAdvice}</p>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-2xl font-semibold flex items-center gap-2 mb-2"><Gift className="h-6 w-6 text-yellow-500"/> 행운의 숫자</h3>
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
          <Button onClick={() => router.push('/tarot-reading')} variant="default" size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <RotateCcw className="mr-2 h-5 w-5"/> 새 리딩 시작
          </Button>
           {/* ShareButton removed */}
        </CardFooter>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
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


export default function TarotResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground break-words">로딩 중...</p>
      </div>
    }>
      <TarotResultContent />
    </Suspense>
  );
}

