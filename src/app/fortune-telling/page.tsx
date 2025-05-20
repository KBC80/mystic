
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, CalendarHeart, TrendingUp, Star, Sparkles, LayoutGrid, WandSparkles as WandIcon } from 'lucide-react'; // Used WandSparkles as WandIcon

export default function FortuneTellingLandingPage() {
  const fortuneTypes = [
    {
      title: "오늘의 운세",
      href: "/fortune-telling/today",
      icon: CalendarHeart,
      description: "생년월일시와 이름을 기반으로 오늘의 종합적인 운세를 확인하세요."
    },
    {
      title: "올해 운세",
      href: "/fortune-telling/year",
      icon: TrendingUp,
      description: "입력 정보를 바탕으로 올 한 해의 전체적인 운의 흐름을 예측해 드립니다."
    },
    {
      title: "별자리 운세",
      href: "/fortune-telling/horoscope",
      icon: Star,
      description: "당신의 별자리를 확인하고, 이번 주 별자리 운세를 알아보세요."
    },
    {
      title: "타로 운세",
      href: "/tarot-reading", 
      icon: LayoutGrid, 
      description: "타로 카드를 통해 당신의 질문에 대한 통찰과 지침을 얻으세요."
    },
    {
      title: "룬 문자 점",
      href: "/fortune-telling/rune-reading",
      icon: WandIcon, // Using WandSparkles as WandIcon
      description: "고대 룬 문자의 지혜를 통해 현재 상황에 대한 통찰과 조언을 얻으세요."
    }
  ];

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="text-primary h-6 w-6" /> 재미로 보는 운세
          </CardTitle>
          <CardDescription className="break-words">
            다양한 운세 서비스를 통해 당신의 오늘, 올해, 별자리, 타로, 룬 문자의 기운을 확인해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fortuneTypes.map((type) => (
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
      </div>
    </div>
  );
}

