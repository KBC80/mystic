
'use server';
/**
 * @fileOverview 사용자의 생년월일시와 이름, 성별을 바탕으로 오늘의 운세를 제공합니다.
 *
 * - getDailyFortune - 오늘의 운세 제공 과정을 처리하는 함수입니다.
 * - GetDailyFortuneInput - getDailyFortune 함수의 입력 타입입니다.
 * - GetDailyFortuneOutput - getDailyFortune 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetDailyFortuneInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  birthTime: z.string().describe('태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  name: z.string().describe('운세를 볼 사람의 이름입니다.'),
  gender: z.enum(['male', 'female']).describe('운세를 볼 사람의 성별입니다 (male: 남자, female: 여자).'),
});
export type GetDailyFortuneInput = z.infer<typeof GetDailyFortuneInputSchema>;

const GetDailyFortuneOutputSchema = z.object({
  overallFortune: z.string().describe('오늘의 전반적인 총운입니다. 긍정적인 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  love: z.string().describe('오늘의 애정운입니다. 긍정적 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  health: z.string().describe('오늘의 건강운입니다. 긍정적 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  work: z.string().describe('오늘의 직업운 또는 학업운입니다. 긍정적 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  relationships: z.string().describe('오늘의 대인관계운입니다. 긍정적 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('오늘의 행운의 숫자 3개 (1-45 사이)입니다.'),
  gapjaYearName: z.string().describe('태어난 해의 60갑자 간지 이름입니다 (예: 갑자년).'),
  zodiacColor: z.string().describe('태어난 해의 띠 색깔입니다 (예: 청색).'),
  zodiacAnimal: z.string().describe('태어난 해의 띠 동물입니다 (예: 쥐띠).'),
});
export type GetDailyFortuneOutput = z.infer<typeof GetDailyFortuneOutputSchema>;

export async function getDailyFortune(input: GetDailyFortuneInput): Promise<GetDailyFortuneOutput> {
  return getDailyFortuneFlow(input);
}

const dailyFortunePrompt = ai.definePrompt({
  name: 'dailyFortunePrompt',
  input: {schema: GetDailyFortuneInputSchema},
  output: {schema: GetDailyFortuneOutputSchema},
  prompt: `당신은 한국 전통 사주, 오행, 팔괘, 성명학에 능통한 운세 전문가입니다. 다음 정보를 바탕으로 {{{name}}}님의 오늘의 운세를 상세하고 현실적으로 분석해주세요. 단순히 좋은 말만 하는 것이 아니라, 사주와 운의 흐름에 따라 발생할 수 있는 잠재적인 어려움이나 주의해야 할 점도 명확히 언급하여 균형 잡힌 조언을 제공해야 합니다. 사용자의 성별을 고려하여 더욱 개인화된 조언을 제공해주세요. 모든 답변은 한국어로, 친절하면서도 전문적인 식견을 담아 작성해주세요.

사용자 정보:
- 이름: {{{name}}}
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}
- 성별: {{{gender}}}

오늘의 운세 항목 (각 항목은 긍정적인 부분과 함께 현실적인 조언, 주의사항을 포함해야 합니다):
1.  **총운**: 오늘 하루 전반적인 흐름, 주요 기회, 그리고 특별히 조심해야 할 점이나 맞닥뜨릴 수 있는 도전 과제를 구체적으로 설명해주세요.
2.  **애정운**: 연애 중이거나 기혼인 경우, 싱글인 경우 각각에 맞춰 현실적인 관계 조언과 함께 발생 가능한 갈등 요인이나 주의점을 알려주세요.
3.  **건강운**: 특별히 신경 써야 할 신체 부위나 건강 문제, 그리고 건강 증진을 위한 실질적인 팁과 함께 건강상 주의해야 할 부분을 언급해주세요.
4.  **직업운/학업운**: 업무나 학업에서 성과를 내기 위한 조언, 예상되는 장애물, 그리고 주의해야 할 점을 명확히 제시해주세요.
5.  **대인관계운**: 가족, 친구, 동료와의 관계에서 도움이 될 만한 조언과 함께 관계에서 발생할 수 있는 마찰이나 오해를 피하기 위한 방법을 알려주세요.
6.  **행운의 숫자**: 1부터 45 사이의 오늘의 행운의 숫자 3개를 추천해주세요.
7.  **사주 정보**: 생년월일을 바탕으로 태어난 해의 60갑자 간지(예: 갑자년), 띠 색깔(예: 청색), 그리고 띠 동물(예: 쥐띠)을 정확히 계산하여 알려주세요. 양력/음력 구분을 명확히 인지하여 계산해야 합니다.

각 운세 항목에 대해 구체적이고 균형 잡힌 설명을 제공하여, 사용자가 오늘 하루를 더 잘 준비하고 현명하게 대처할 수 있도록 도와주세요.
`,
});

const getDailyFortuneFlow = ai.defineFlow(
  {
    name: 'getDailyFortuneFlow',
    inputSchema: GetDailyFortuneInputSchema,
    outputSchema: GetDailyFortuneOutputSchema,
  },
  async input => {
    const {output} = await dailyFortunePrompt(input);
    return output!;
  }
);

