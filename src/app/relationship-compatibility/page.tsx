
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Heart, Users, Brain } from 'lucide-react'; // Brain 아이콘 추가

export default function RelationshipCompatibilityLandingPage() {
  const compatibilityTypes = [
    {
      title: "전통 사주 궁합",
      href: "/relationship-compatibility/saju", // 링크는 이미 /saju 로 되어 있습니다.
      icon: Users, 
      description: "두 분의 사주 명리학적 정보를 바탕으로 깊이 있는 관계 조화도를 분석해 드립니다."
    },
    {
      title: "MBTI 연애 궁합", // 명칭 변경
      href: "/relationship-compatibility/mbti",
      icon: Brain, 
      description: "두 분의 MBTI 성격 유형을 기반으로 서로의 관계 역동성과 조언을 확인해보세요."
    }
  ];

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Heart className="text-primary h-6 w-6" /> 천생연분 궁합
          </CardTitle>
          <CardDescription className="break-words">
            다양한 방식으로 두 분의 관계를 탐구하고 서로를 더 깊이 이해해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {compatibilityTypes.map((type) => (
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
