"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TicketIcon, Wand2Icon } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { generateLotteryNumbers, type GenerateLotteryNumbersInput, type GenerateLotteryNumbersOutput } from "@/ai/flows/lottery-number-generator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  method: z.enum(['numerology', 'aiDriven', 'random'], { required_error: "추천 방식을 선택해주세요." }),
  numberOfNumbers: z.coerce.number().min(1, "최소 1개").max(10, "최대 10개"),
  maxNumber: z.coerce.number().min(10, "최소값 10").max(99, "최대값 99"),
});

type FormValues = z.infer<typeof formSchema>;

async function handleGenerateNumbers(data: FormValues): Promise<GenerateLotteryNumbersOutput | { error: string }> {
  "use server";
  try {
    const result = await generateLotteryNumbers(data);
    return result;
  } catch (error) {
    console.error("Lottery number generation error:", error);
    return { error: "로또 번호 생성에 실패했습니다. 다시 시도해주세요." };
  }
}

export default function LotteryNumberGeneratorPage() {
  const [lotteryNumbers, setLotteryNumbers] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "aiDriven",
      numberOfNumbers: 6,
      maxNumber: 45,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setLotteryNumbers(null);
    
    const result = await handleGenerateNumbers(data);

    if ('error' in result) {
      toast({
        variant: "destructive",
        title: "오류",
        description: result.error,
      });
    } else {
      setLotteryNumbers(result.numbers);
    }
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <TicketIcon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">로또 정보</CardTitle>
              <CardDescription>다양한 방식으로 행운의 로또 번호를 추천받으세요.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>추천 방식</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="추천 방식 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="numerology">수비학 기반</SelectItem>
                        <SelectItem value="aiDriven">AI 예측</SelectItem>
                        <SelectItem value="random">무작위</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>번호 개수 (1-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최대 번호 (10-99)</FormLabel>
                    <FormControl>
                      <Input type="number" min="10" max="99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <LoadingSpinner size="sm" className="mr-2"/> : <Wand2Icon className="mr-2 h-4 w-4" />}
                행운 번호 받기
              </Button>
            </form>
          </Form>
        </CardContent>
        {isLoading && <LoadingSpinner />}
        {lotteryNumbers && !isLoading && (
          <CardFooter>
            <Card className="w-full bg-muted/50 p-4">
              <CardTitle className="text-lg mb-2">추천 로또 번호</CardTitle>
              <div className="flex flex-wrap gap-3">
                {lotteryNumbers.map((num, index) => (
                  <span key={index} className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-md">
                    {num}
                  </span>
                ))}
              </div>
            </Card>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
