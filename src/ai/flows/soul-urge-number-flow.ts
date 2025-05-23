
'use server';
/**
 * @fileOverview 사용자의 이름을 기반으로 생명수(Soul Urge Number)를 계산하고 해석합니다.
 *
 * - getSoulUrgeNumberAnalysis - 생명수 계산 및 분석 과정을 처리하는 함수입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SoulUrgeNumberInputSchema, type SoulUrgeNumberInput, SoulUrgeNumberOutputSchema, type SoulUrgeNumberOutput } from '@/ai/schemas/soul-urge-number-schemas';
import { calculateSoulUrgeNumber } from '@/lib/numerology-utils';

export type { SoulUrgeNumberInput, SoulUrgeNumberOutput }; // Re-export for client components

export async function getSoulUrgeNumberAnalysis(nameInput: { name: string }): Promise<SoulUrgeNumberOutput> {
  const soulUrgeNumber = calculateSoulUrgeNumber(nameInput.name);
  return soulUrgeNumberAnalysisFlow({ name: nameInput.name, soulUrgeNumber });
}

const soulUrgeNumberAnalysisPrompt = ai.definePrompt({
  name: 'soulUrgeNumberAnalysisPrompt',
  input: { schema: SoulUrgeNumberInputSchema },
  output: { schema: SoulUrgeNumberOutputSchema },
  prompt: \`당신은 수비학 전문가이며, 특히 이름에 담긴 생명수(영혼수) 분석에 뛰어난 통찰력을 가지고 있습니다. 사용자의 이름(입력: {{{name}}})에서 모음의 숫자 값을 합산하여 계산된 생명수는 {{{soulUrgeNumber}}}입니다.

이 생명수 {{{soulUrgeNumber}}}에 대해 다음 항목들을 상세하고, 영감을 주며, 긍정적인 관점에서 설명해주세요. 각 설명은 한국어로 작성하며, 사용자가 자신의 깊은 내면과 삶의 동기를 이해하는 데 도움이 될 수 있도록 해주세요. 결과는 재미와 자기 성찰을 위한 참고 자료로 활용될 수 있도록 부드럽고 친근한 어조를 사용해주세요. (참고 자료: 스텔라의 수비학 블로그 - https://stellasjourney.tistory.com/category/Stella's%20Numberology%F0%9F%93%96 등 생명수 관련 내용 종합)

1.  **생명수 (soulUrgeNumber)**: 계산된 생명수 {{{soulUrgeNumber}}}를 명시합니다. (이 값은 이미 입력으로 제공되므로, LLM이 다시 계산할 필요 없이 이 값을 사용해야 합니다.)
2.  **핵심 의미 및 요약 (summary)**: 생명수 {{{soulUrgeNumber}}}가 가지는 핵심적인 의미와 그 사람의 영혼이 추구하는 바를 2-3 문장으로 요약해주세요.
3.  **내면의 깊은 욕망 (innerDesires)**: 이 숫자를 가진 사람들이 마음 깊은 곳에서 진정으로 갈망하는 것, 추구하는 가치, 그리고 무엇이 그들을 가장 만족시키는지 설명해주세요.
4.  **주요 동기 부여 요인 (motivations)**: 이 숫자를 가진 사람들을 움직이게 하고 삶에 활력을 불어넣는 주요 동기 부여 요인들은 무엇인지 알려주세요.
5.  **삶의 도전 과제 (lifeChallenges)**: 이 생명수의 특성으로 인해 삶에서 겪을 수 있는 주요 도전 과제나 극복해야 할 내면의 장애물은 무엇인지, 그리고 이를 어떻게 긍정적으로 헤쳐나갈 수 있을지 조언해주세요.
6.  **영적인 경로 및 조언 (spiritualPath)**: 생명수 {{{soulUrgeNumber}}}가 암시하는 영적인 성향이나 추구하면 좋을 영적인 경로에 대해 이야기하고, 내면의 평화와 성장을 위한 조언을 1-2가지 해주세요.
7.  **행운의 숫자 (luckyNumbers)**: **이 생명수 {{{soulUrgeNumber}}} 분석과 입력된 이름 "{{{name}}}"의 기운을 종합적으로 고려하여** 1부터 45 사이의 **서로 다른** 행운의 숫자 3개를 **다양하게, 특정 숫자에 편향되지 않도록** 추천해주세요.

마스터 넘버(11, 22, 33)인 경우, 그 특별한 영적 잠재력과 영향력을 강조하여 설명해주세요. 일반 숫자인 경우에도 해당 숫자의 긍정적인 측면과 영혼의 목소리를 부각시켜주세요. 모든 설명은 한국어로 부드럽고 이해하기 쉽게 작성해주세요.
\`
});

const soulUrgeNumberAnalysisFlow = ai.defineFlow(
  {
    name: 'soulUrgeNumberAnalysisFlow',
    inputSchema: SoulUrgeNumberInputSchema,
    outputSchema: SoulUrgeNumberOutputSchema,
  },
  async (input) => {
    const { output } = await soulUrgeNumberAnalysisPrompt(input);
    if (!output) {
      throw new Error("생명수 분석 결과를 생성하지 못했습니다.");
    }
    // AI가 soulUrgeNumber 필드를 채우지 않을 경우를 대비
    return {
      ...output,
      soulUrgeNumber: input.soulUrgeNumber
    };
  }
);
