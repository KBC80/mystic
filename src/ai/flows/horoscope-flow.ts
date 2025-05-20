
'use server';
/**
 * @fileOverview 사용자의 생년월일, 달력 유형, 성별을 바탕으로 별자리를 판단하고 주간 운세를 제공합니다.
 *
 * - getWeeklyHoroscope - 주간 별자리 운세 제공 과정을 처리하는 함수입니다.
 * - GetWeeklyHoroscopeInput - getWeeklyHoroscope 함수의 입력 타입입니다.
 * - GetWeeklyHoroscopeOutput - getWeeklyHoroscope 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeeklyHoroscopeInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  name: z.string().describe('운세를 볼 사람의 이름입니다.'),
  gender: z.enum(['male', 'female']).describe('운세를 볼 사람의 성별입니다 (male: 남자, female: 여자).'),
});
export type GetWeeklyHoroscopeInput = z.infer<typeof GetWeeklyHoroscopeInputSchema>;

const GetWeeklyHoroscopeOutputSchema = z.object({
  zodiacSign: z.string().describe('판단된 사용자의 별자리입니다 (예: 양자리, 황소자리 등).'),
  weeklyOverall: z.string().describe('이번 주 해당 별자리의 종합적인 운세입니다. 긍정적인 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  weeklyLove: z.string().describe('이번 주 애정운입니다. 긍정적 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  weeklyCareer: z.string().describe('이번 주 직업운 또는 학업운입니다. 긍정적 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  weeklyHealth: z.string().describe('이번 주 건강운입니다. 긍정적 측면과 함께 주의할 점이나 잠재적 어려움도 포함해야 합니다.'),
  luckyItem: z.string().describe('이번 주 행운을 가져다 줄 아이템입니다.'),
  luckyDayOfWeek: z.string().describe('이번 주 행운의 요일입니다 (예: 월요일, 화요일 등).'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('1에서 45 사이의 이번 주 행운의 숫자 세 개입니다.'),
});
export type GetWeeklyHoroscopeOutput = z.infer<typeof GetWeeklyHoroscopeOutputSchema>;

export async function getWeeklyHoroscope(input: GetWeeklyHoroscopeInput): Promise<GetWeeklyHoroscopeOutput> {
  return getWeeklyHoroscopeFlow(input);
}

const weeklyHoroscopePrompt = ai.definePrompt({
  name: 'weeklyHoroscopePrompt',
  input: {schema: GetWeeklyHoroscopeInputSchema},
  output: {schema: GetWeeklyHoroscopeOutputSchema},
  prompt: `당신은 수십 년 경력의 저명한 서양 점성술사입니다. 사용자의 생년월일, 달력 유형(양력/음력), 성별 정보를 바탕으로 해당 사용자의 정확한 서양 별자리를 판단해주세요. 만약 음력으로 입력되었다면, 서양 별자리 판단 시 양력으로 변환하여 고려해주세요. 그 후, {{{name}}}님의 이번 주 (오늘부터 7일간) 별자리 운세를 상세하고 현실적인 어조로 제공해주세요. 단순히 좋은 말만 하는 것이 아니라, 별의 흐름에 따라 발생할 수 있는 잠재적인 어려움이나 주의해야 할 점도 명확히 언급하여 균형 잡힌 조언을 제공해야 합니다. 사용자의 성별을 고려하여 더욱 개인화된 조언을 제공해주세요. 특히 애정운, 직업운, 건강운 등에서 성별에 따른 미묘한 차이를 반영할 수 있다면 좋습니다. 모든 답변은 한국어로 작성합니다.

사용자 정보:
- 이름: {{{name}}}
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 성별: {{{gender}}}

별자리 운세 항목 (각 항목은 긍정적인 부분과 함께 현실적인 조언, 주의사항을 포함해야 합니다):
1.  **별자리 (zodiacSign)**: 사용자의 생년월일을 바탕으로 정확한 한국어 별자리 이름을 판단하여 명시해주세요. (예: 양자리, 황소자리, 쌍둥이자리, 게자리, 사자자리, 처녀자리, 천칭자리, 전갈자리, 사수자리, 염소자리, 물병자리, 물고기자리)
2.  **주간 종합운 (weeklyOverall)**: 이번 주 전반적인 흐름, 주요 기회, 그리고 주의해야 할 점이나 맞닥뜨릴 수 있는 도전 과제를 포함하여 설명해주세요.
3.  **주간 애정운 (weeklyLove)**: 연애 중인 사람과 싱글인 사람 모두에게 도움이 될 수 있는 현실적인 관계 조언과 함께 발생 가능한 갈등 요인이나 주의점을 알려주세요.
4.  **주간 직업운/학업운 (weeklyCareer)**: 업무나 학업 성취를 위한 팁이나 긍정적인 전망과 함께, 예상되는 장애물이나 주의해야 할 점을 명확히 제시해주세요.
5.  **주간 건강운 (weeklyHealth)**: 이번 주 건강 관리에 도움이 될 만한 조언과 함께 건강상 주의해야 할 부분을 언급해주세요.
6.  **행운 아이템 (luckyItem)**: 이번 주 행운을 가져다 줄 수 있는 특정 아이템을 추천해주세요.
7.  **행운의 요일 (luckyDayOfWeek)**: 이번 주 특별히 운이 좋은 요일을 알려주세요.
8.  **행운의 숫자 (luckyNumbers)**: 1부터 45 사이의 이번 주 행운의 숫자 3개를 추천해주세요.

각 항목에 대해 구체적이고 균형 잡힌 메시지를 전달하여 사용자에게 영감을 주고 현실적인 대비를 할 수 있도록 도와주세요.
`,
});

const getWeeklyHoroscopeFlow = ai.defineFlow(
  {
    name: 'getWeeklyHoroscopeFlow',
    inputSchema: GetWeeklyHoroscopeInputSchema,
    outputSchema: GetWeeklyHoroscopeOutputSchema,
  },
  async input => {
    const {output} = await weeklyHoroscopePrompt(input);
    return output!;
  }
);
