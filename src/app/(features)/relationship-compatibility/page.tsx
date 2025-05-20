"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UsersIcon, HeartIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

const formSchema = z.object({
  person1Name: z.string().min(1, "첫 번째 사람의 이름을 입력해주세요."),
  person2Name: z.string().min(1, "두 번째 사람의 이름을 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export default function RelationshipCompatibilityPage() {
  const [compatibilityResult, setCompatibilityResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person1Name: "",
      person2Name: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setCompatibilityResult(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCompatibilityResult(`"${data.person1Name}"님과 "${data.person2Name}"님의 궁합 결과입니다. 이 기능은 현재 준비 중입니다. 전통적인 방식을 통해 두 분의 인연과 조화를 심층적으로 분석하여 곧 제공해 드릴 예정입니다.`);
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">천생연분 궁합</CardTitle>
              <CardDescription>두 사람의 인연과 조화를 전통적인 방식으로 분석합니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="person1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>첫 번째 사람 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 성춘향" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="person2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>두 번째 사람 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 이몽룡" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <LoadingSpinner size="sm" className="mr-2"/> : <HeartIcon className="mr-2 h-4 w-4" />}
                궁합 보기
              </Button>
            </form>
          </Form>
        </CardContent>
        {isLoading && <LoadingSpinner />}
        {compatibilityResult && !isLoading && (
          <CardFooter>
            <Card className="w-full bg-muted/50 p-4">
              <CardTitle className="text-lg mb-2">궁합 결과</CardTitle>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{compatibilityResult}</p>
            </Card>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
