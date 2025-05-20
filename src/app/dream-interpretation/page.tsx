
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CloudMoon, Home } from 'lucide-react';

const formSchema = z.object({
  dreamContent: z.string().min(10, "꿈 내용을 최소 10자 이상 입력해주세요."),
});

type DreamInterpretationFormValues = z.infer<typeof formSchema>;

export default function DreamInterpretationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const form = useForm<DreamInterpretationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dreamContent: "",
    },
  });

  async function onSubmit(values: DreamInterpretationFormValues) {
    setIsSubmitting(true);
    const queryParams = new URLSearchParams({
      dreamContent: values.dreamContent,
    }).toString();
    
    router.push(`/dream-interpretation/result?${queryParams}`);
  }
  
  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CloudMoon className="text-primary h-6 w-6" /> 꿈 해몽
          </CardTitle>
          <CardDescription className="break-words">
            당신의 꿈을 설명해주시면 숨겨진 의미와 상징을 찾는 데 도움을 드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dreamContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>당신의 꿈</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="예) 광활한 바다 위를 나는 꿈을 꾸었어요..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="break-words">
                      자세한 내용을 제공할수록 더 나은 해석을 받을 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "내 꿈 해몽하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 결과 표시 로직 제거 */}

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

