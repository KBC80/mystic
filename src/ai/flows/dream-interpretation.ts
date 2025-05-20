// src/ai/flows/dream-interpretation.ts
'use server';

/**
 * @fileOverview 꿈 내용을 분석하여 그 의미를 설명하고 조언을 제공합니다.
 *
 * - dreamInterpretation - 꿈 해석 과정을 처리하는 함수입니다.
 * - DreamInterpretationInput - dreamInterpretation 함수의 입력 타입입니다.
 * - DreamInterpretationOutput - dreamInterpretation 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DreamInterpretationInputSchema = z.object({
  dreamContent: z
    .string()
    .describe('해석이 필요한 꿈의 내용입니다.'),
});
export type DreamInterpretationInput = z.infer<typeof DreamInterpretationInputSchema>;

const DreamInterpretationOutputSchema = z.object({
  summary: z.string().describe('꿈에 대한 요약입니다.'),
  symbolAnalysis: z
    .string()
    .describe('꿈에 나타난 상징들에 대한 분석입니다.'),
  omen: z.enum(['good', 'bad', 'neutral']).describe('꿈이 좋은 징조인지 나쁜 징조인지, 혹은 중립적인지를 나타냅니다.'),
  additionalCautions: z.string().describe('꿈을 바탕으로 한 추가적인 주의사항입니다.'),
  goodFortune: z.string().describe('꿈이 나타내는 좋은 운세입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('1에서 45 사이의 행운의 숫자 세 개입니다.'),
});
export type DreamInterpretationOutput = z.infer<typeof DreamInterpretationOutputSchema>;

export async function dreamInterpretation(input: DreamInterpretationInput): Promise<DreamInterpretationOutput> {
  return dreamInterpretationFlow(input);
}

const dreamInterpretationPrompt = ai.definePrompt({
  name: 'dreamInterpretationPrompt',
  input: {schema: DreamInterpretationInputSchema},
  output: {schema: DreamInterpretationOutputSchema},
  prompt: `당신은 수십 년간의 경험을 바탕으로 꿈 해몽 분야에서 최고의 권위를 인정받는 여성 해몽가입니다. 당신의 분석은 매우 정확하며, 많은 사람들에게 삶의 중요한 통찰을 제공해 왔습니다. 사용자의 꿈을 분석하고 그 안에 담긴 주요 상징들을 세심하게 추출해주세요. 꿈의 의미를 명확하고 구체적으로 설명하고, 그것이 좋은 징조인지, 나쁜 징조인지, 혹은 중립적인 징조인지 알려주세요. 모든 답변은 한국어로, 따뜻하고 공감하는 어조로 전달하되, 전문가적인 식견을 담아주세요.

  꿈 내용: {{{dreamContent}}}

  해석을 바탕으로 사용자에게 실질적인 도움이 될 수 있는 추가적인 주의사항, 꿈이 암시하는 잠재적인 행운, 그리고 1에서 45 사이의 행운의 숫자 세 개를 제공해주세요.
  징조는 "good", "bad", "neutral" 중 하나여야 합니다. 당신의 깊이 있는 지혜로 사용자의 꿈에 담긴 메시지를 명확하게 풀어주세요.`,
});

const dreamInterpretationFlow = ai.defineFlow(
  {
    name: 'dreamInterpretationFlow',
    inputSchema: DreamInterpretationInputSchema,
    outputSchema: DreamInterpretationOutputSchema,
  },
  async input => {
    const {output} = await dreamInterpretationPrompt(input);
    return output!;
  }
);

