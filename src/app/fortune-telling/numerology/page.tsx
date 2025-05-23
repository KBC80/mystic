
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Brain, Sigma, Sparkles, Star } from 'lucide-react';

export default function NumerologyLandingPage() {
  const numerologyTypes = [
    {
      title: "인생여정수 풀이",
      href: "/fortune-telling/numerology/life-path",
      icon: Brain, 
      description: "당신의 생년월일에 숨겨진 인생여정수를 통해 성격, 재능, 삶의 과제 등을 알아보세요."
    },
    {
      title: "운명수 풀이",
      href: "/fortune-telling/numerology/destiny-number",
      icon: Star, 
      description: "당신의 이름에 담긴 운명수를 통해 타고난 성향, 잠재력, 삶의 방향을 알아보세요."
    },
    // Future numerology services can be added here
  ];

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sigma className="text-primary h-6 w-6" /> 수비학 운세
          </CardTitle>
          <CardDescription className="break-words">
            숫자의 신비로운 힘을 통해 당신의 삶에 대한 통찰을 얻어보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {numerologyTypes.map((type) => (
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
