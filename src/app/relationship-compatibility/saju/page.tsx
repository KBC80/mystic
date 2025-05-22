
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Home, Heart } from 'lucide-react';

export default function SajuCompatibilityPage() {
  // TODO: Implement the form for Saju compatibility input

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="text-primary h-6 w-6" /> 전통 사주 궁합
          </CardTitle>
          <CardDescription>
            두 분의 사주 정보를 입력하여 전통적인 방식으로 궁합을 알아보세요. (페이지 준비 중)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">
              전통 사주 궁합 서비스는 현재 준비 중입니다. 곧 만나보실 수 있습니다!
            </p>
            {/* 여기에 사주 정보 입력 폼이 들어갈 예정입니다. */}
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/relationship-compatibility" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Heart className="mr-2 h-4 w-4" />
            다른 궁합 보기
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
