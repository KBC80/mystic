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
import { BabyIcon, GiftIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { generateBabyNames, type GenerateBabyNamesInput, type GenerateBabyNamesOutput } from "@/ai/flows/baby-name-generator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  gender: z.enum(['male', 'female', 'any'], { required_error: "성별을 선택해주세요." }),
  length: z.enum(['short', 'medium', 'long', 'any'], { required_error: "이름 길이를 선택해주세요." }),
  culturalOrigin: z.string().min(1, "문화적 배경을 입력해주세요. (예: 한국, 일본, 영어권)"),
  quantity: z.coerce.number().min(1, "최소 1개").max(10, "최대 10개"),
});

type FormValues = z.infer<typeof formSchema>;

async function handleGenerateNames(data: FormValues): Promise<GenerateBabyNamesOutput | { error: string }> {
  "use server";
  try {
    const result = await generateBabyNames(data);
    return result;
  } catch (error) {
    console.error("Baby name generation error:", error);
    return { error: "이름 생성에 실패했습니다. 다시 시도해주세요." };
  }
}

export default function BabyNameGeneratorPage() {
  const [generatedNames, setGeneratedNames] = useState<GenerateBabyNamesOutput['names'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "any",
      length: "any",
      culturalOrigin: "한국",
      quantity: 3,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setGeneratedNames(null);
    
    const result = await handleGenerateNames(data);

    if ('error' in result) {
      toast({
        variant: "destructive",
        title: "오류",
        description: result.error,
      });
    } else {
      setGeneratedNames(result.names);
    }
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <BabyIcon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">작명 도우미</CardTitle>
              <CardDescription>길운의 원리에 맞춰 아이에게 완벽한 이름을 추천합니다.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성별</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="성별 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">남자</SelectItem>
                        <SelectItem value="female">여자</SelectItem>
                        <SelectItem value="any">상관없음</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 길이</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="이름 길이 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">짧은 이름</SelectItem>
                        <SelectItem value="medium">중간 길이 이름</SelectItem>
                        <SelectItem value="long">긴 이름</SelectItem>
                        <SelectItem value="any">상관없음</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="culturalOrigin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문화적 배경</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 한국, 일본, 영어권" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>추천 받을 이름 개수 (1-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <LoadingSpinner size="sm" className="mr-2"/> : <GiftIcon className="mr-2 h-4 w-4" />}
                이름 추천받기
              </Button>
            </form>
          </Form>
        </CardContent>
        {isLoading && <LoadingSpinner />}
        {generatedNames && !isLoading && (
          <CardFooter>
            <Card className="w-full bg-muted/50 p-4">
              <CardTitle className="text-lg mb-2">추천 이름</CardTitle>
              <ul className="space-y-3">
                {generatedNames.map((nameObj, index) => (
                  <li key={index} className="p-3 border rounded-md bg-background shadow-sm">
                    <p className="font-semibold text-primary text-base">{nameObj.name}</p>
                    <p className="text-sm text-foreground/80">{nameObj.meaning}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
