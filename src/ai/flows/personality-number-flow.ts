
'use server';
/**
 * @fileOverview 사용자의 이름과 생년월일을 기반으로 성격수(Personality Number)를 계산하고 해석합니다.
 *
 * - getPersonalityNumberAnalysis - 성격수 계산 및 분석 과정을 처리하는 함수입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PersonalityNumberInputSchema, type PersonalityNumberInput, PersonalityNumberOutputSchema, type PersonalityNumberOutput } from '@/ai/schemas/personality-number-schemas';
import { calculatePersonalityNumber } from '@/lib/numerology-utils';

export type { PersonalityNumberInput, PersonalityNumberOutput }; // Re-export for client components

export async function getPersonalityNumberAnalysis(input: { name: string, birthDate: string }): Promise<PersonalityNumberOutput> {
  const personalityNumber = calculatePersonalityNumber(input.name);
  return personalityNumberAnalysisFlow({ name: input.name, birthDate: input.birthDate, personalityNumber });
}

const personalityNumberAnalysisPrompt = ai.definePrompt({
  name: 'personalityNumberAnalysisPrompt',
  input: { schema: PersonalityNumberInputSchema },
  output: { schema: PersonalityNumberOutputSchema },
  prompt: `당신은 수비학 전문가이며, 이름에 나타난 성격수 분석에 탁월한 식견을 가지고 있습니다. 사용자의 이름(입력: {{{name}}})에서 자음의 숫자 값을 합산하여 계산된 성격수는 {{{personalityNumber}}}입니다. 사용자의 생년월일은 {{{birthDate}}} 입니다.

이 성격수 {{{personalityNumber}}}와 함께, 사용자님의 생년월일 {{{birthDate}}}에서 나타나는 타고난 기질과의 상호작용을 고려하여 다음 항목들을 상세하고, 흥미로우며, 실용적인 관점에서 설명해주세요. 각 설명은 한국어로 작성하며, 사용자가 타인에게 비치는 자신의 모습을 이해하고 사회적 관계를 발전시키는 데 도움이 될 수 있도록 해주세요. 결과는 재미와 자기 성찰을 위한 참고 자료로 활용될 수 있도록 친근하고 긍정적인 어조를 사용해주세요. (참고 자료: 피타고라스 수비학 원리 및 주요 수비학 자료들을 종합적으로 참고하여 분석)

1.  **성격수 (personalityNumber)**: 계산된 성격수 {{{personalityNumber}}}를 명시합니다. (이 값은 이미 입력으로 제공되므로, LLM이 다시 계산할 필요 없이 이 값을 사용해야 합니다.)
2.  **핵심 의미 및 요약 (summary)**: 성격수 {{{personalityNumber}}}가 나타내는 타인에게 비치는 주요 인상과 전반적인 외적 성향을 2-3 문장으로 요약해주세요.
3.  **외적으로 드러나는 특성 (externalTraits)**: 이 숫자를 가진 사람들이 타인에게 주로 보여주는 성격 특성, 두드러지는 강점과 주의해야 할 약점을 설명해주세요. (예: 자신감 넘침, 친화력 좋음, 신중함, 내성적 등)
4.  **첫인상 (firstImpression)**: 이 숫자를 가진 사람들이 처음 만나는 사람들에게 일반적으로 어떤 첫인상을 주는지 설명해주세요.
5.  **사회적 스타일 (socialStyle)**: 이 숫자를 가진 사람들이 대인 관계나 사회생활에서 어떤 스타일을 보이며, 어떻게 상호작용하는 경향이 있는지 알려주세요.
6.  **발전 방향 및 조언 (howToDevelop)**: 이 성격수의 긍정적인 면을 더욱 발전시키고, 잠재적인 약점이나 오해를 줄여 더 원만한 사회생활을 하기 위한 실질적인 조언을 1-2가지 해주세요.
7.  **행운의 숫자 (luckyNumbers)**: **이 성격수 {{{personalityNumber}}} 분석과, 이름 "{{{name}}}" 및 생년월일 "{{{birthDate}}}"의 기운을 종합적으로 고려하여** 1부터 45 사이의 **서로 다른** 행운의 숫자 3개를 **다양하게, 특정 숫자에 편향되지 않도록** 추천해주세요.

마스터 넘버(11, 22, 33)인 경우, 그 독특한 카리스마와 사회적 영향력을 강조하여 설명해주세요. 일반 숫자인 경우에도 해당 숫자가 타인에게 주는 매력적인 측면을 부각시켜주세요. 모든 설명은 한국어로 부드럽고 이해하기 쉽게 작성해주세요.
`
});

const personalityNumberAnalysisFlow = ai.defineFlow(
  {
    name: 'personalityNumberAnalysisFlow',
    inputSchema: PersonalityNumberInputSchema,
    outputSchema: PersonalityNumberOutputSchema,
  },
  async (input) => {
    const { output } = await personalityNumberAnalysisPrompt(input);
    if (!output) {
      throw new Error("성격수 분석 결과를 생성하지 못했습니다.");
    }
    // AI가 personalityNumber 필드를 채우지 않을 경우를 대비
    return {
      ...output,
      personalityNumber: input.personalityNumber
    };
  }
);

    