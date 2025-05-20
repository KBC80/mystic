
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Ticket, TestTubeDiagonal, Archive, ExternalLink } from 'lucide-react';

export default function LottoRecommendationLandingPage() {
  const recommendationTypes = [
    {
      title: "사주 로또 추천",
      href: "/lotto-recommendation/saju",
      icon: Ticket,
      description: "사주 명리학을 기반으로 개인에게 맞는 특별한 행운 번호를 추천받아보세요."
    },
    {
      title: "과학적 로또 추천",
      href: "/lotto-recommendation/scientific",
      icon: TestTubeDiagonal,
      description: "과거 당첨 데이터와 통계적 분석을 통해 확률 높은 로또 번호 조합을 예측해 드립니다."
    },
    {
      title: "역대 당첨번호 조회",
      href: "/lotto-recommendation/history",
      icon: Archive,
      description: "과거 로또 당첨 번호를 회차별로 조회하고, 1등 당첨 정보를 확인해보세요."
    }
  ];

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Ticket className="text-primary h-6 w-6" /> 로또 번호 추천 및 정보
          </CardTitle>
          <CardDescription className="break-words">
            어떤 방식으로 로또 번호를 추천받거나 정보를 조회하고 싶으신가요? 아래에서 선택해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendationTypes.map((type) => (
            <Link href={type.href} key={type.href} className="block group">
              <Card className="h-full flex flex-col shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-2 bg-secondary rounded-md">
                    <type.icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-xl text-primary group-hover:text-primary/90">{type.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-2">
                  <CardDescription className="break-words">{type.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
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

