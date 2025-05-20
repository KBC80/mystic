import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HomeIcon, TextSearchIcon, UsersIcon, BabyIcon, SparklesIcon, MoonStarIcon, TicketIcon, ArrowRightIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  icon: LucideIcon;
  cta: string;
}

const features: FeatureCardProps[] = [
  {
    title: "이름 풀이",
    description: "고대의 지혜를 바탕으로 이름의 의미를 분석합니다.",
    link: "/name-analysis",
    icon: TextSearchIcon,
    cta: "이름 분석하기"
  },
  {
    title: "천생연분 궁합",
    description: "두 사람의 인연과 조화를 전통적인 방식으로 분석합니다.",
    link: "/relationship-compatibility",
    icon: UsersIcon,
    cta: "궁합 보기"
  },
  {
    title: "작명 도우미",
    description: "길운의 원리에 맞춰 아이에게 완벽한 이름을 추천합니다.",
    link: "/baby-name-generator",
    icon: BabyIcon,
    cta: "이름 추천받기"
  },
  {
    title: "재미로 보는 운세",
    description: "생년월일 등의 정보를 입력하면 다양한 운세 결과를 제공합니다.",
    link: "/personalized-horoscopes",
    icon: SparklesIcon,
    cta: "운세 보기"
  },
  {
    title: "꿈 해몽",
    description: "꿈 속에 숨겨진 메시지와 상징을 해석합니다.",
    link: "/dream-interpretation",
    icon: MoonStarIcon,
    cta: "꿈 해몽하기"
  },
  {
    title: "로또 정보",
    description: "다양한 방식으로 행운의 로또 번호를 추천합니다.",
    link: "/lottery-number-generator",
    icon: TicketIcon,
    cta: "로또 번호 받기"
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background to-sidebar-background">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary mb-4">Mystic Guide에 오신 것을 환영합니다</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          보이는 것과 보이지 않는 것을 이해하기 위한 당신의 안내자. 운세, 이름, 꿈, 그리고 행운의 번호까지 탐험하세요.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <feature.icon className="w-10 h-10 text-accent" />
              <div className="grid gap-1">
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={feature.link}>
                  {feature.cta} <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <footer className="mt-12 text-center text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Mystic Guide. All rights reserved.</p>
      </footer>
    </div>
  );
}
