"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TextSearchIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NameAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setAnalysisResult(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAnalysisResult(`"${data.name}" 이름에 대한 분석 결과입니다. 이 기능은 현재 준비 중입니다. 고대의 지혜와 수비학적 원리를 바탕으로 이름의 깊은 의미와 상징을 곧 제공해 드릴 예정입니다.`);
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <TextSearchIcon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">이름 풀이</CardTitle>
              <CardDescription>고대의 지혜를 바탕으로 이름의 의미를 분석합니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 홍길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <LoadingSpinner size="sm" className="mr-2"/> : null}
                분석하기
              </Button>
            </form>
          </Form>
        </CardContent>
        {isLoading && <LoadingSpinner />}
        {analysisResult && !isLoading && (
          <CardFooter>
            <Card className="w-full bg-muted/50 p-4">
              <CardTitle className="text-lg mb-2">분석 결과</CardTitle>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{analysisResult}</p>
            </Card>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
