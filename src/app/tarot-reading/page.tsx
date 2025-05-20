
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateDeck, type TarotCard } from '@/lib/tarot-cards';
import Image from 'next/image';
import { LayoutGrid, Shuffle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  question: z.string().min(5, "명확한 질문을 5자 이상 입력해주세요."),
});

type TarotReadingFormValues = z.infer<typeof formSchema>;

const TarotCardDisplay = ({ card, onClick, isSelected, isDisabled }: { card: TarotCard; onClick: () => void; isSelected?: boolean; isDisabled?: boolean; }) => {
  const selectedStyle = isSelected ? {
    transform: 'translateY(-20px) scale(1.1)',
    zIndex: 100,
    boxShadow: '0 0 15px 5px hsl(var(--primary))',
  } : {};
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "rounded-lg overflow-hidden shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-accent relative",
        "w-16 md:w-24 h-auto aspect-[2/3] inline-block", // 카드 크기: 모바일 w-16, md부터 w-24
        (isDisabled && !isSelected) && "opacity-50 cursor-not-allowed",
      )}
      style={{ ...selectedStyle }}
      aria-label="타로 카드 뒷면"
    >
      <div className="w-full h-full relative">
        <Image src="/image/tarot-back.jpg" alt="타로 카드 뒷면" fill sizes="10vw" style={{ objectFit: 'cover' }} data-ai-hint="tarot card back" />
      </div>
    </button>
  );
};


export default function TarotReadingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setDeck(generateDeck());
  }, []);

  const form = useForm<TarotReadingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const shuffleDeck = () => {
    setIsShuffling(true);
    setDeck(prevDeck => 
      [...prevDeck]
        .map(card => ({ ...card, isFaceUp: false })) 
        .sort(() => Math.random() - 0.5)
    );
    setSelectedCards([]); 
    setTimeout(() => setIsShuffling(false), 500);
  };

  const handleCardSelect = (card: TarotCard) => {
    if (isLoading) return;

    if (selectedCards.some(sc => sc.id === card.id)) {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id)); 
    } else if (selectedCards.length < 3) {
      setSelectedCards(prev => [...prev, card]);
    }
  };

  async function onQuestionSubmit(values: TarotReadingFormValues) {
    setQuestionSubmitted(true);
    setError(null);
    if (selectedCards.length === 0) { 
      shuffleDeck();
    }
  }

  async function goToInterpretationPage() {
    if (selectedCards.length !== 3 || !form.getValues("question")) {
      setError("질문을 입력하고 카드 3장을 선택해주세요.");
      return;
    }
    const question = form.getValues("question");
    const cardParams = selectedCards.map((card, index) => `c${index + 1}=${encodeURIComponent(card.name)}`).join('&');
    router.push(`/tarot-reading/result?q=${encodeURIComponent(question)}&${cardParams}`);
  }
  
  const numRows = 3;
  const deckSlices: TarotCard[][] = [];
  if (deck.length > 0) {
    let startIndex = 0;
    for (let i = 0; i < numRows; i++) {
      const numCardsInRow = Math.ceil((deck.length - startIndex) / (numRows - i));
      deckSlices.push(deck.slice(startIndex, startIndex + numCardsInRow));
      startIndex += numCardsInRow;
    }
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <LayoutGrid className="text-primary h-6 w-6" /> 타로 운세
          </CardTitle>
          <CardDescription className="break-words">
            질문을 하고, 카드를 섞고, 세 장을 선택하여 당신의 지침을 받으세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onQuestionSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>당신의 질문</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예) 이번 달에 무엇에 집중해야 할까요?"
                        {...field}
                        disabled={questionSubmitted && selectedCards.length > 0 && !isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!questionSubmitted || selectedCards.length === 0 ? (
                <Button type="submit" disabled={isLoading || isShuffling} className="w-full md:w-auto bg-primary hover:bg-primary/90">
                  질문 제출 및 덱 준비
                </Button>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>

      {questionSubmitted && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl break-words">카드 선택</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription className="break-words">
                {selectedCards.length < 3 ? `${3 - selectedCards.length}장 더 선택해주세요.` : "모든 카드를 선택했습니다. 해석 준비 완료."}
              </CardDescription>
              <Button onClick={shuffleDeck} variant="outline" size="sm" disabled={isShuffling || isLoading || (selectedCards.length >= 3 && !isLoading) }>
                <Shuffle className={cn("mr-2 h-4 w-4", isShuffling && "animate-spin")} /> 덱 섞기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isShuffling ? (
              <div className="flex justify-center items-center py-10 min-h-[200px]">
                <LoadingSpinner size={32} />
                <p className="ml-2 text-muted-foreground break-words">카드를 섞고 있습니다...</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {deckSlices.map((rowCards, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent py-1">
                    <div className="flex items-end h-auto whitespace-nowrap px-4">
                      {rowCards.map((card, cardIndex) => (
                        <div
                          key={card.id}
                          className={cn(
                            "transition-transform duration-200",
                            // 모바일: ml-[-36px], sm: ml-[-40px], md: ml-[-48px], lg: ml-[-56px]
                            // 기본 카드 폭: w-16 (64px), md부터: w-24 (96px)
                            // 모바일에서 겹침 조정 (36px 겹침 -> 28px 노출)
                            // sm에서는 40px 겹침 -> 24px 노출
                            // md에서는 48px 겹침 -> 48px 노출 (절반)
                            // lg에서는 56px 겹침 -> 40px 노출
                            cardIndex > 0 ? 'ml-[-36px] sm:ml-[-40px] md:ml-[-48px] lg:ml-[-56px]' : 'ml-0', 
                            !selectedCards.some(sc => sc.id === card.id) && !((selectedCards.length >= 3 && !selectedCards.some(sc => sc.id === card.id)) || isLoading) && "hover:translate-y-[-10px]"
                          )}
                        >
                          <TarotCardDisplay
                            card={card}
                            onClick={() => handleCardSelect(card)}
                            isSelected={selectedCards.some(sc => sc.id === card.id)}
                            isDisabled={(selectedCards.length >= 3 && !selectedCards.some(sc => sc.id === card.id)) || isLoading}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedCards.length === 3 && !isShuffling && (
              <Button onClick={goToInterpretationPage} disabled={isLoading} className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "내 리딩 받기"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      
      {isLoading && !isShuffling && questionSubmitted && selectedCards.length !==3 && ( 
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground break-words">카드를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>오류</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
      )}

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

