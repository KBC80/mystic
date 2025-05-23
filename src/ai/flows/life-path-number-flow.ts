
'use server';
/**
 * @fileOverview 사용자의 생년월일을 기반으로 인생여정수(Life Path Number)를 계산하고 해석합니다.
 *
 * - getLifePathNumberAnalysis - 인생여정수 계산 및 분석 과정을 처리하는 함수입니다.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import { 
  LifePathNumberInputSchema, 
  type LifePathNumberInput, 
  LifePathNumberOutputSchema, 
  type LifePathNumberOutput 
} from '@/ai/schemas/life-path-number-schemas';

// Re-export types for convenience if they are used by client components
export type { LifePathNumberInput, LifePathNumberOutput };

function calculateLifePathNumber(birthDate: string): number {
  const date = new Date(birthDate);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  const sumDigits = (num: number): number => {
    let sum = 0;
    String(num).split('').forEach(digit => {
      sum += parseInt(digit, 10);
    });
    return sum;
  };

  let yearSum = sumDigits(year);
  while (yearSum > 9 && yearSum !== 11 && yearSum !== 22 && yearSum !== 33) {
    yearSum = sumDigits(yearSum);
  }

  let monthSum = sumDigits(month);
  while (monthSum > 9 && monthSum !== 11 && monthSum !== 22 && monthSum !== 33) {
    monthSum = sumDigits(monthSum);
  }

  let daySum = sumDigits(day);
  while (daySum > 9 && daySum !== 11 && daySum !== 22 && daySum !== 33) {
    daySum = sumDigits(daySum);
  }

  let totalSum = yearSum + monthSum + daySum;
  while (totalSum > 9 && totalSum !== 11 && totalSum !== 22 && totalSum !== 33) {
    totalSum = sumDigits(totalSum);
  }
  return totalSum;
}

export async function getLifePathNumberAnalysis(input: LifePathNumberInput): Promise<LifePathNumberOutput> {
  const lifePathNumber = calculateLifePathNumber(input.birthDate);
  return lifePathNumberAnalysisFlow({ ...input, lifePathNumber });
}

const lifePathNumberAnalysisPrompt = ai.definePrompt({
  name: 'lifePathNumberAnalysisPrompt',
  input: {schema: LifePathNumberInputSchema.extend({ lifePathNumber: z.number() })},
  output: {schema: LifePathNumberOutputSchema},
  prompt: `당신은 친절하고 통찰력 있는 수비학 전문가입니다. 사용자의 생년월일(입력: {{{birthDate}}})을 바탕으로 계산된 인생여정수는 {{{lifePathNumber}}}입니다. 
  
  이 인생여정수 {{{lifePathNumber}}}에 대해 다음 항목들을 상세하고 흥미롭게, 그리고 긍정적인 관점에서 설명해주세요. 각 설명은 한국어로 작성하며, 사용자가 자신을 이해하고 삶의 방향을 설정하는 데 도움이 될 수 있도록 해주세요. 결과는 재미로 참고할 수 있도록 가볍고 친근한 어조를 사용해주세요.

  1.  **인생여정수 (lifePathNumber)**: 계산된 인생여정수 {{{lifePathNumber}}}를 명시합니다.
  2.  **숫자의 핵심 의미 (numberMeaning)**: 인생여정수 {{{lifePathNumber}}}가 가지는 핵심적인 의미와 상징을 1-2 문장으로 요약해주세요.
  3.  **성격 특성 (personalityTraits)**: 이 숫자를 가진 사람들의 일반적인 성격, 두드러지는 강점과 주의해야 할 약점을 설명해주세요.
  4.  **삶의 목적/과제 (lifePurpose)**: 이 숫자를 가진 사람들이 삶에서 추구하거나 경험하게 될 주요 목적 또는 과제에 대해 이야기해주세요.
  5.  **직업 제안 (careerSuggestions)**: 이 숫자의 특성에 잘 어울릴 만한 직업 분야나 역할을 2~3가지 제안해주세요.
  6.  **관계 궁합 (relationshipCompatibility)**: 다른 숫자들과의 관계에서 나타날 수 있는 일반적인 궁합이나 상호작용 방식에 대해 간략히 언급해주세요. (예: '비슷한 성향의 숫자들과 잘 맞으며, 반대 성향의 숫자들과는 배울 점이 많습니다.')
  7.  **삶의 조언 (advice)**: 이 인생여정수를 가진 사람들이 더 만족스러운 삶을 살기 위한 실질적인 조언을 1-2가지 해주세요.
  8.  **행운의 숫자 (luckyNumbers)**: **이 인생여정수 {{{lifePathNumber}}} 분석을 바탕으로** 1부터 45 사이의 **서로 다른** 행운의 숫자 3개를 **다양하게, 특정 숫자에 편향되지 않도록** 추천해주세요.

  마스터 넘버(11, 22, 33)인 경우, 그 특성을 강조하여 설명해주세요. 일반 숫자인 경우에도 해당 숫자의 긍정적인 측면을 부각시켜주세요.
  모든 설명은 한국어로 부드럽고 이해하기 쉽게 작성해주세요.
  `,
});

const lifePathNumberAnalysisFlow = ai.defineFlow(
  {
    name: 'lifePathNumberAnalysisFlow',
    inputSchema: LifePathNumberInputSchema.extend({ lifePathNumber: z.number() }),
    outputSchema: LifePathNumberOutputSchema,
  },
  async (input) => {
    const {output} = await lifePathNumberAnalysisPrompt(input);
    if (!output) {
        throw new Error("인생여정수 분석 결과를 생성하지 못했습니다.");
    }
    // AI가 lifePathNumber 필드를 채우지 않을 경우를 대비하여, 입력으로 받은 lifePathNumber를 사용
    return {
        ...output,
        lifePathNumber: input.lifePathNumber 
    };
  }
);
