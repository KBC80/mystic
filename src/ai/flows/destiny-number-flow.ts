
'use server';
/**
 * @fileOverview 사용자의 이름을 기반으로 운명수(Destiny Number)를 계산하고 해석합니다.
 *
 * - getDestinyNumberAnalysis - 운명수 계산 및 분석 과정을 처리하는 함수입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { DestinyNumberInputSchema, type DestinyNumberInput, DestinyNumberOutputSchema, type DestinyNumberOutput } from '@/ai/schemas/destiny-number-schemas';
import { calculateDestinyNumber } from '@/lib/numerology-utils';

export type { DestinyNumberInput, DestinyNumberOutput }; // Re-export for client components

export async function getDestinyNumberAnalysis(nameInput: { name: string }): Promise<DestinyNumberOutput> {
  const destinyNumber = calculateDestinyNumber(nameInput.name);
  return destinyNumberAnalysisFlow({ name: nameInput.name, destinyNumber });
}

const destinyNumberAnalysisPrompt = ai.definePrompt({
  name: 'destinyNumberAnalysisPrompt',
  input: { schema: DestinyNumberInputSchema },
  output: { schema: DestinyNumberOutputSchema },
  prompt: `당신은 친절하고 통찰력 있는 수비학 전문가입니다. 사용자의 이름(입력: {{{name}}})을 바탕으로 계산된 운명수는 {{{destinyNumber}}}입니다.

  이 운명수 {{{destinyNumber}}}에 대해 다음 항목들을 상세하고 흥미롭게, 그리고 긍정적인 관점에서 설명해주세요. 각 설명은 한국어로 작성하며, 사용자가 자신을 이해하고 삶의 방향을 설정하는 데 도움이 될 수 있도록 해주세요. 결과는 재미로 참고할 수 있도록 가볍고 친근한 어조를 사용해주세요.
  (참고 자료: 스텔라의 수비학 블로그 - https://stellasjourney.tistory.com/19 등 운명수 관련 내용 종합)

  1.  **운명수 (destinyNumber)**: 계산된 운명수 {{{destinyNumber}}}를 명시합니다. (이 값은 이미 입력으로 제공되므로, LLM이 다시 계산할 필요 없이 이 값을 사용해야 합니다.)
  2.  **핵심 의미 및 요약 (summary)**: 운명수 {{{destinyNumber}}}가 가지는 핵심적인 의미와 그 사람의 전반적인 성향을 2-3 문장으로 요약해주세요.
  3.  **성격 특성 (personalityTraits)**: 이 숫자를 가진 사람들의 일반적인 성격, 두드러지는 강점과 개선하면 좋을 약점을 설명해주세요. (예: 리더십, 독립심, 창의성, 예민함, 고집 등)
  4.  **재능 및 직업 (talentsAndCareer)**: 이 숫자의 특성에 잘 어울릴 만한 타고난 재능과, 그 재능을 발휘할 수 있는 직업 분야나 역할을 2~3가지 제안해주세요.
  5.  **관계 및 연애 (relationships)**: 이 숫자를 가진 사람들이 대인 관계나 연애에서 어떤 스타일을 보이며, 어떤 숫자와 잘 어울리거나 주의해야 할 점은 무엇인지 간략히 언급해주세요.
  6.  **삶의 목적 및 조언 (lifePurposeAndAdvice)**: 이 운명수를 가진 사람들이 삶에서 추구하거나 경험하게 될 주요 목적 또는 과제에 대해 이야기하고, 더 만족스러운 삶을 살기 위한 실질적인 조언을 1-2가지 해주세요.
  7.  **행운의 숫자 (luckyNumbers)**: **이 운명수 {{{destinyNumber}}} 분석과 입력된 이름 "{{{name}}}"의 기운을 종합적으로 고려하여** 1부터 45 사이의 **서로 다른** 행운의 숫자 3개를 **다양하게, 특정 숫자에 편향되지 않도록** 추천해주세요.

  마스터 넘버(11, 22, 33)인 경우, 그 특성과 잠재력을 강조하여 설명해주세요. 일반 숫자인 경우에도 해당 숫자의 긍정적인 측면을 부각시켜주세요.
  모든 설명은 한국어로 부드럽고 이해하기 쉽게 작성해주세요.
  `
});

const destinyNumberAnalysisFlow = ai.defineFlow(
  {
    name: 'destinyNumberAnalysisFlow',
    inputSchema: DestinyNumberInputSchema,
    outputSchema: DestinyNumberOutputSchema,
  },
  async (input) => {
    const { output } = await destinyNumberAnalysisPrompt(input);
    if (!output) {
      throw new Error("운명수 분석 결과를 생성하지 못했습니다.");
    }
    // AI가 destinyNumber 필드를 채우지 않을 경우를 대비하여, 입력으로 받은 destinyNumber를 사용
    return {
      ...output,
      destinyNumber: input.destinyNumber
    };
  }
);
