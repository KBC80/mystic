"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MoonStarIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { dreamInterpretation, type DreamInterpretationInput, type DreamInterpretationOutput } from "@/ai/flows/dream-interpretation";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  dreamText: z.string().min(10, "꿈 내용을 최소 10자 이상 입력해주세요.").max(2000, "꿈 내용은 최대 2000자까지 입력할 수 있습니다."),
});

type FormValues = z.infer<typeof formSchema>;

async function handleInterpretDream(data: FormValues): Promise<DreamInterpretationOutput | { error: string }> {
  "use server";
  try {
    const result = await dreamInterpretation(data);
    return result;
  } catch (error) {
    console.error("Dream interpretation error:", error);
    return { error: "꿈 해몽에 실패했습니다. 다시 시도해주세요." };
  }
}

export default function DreamInterpretationPage() {
  const [interpretationResult, setInterpretationResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dreamText: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setInterpretationResult(null);
    
    const result = await handleInterpretDream(data);

    if ('error' in result) {
      toast({
        variant: "destructive",
        title: "오류",
        description: result.error,
      });
    } else {
      setInterpretationResult(result.interpretation);
    }
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <MoonStarIcon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">꿈 해몽</CardTitle>
              <CardDescription>꿈 속에 숨겨진 메시지와 상징을 해석해 드립니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dreamText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>꿈 내용</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="지난 밤 꾸었던 꿈 이야기를 자세히 적어주세요..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <LoadingSpinner size="sm" className="mr-2"/> : null}
                꿈 해몽하기
              </Button>
            </form>
          </Form>
        </CardContent>
        {isLoading && <LoadingSpinner />}
        {interpretationResult && !isLoading && (
          <CardFooter>
            <Card className="w-full bg-muted/50 p-4">
              <CardTitle className="text-lg mb-2">꿈 해몽 결과</CardTitle>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{interpretationResult}</p>
            </Card>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
