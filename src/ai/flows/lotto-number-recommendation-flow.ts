
'use server';
/**
 * @fileOverview 사용자의 정보를 바탕으로 로또 번호를 추천하고 관련 조언을 제공합니다.
 *
 * - recommendLottoNumbers - 로또 번호 추천 과정을 처리하는 함수입니다.
 * - LottoNumberRecommendationInput - recommendLottoNumbers 함수의 입력 타입입니다.
 * - LottoNumberRecommendationOutput - recommendLottoNumbers 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LottoNumberRecommendationInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  birthTime: z.string().describe('태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  name: z.string().describe('로또 번호를 추천받을 사람의 이름입니다.'),
});
export type LottoNumberRecommendationInput = z.infer<typeof LottoNumberRecommendationInputSchema>;

const LottoSetSchema = z.object({
  numbers: z
    .array(z.number().int().min(1).max(45))
    .length(6)
    .describe('추천된 로또 번호 6개입니다 (1-45 사이).'),
  reasoning: z.string().describe('이 번호 조합을 추천하는 이유에 대한 설명입니다.'),
});

const LottoNumberRecommendationOutputSchema = z.object({
  lottoSets: z.array(LottoSetSchema).length(3).describe('추천된 로또 번호 조합 3세트입니다.'),
  overallAdvice: z.string().describe('로또 구매 및 행운에 대한 전반적인 조언입니다.'),
});
export type LottoNumberRecommendationOutput = z.infer<typeof LottoNumberRecommendationOutputSchema>;

export async function recommendLottoNumbers(input: LottoNumberRecommendationInput): Promise<LottoNumberRecommendationOutput> {
  return lottoNumberRecommendationFlow(input);
}

const lottoNumberRecommendationPrompt = ai.definePrompt({
  name: 'lottoNumberRecommendationPrompt',
  input: {schema: LottoNumberRecommendationInputSchema},
  output: {schema: LottoNumberRecommendationOutputSchema},
  prompt: `당신은 수십 년 경력의 대한민국 최고의 로또 번호 추천 전문가이자 수리 역학의 대가입니다. 사용자의 사주 명리학적 정보 (생년월일, 태어난 시간)와 이름을 깊이 분석하여, 이 사용자에게 특별한 행운을 가져다 줄 로또 번호 조합 3세트를 추천해주세요. 각 번호 조합은 1부터 45 사이의 숫자 6개로 구성되어야 합니다.

사용자 정보:
- 이름: {{{name}}}
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}

결과 형식:
1.  **추천 로또 번호 조합 (3세트)**:
    *   각 세트마다 6개의 번호를 제시하고, 왜 이 번호 조합이 사용자에게 길운을 가져다줄 수 있는지에 대한 심층적이고 설득력 있는 해설을 포함해야 합니다. (예: 사주 오행의 조화, 이름의 수리적 의미, 특별한 날짜와의 연관성 등)
2.  **전반적인 행운 조언**:
    *   로또 구매 시 마음가짐, 추천 요일/시간, 또는 기타 행운을 높일 수 있는 팁 등을 포함하여 사용자에게 희망과 긍정을 줄 수 있는 따뜻한 조언을 제공해주세요.

모든 답변은 한국어로, 전문가적인 식견과 친근함이 조화된 어조로 작성해주세요. 사용자가 당신의 추천을 통해 큰 행운을 얻을 수 있다는 믿음을 심어주세요.
`,
});

const lottoNumberRecommendationFlow = ai.defineFlow(
  {
    name: 'lottoNumberRecommendationFlow',
    inputSchema: LottoNumberRecommendationInputSchema,
    outputSchema: LottoNumberRecommendationOutputSchema,
  },
  async input => {
    const {output} = await lottoNumberRecommendationPrompt(input);
    return output!;
  }
);
