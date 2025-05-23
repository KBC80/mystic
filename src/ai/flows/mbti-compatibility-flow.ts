
'use server';
/**
 * @fileOverview 두 사람의 MBTI 유형을 기반으로 궁합을 분석하고 조언을 제공합니다.
 *
 * - getMbtiCompatibility - MBTI 궁합 분석 과정을 처리하는 함수입니다.
 * - MbtiCompatibilityInput - getMbtiCompatibility 함수의 입력 타입입니다.
 * - MbtiCompatibilityOutput - getMbtiCompatibility 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MBTI_TYPES } from '@/lib/constants';

const MbtiCompatibilityInputSchema = z.object({
  person1Mbti: z.enum(MBTI_TYPES as [string, ...string[]]).describe('첫 번째 사람의 MBTI 유형입니다.'),
  person2Mbti: z.enum(MBTI_TYPES as [string, ...string[]]).describe('두 번째 사람의 MBTI 유형입니다.'),
  person1Name: z.string().optional().describe('첫 번째 사람의 이름입니다 (선택 사항).'),
  person2Name: z.string().optional().describe('두 번째 사람의 이름입니다 (선택 사항).'),
});
export type MbtiCompatibilityInput = z.infer<typeof MbtiCompatibilityInputSchema>;

const MbtiCompatibilityOutputSchema = z.object({
  compatibilityScore: z.number().min(0).max(100).describe('두 MBTI 유형 간의 궁합 점수 (0-100점)입니다.'),
  compatibilityGrade: z.enum(["천생연분", "아주 잘 맞아요", "꽤 잘 맞아요", "노력이 필요해요", "상극은 아니지만 쉽지 않아요"]).describe('궁합 점수에 따른 간단한 등급입니다.'),
  overallDescription: z.string().describe('두 MBTI 유형 간의 관계에 대한 전반적인 궁합 설명입니다. 성격적 특징, 상호작용 방식, 전반적인 조화도 등을 포함해야 합니다.'),
  strengths: z.string().describe('이 관계의 주요 강점 또는 긍정적인 측면입니다.'),
  weaknesses: z.string().describe('이 관계에서 주의해야 할 약점 또는 잠재적인 갈등 요소입니다.'),
  improvementTips: z.string().describe('관계를 더욱 발전시키거나 어려움을 극복하기 위한 실질적인 조언입니다. 각자의 성향을 고려한 구체적인 팁을 제공해주세요.'),
  recommendedActivities: z.string().describe('두 MBTI 유형이 함께하면 좋을 만한 활동이나 데이트 코스를 2~3가지 추천해주세요. 각 활동이 왜 두 유형에게 좋을 수 있는지 간단한 이유를 포함해주세요.'),
  luckyNumbers: z.array(z.number().int().min(1).max(45)).length(3).describe('이 MBTI 궁합 분석을 바탕으로 한 **서로 다른** 행운의 숫자 3개를 **다양하게, 특정 숫자에 편향되지 않도록** 추천합니다 (1-45 사이).'),
});
export type MbtiCompatibilityOutput = z.infer<typeof MbtiCompatibilityOutputSchema>;

export async function getMbtiCompatibility(input: MbtiCompatibilityInput): Promise<MbtiCompatibilityOutput> {
  return mbtiCompatibilityFlow(input);
}

const mbtiCompatibilityPrompt = ai.definePrompt({
  name: 'mbtiCompatibilityPrompt',
  input: {schema: MbtiCompatibilityInputSchema},
  output: {schema: MbtiCompatibilityOutputSchema},
  prompt: `당신은 MBTI 성격 유형 분석 및 관계 궁합 전문가입니다. 다음 두 사람의 MBTI 유형을 바탕으로 상세하고 실질적인 궁합 분석을 제공해주세요. 답변은 한국어로, 친근하면서도 전문적인 어조로 작성해주세요. 재미로 보는 콘텐츠임을 감안하여 긍정적이고 건설적인 조언 위주로 구성하되, 현실적인 어려움도 부드럽게 언급해주세요.
첫 번째 사람 이름(선택): {{{person1Name}}}
첫 번째 사람 MBTI: {{{person1Mbti}}}
두 번째 사람 이름(선택): {{{person2Name}}}
두 번째 사람 MBTI: {{{person2Mbti}}}

**궁합 분석 결과 항목 (아래 모든 항목을 반드시 채워주세요):**

1.  **궁합 점수 (compatibilityScore):** 두 MBTI 유형 간의 전반적인 조화도를 고려하여 0점에서 100점 사이의 점수로 표현해주세요. (예: 85)
2.  **궁합 등급 (compatibilityGrade):** 점수에 따라 "천생연분", "아주 잘 맞아요", "꽤 잘 맞아요", "노력이 필요해요", "상극은 아니지만 쉽지 않아요" 중 하나를 선택해주세요.
3.  **종합 궁합 설명 (overallDescription):** 
    *   {{{person1Mbti}}}와 {{{person2Mbti}}} 유형의 핵심적인 성격 특성을 간략히 언급하고, 이 두 유형이 만났을 때 일반적으로 나타나는 관계의 역동성과 주요 특징을 설명해주세요. (예: 서로에게 어떤 매력을 느끼는지, 어떤 부분에서 공감대를 형성하는지, 또는 어떤 차이점으로 인해 오해가 생길 수 있는지 등)
    *   서로의 어떤 점이 잘 맞고, 어떤 부분에서 서로를 보완해 줄 수 있는지 긍정적인 관점에서 분석해주세요.
4.  **관계의 강점 (strengths):**
    *   이 두 유형이 함께할 때 나타나는 가장 큰 강점이나 시너지 효과를 2-3가지 구체적으로 설명해주세요. (예: 서로의 부족한 부분을 채워주며 함께 성장할 수 있다, 안정적인 관계를 유지하며 서로에게 힘이 되어준다 등)
5.  **관계의 약점 및 주의사항 (weaknesses):**
    *   이 두 유형이 관계에서 겪을 수 있는 잠재적인 어려움이나 갈등 요소를 2-3가지 구체적으로 언급해주세요. 이러한 약점이 왜 발생하는지 각 유형의 성격적 특성과 연결하여 설명하고, 어떻게 하면 이를 슬기롭게 극복할 수 있을지에 대한 힌트도 포함해주세요. (예: 의사소통 방식의 차이로 오해가 생길 수 있다, 서로의 개인적인 공간을 존중하는 것이 중요하다 등)
6.  **관계 개선을 위한 조언 (improvementTips):**
    *   두 사람이 서로를 더 잘 이해하고, 더욱 건강하고 행복한 관계를 만들어가기 위한 실질적이고 구체적인 조언을 2-3가지 제시해주세요. 각 MBTI 유형의 특성을 고려하여 맞춤형 조언을 제공하는 것이 좋습니다. (예: {{{person1Mbti}}}에게는... {{{person2Mbti}}}에게는... 와 같이 표현하는 것도 좋습니다.)
7.  **함께하면 좋은 활동 추천 (recommendedActivities):**
    *   두 MBTI 유형의 성향을 고려했을 때, 함께 즐기거나 서로를 더 잘 알아갈 수 있는 활동 또는 데이트 코스를 2-3가지 추천해주세요. 각 활동이 왜 이들에게 좋을 수 있는지 간단한 이유도 덧붙여주세요. (예: 자연 속에서 함께 산책하기 - 서로에게 편안함을 주며 깊은 대화를 나눌 수 있음, 새로운 취미 함께 배우기 - 공동의 목표를 통해 유대감을 강화할 수 있음 등)
8.  **행운의 숫자 (luckyNumbers):** 이 MBTI 궁합 분석을 바탕으로 두 사람에게 행운을 가져다 줄 수 있는 1부터 45 사이의 **서로 다른** 숫자 3개를 **다양하게, 특정 숫자에 편향되지 않도록** 추천해주세요.

모든 분석은 각 MBTI 유형의 일반적인 특징에 기반하되, 지나치게 단정적이거나 부정적인 표현은 피해주세요. 사용자들이 관계에 대해 긍정적인 통찰을 얻고, 서로를 이해하는 데 도움이 되는 내용으로 구성해주세요.
`,
});

const mbtiCompatibilityFlow = ai.defineFlow(
  {
    name: 'mbtiCompatibilityFlow',
    inputSchema: MbtiCompatibilityInputSchema,
    outputSchema: MbtiCompatibilityOutputSchema,
  },
  async (input) => {
    const {output} = await mbtiCompatibilityPrompt(input);
    if (!output) {
      throw new Error("MBTI 궁합 분석 결과를 생성하지 못했습니다.");
    }
    return output;
  }
);
