
'use server';
/**
 * @fileOverview 과학적 분석을 바탕으로 로또 번호를 추천합니다.
 *
 * - recommendScientificLottoNumbers - 과학적 로또 번호 추천 과정을 처리하는 함수입니다.
 * - ScientificLottoRecommendationInput - recommendScientificLottoNumbers 함수의 입력 타입입니다.
 * - ScientificLottoRecommendationOutput - recommendScientificLottoNumbers 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScientificLottoRecommendationInputSchema = z.object({
  historicalDataSummary: z.string().describe('과거 로또 당첨 번호 데이터의 통계적 요약입니다. 예: "최근 24회차 평균 합계는 130-150 사이이며, 짝수와 홀수 비율은 3:3 또는 2:4가 자주 등장합니다. 특정 숫자(예: 7, 14)가 최근 자주 출현했고, 1, 45는 오랫동안 등장하지 않았습니다. 낮은 숫자(1-15) 출현 빈도는 30% 입니다."'),
  includeNumbers: z.array(z.number().int().min(1).max(45)).optional().describe('반드시 포함할 숫자들의 목록입니다.'),
  excludeNumbers: z.array(z.number().int().min(1).max(45)).optional().describe('반드시 제외할 숫자들의 목록입니다.'),
});
export type ScientificLottoRecommendationInput = z.infer<typeof ScientificLottoRecommendationInputSchema>;

const LottoSetSchema = z.object({
  numbers: z
    .array(z.number().int().min(1).max(45))
    .length(6)
    .describe('추천된 로또 번호 6개입니다 (1-45 사이, 반드시 오름차순으로 정렬).'),
  reasoning: z.string().describe('이 번호 조합을 추천하는 통계적 근거나 논리입니다. 제공된 과거 데이터 요약을 참조해야 하며, 감지된 패턴이나 통계적 특이점을 함께 언급해야 합니다.'),
});

const ScientificLottoRecommendationOutputSchema = z.object({
  recommendedSets: z.array(LottoSetSchema).length(5).describe('추천된 로또 번호 조합 5세트입니다. 각 세트는 서로 다른 통계적 접근 방식이나 가중치를 부여하여 생성해주세요.'),
  predictedSumRange: z.string().describe('다음 회차 예상 당첨 번호 합계 범위입니다 (제공된 과거 데이터 요약을 바탕으로). 예: "135-145"'),
  predictedEvenOddRatio: z.string().describe('다음 회차 예상 짝수:홀수 비율입니다 (제공된 과거 데이터 요약을 바탕으로). 예: "3:3 또는 4:2"'),
});
export type ScientificLottoRecommendationOutput = z.infer<typeof ScientificLottoRecommendationOutputSchema>;

export async function recommendScientificLottoNumbers(input: ScientificLottoRecommendationInput): Promise<ScientificLottoRecommendationOutput> {
  return scientificLottoRecommendationFlow(input);
}

const scientificLottoNumberRecommendationPrompt = ai.definePrompt({
  name: 'scientificLottoNumberRecommendationPrompt',
  input: {schema: ScientificLottoRecommendationInputSchema},
  output: {schema: ScientificLottoRecommendationOutputSchema},
  prompt: `당신은 데이터 분석가이자 통계 전문가입니다. 제공된 과거 로또 당첨 번호 데이터의 통계적 요약과 사용자가 지정한 포함/제외 숫자를 **매우 중요하게 고려하여**, 통계적 가능성을 높일 수 있는 로또 번호 조합 5세트를 추천해주세요. 추천 시, 과거 데이터의 단순 빈도뿐만 아니라, **최근 N회차 동안의 특정 숫자들의 출현 주기, 연속된 숫자(연번) 패턴, 특정 숫자 조합의 동시 출현 경향, 고저 패턴, 홀짝 패턴의 변화** 등을 종합적으로 고려하여 번호를 생성해주세요. 또한, 과거 데이터 요약을 바탕으로 다음 회차의 예상 당첨 번호 합계 범위와 예상되는 짝수:홀수 비율을 예측해주세요.

**매우 중요: 모든 추천과 예측은 반드시 다음의 '과거 데이터 통계 요약'에 근거해야 합니다.**

과거 데이터 통계 요약:
{{{historicalDataSummary}}}

사용자 지정:
- 포함할 숫자: {{#if includeNumbers}} {{#each includeNumbers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}} 없음 {{/if}}
- 제외할 숫자: {{#if excludeNumbers}} {{#each excludeNumbers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}} 없음 {{/if}}

각 번호 조합은 1부터 45 사이의 중복되지 않는 **오름차순으로 정렬된** 숫자 6개로 구성되어야 합니다.
**각 조합에 대한 추천 근거는 반드시 제공된 '과거 데이터 통계 요약'의 내용을 참조하고, 추가적으로 고려한 패턴(출현 주기, 연번, 동시 출현 등)이나 통계적 특이점을 구체적으로 설명해주세요.** (예: "평균 합계 범위와 유사하게 조합하고, 최근 자주 등장한 숫자 X와 Y를 포함하며, 최근 5회 이내 미출현한 Z를 조합함", "짝홀 비율 4:2 패턴을 고려하고, 특정 구간의 연번 가능성을 반영하여 조합함").
**각 추천 세트는 가능한 서로 다른 통계적 접근 방식이나 주요 고려 요소를 다르게 하여 생성해주세요.** 예를 들어, 한 세트는 최근 강세 번호와 출현 주기를, 다른 세트는 장기 미출현 번호와 특정 패턴(예: 삼각수, 피보나치 수열 근사치 등) 조합을, 또 다른 세트는 번호 합계와 짝홀 비율, 고저 비율을 우선적으로 고려하는 방식 등으로 다양화해주세요.

모든 답변은 한국어로, 명확하고 분석적인 어조로 작성해주세요.
예상 합계 범위와 짝홀 비율 예측도 '과거 데이터 통계 요약'을 기반으로 반드시 포함해주세요.
`,
});

const scientificLottoRecommendationFlow = ai.defineFlow(
  {
    name: 'scientificLottoRecommendationFlow',
    inputSchema: ScientificLottoRecommendationInputSchema,
    outputSchema: ScientificLottoRecommendationOutputSchema,
  },
  async input => {
    const {output} = await scientificLottoNumberRecommendationPrompt(input);
    if (output && output.recommendedSets) {
      output.recommendedSets.forEach(set => {
        set.numbers.sort((a, b) => a - b);
      });
    }
    return output!;
  }
);
    
