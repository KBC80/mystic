
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Brain, Home, Users, Heart } from 'lucide-react';
import { MBTI_OPTIONS } from '@/lib/constants';

const formSchema = z.object({
  person1Name: z.string().optional(),
  person1Mbti: z.string().min(1, "첫 번째 분의 MBTI를 선택해주세요."),
  person2Name: z.string().optional(),
  person2Mbti: z.string().min(1, "두 번째 분의 MBTI를 선택해주세요."),
});

type MbtiFormValues = z.infer<typeof formSchema>;

export default function MbtiCompatibilityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MbtiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person1Name: "",
      person1Mbti: "",
      person2Name: "",
      person2Mbti: "",
    },
  });

  async function onSubmit(values: MbtiFormValues) {
    setIsSubmitting(true);
    const queryParams = new URLSearchParams({
      p1mbti: values.person1Mbti,
      p2mbti: values.person2Mbti,
    });
    if (values.person1Name) queryParams.append('p1name', values.person1Name);
    if (values.person2Name) queryParams.append('p2name', values.person2Name);
    
    router.push(`/relationship-compatibility/mbti/result?${queryParams.toString()}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="text-primary h-6 w-6" /> MBTI 연애 궁합 
          </CardTitle>
          <CardDescription className="break-words">
            두 분의 MBTI 유형을 선택하여 서로의 관계 궁합을 알아보세요. 결과는 재미로 참고해주세요!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Person 1 */}
                <div className="space-y-4 p-4 border rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-secondary-foreground flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> 첫 번째 분</h3>
                  <FormField
                    control={form.control}
                    name="person1Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름 (선택)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 김철수" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="person1Mbti"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MBTI 유형</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="MBTI 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MBTI_OPTIONS.map((option) => (
                              <SelectItem key={`p1-${option.value}`} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Person 2 */}
                <div className="space-y-4 p-4 border rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-secondary-foreground flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> 두 번째 분</h3>
                   <FormField
                    control={form.control}
                    name="person2Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름 (선택)</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 이영희" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="person2Mbti"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MBTI 유형</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="MBTI 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MBTI_OPTIONS.map((option) => (
                              <SelectItem key={`p2-${option.value}`} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "MBTI 궁합 결과 보기"}
              </Button>
            </form>
          </Form>
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
