
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image"; // Image 컴포넌트 임포트
import { PenTool, Baby, CloudMoon, LayoutGrid, Home, Ticket, Sparkles, Heart } from "lucide-react";

export default function HomePage() {
  const features = [
    { title: "이름 풀이", href: "/name-interpretation", icon: PenTool, description: "당신의 이름에 담긴 운명의 실타래를 섬세하게 풀어내어, 삶의 잠재력과 나아갈 길을 밝혀드립니다." },
    { title: "천생연분 궁합", href: "/relationship-compatibility", icon: Heart, description: "두 분의 인연이 과연 천생연분일지, 전통 사주와 MBTI를 통해 관계의 깊이와 미래를 탐색해 보세요." },
    { title: "작명 도우미", href: "/name-generation", icon: Baby, description: "새 생명의 첫 선물, 아이의 빛나는 미래를 기원하며 사주에 맞는 특별하고 의미 있는 이름을 찾아드립니다." },
    { title: "재미로 보는 운세", href: "/fortune-telling", icon: Sparkles, description: "오늘의 운세부터 별자리, 타로, 룬 문자까지! 다양한 운세를 통해 일상에 즐거움과 통찰을 더하세요." },
    { title: "꿈 해몽", href: "/dream-interpretation", icon: CloudMoon, description: "밤새 꾼 신비로운 꿈, 그 속에 숨겨진 메시지를 해석하여 당신의 무의식이 전하는 지혜를 발견하세요." },
    { title: "로또 정보", href: "/lotto-recommendation", icon: Ticket, description: "사주 분석부터 과학적 통계까지, AI가 추천하는 행운의 번호로 대박의 꿈에 한 걸음 다가가 보세요." },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center mb-4">
          <Image src="/image/main.png" alt="Mystic Muse 로고" width={80} height={80} className="object-contain"/>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
          Mystic Muse에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-muted-foreground break-words">
          보이는 것과 보이지 않는 것을 이해하기 위한 당신의 안내자. 운세, 이름, 꿈, 그리고 행운의 번호까지 탐험하세요.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} className="block h-full group">
            <Card className="h-full flex flex-col shadow-lg group-hover:shadow-2xl group-hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-secondary rounded-md">
                  <feature.icon className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl text-primary group-hover:text-primary/90">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-2">
                <CardDescription className="break-words">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section className="text-center py-10 bg-card rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-primary mb-4">여정을 시작할 준비가 되셨나요?</h2>
        <p className="text-md text-muted-foreground mb-6 max-w-2xl mx-auto break-words">
          Mystic Muse는 자기 발견과 예지력을 위한 안식처를 제공합니다. 각 도구는 명확성과 영감을 제공하도록 설계되었습니다. 지금 바로 탐색을 시작하고 내면의 지혜를 발견하세요.
        </p>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
          <Link href="/name-interpretation">이름 풀이로 시작하기</Link>
        </Button>
      </section>
    </div>
  );
}
