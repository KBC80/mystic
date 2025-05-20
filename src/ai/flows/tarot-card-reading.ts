'use server';

/**
 * @fileOverview 타로 카드 리딩 AI 에이전트입니다.
 *
 * - tarotCardReading - 타로 카드 리딩 과정을 처리하는 함수입니다.
 * - TarotCardReadingInput - tarotCardReading 함수의 입력 타입입니다.
 * - TarotCardReadingOutput - tarotCardReading 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TarotCardReadingInputSchema = z.object({
  question: z.string().describe('사용자가 묻는 질문입니다.'),
  card1: z.string().describe('사용자가 선택한 첫 번째 타로 카드입니다.'),
  card2: z.string().describe('사용자가 선택한 두 번째 타로 카드입니다.'),
  card3: z.string().describe('사용자가 선택한 세 번째 타로 카드입니다.'),
});
export type TarotCardReadingInput = z.infer<typeof TarotCardReadingInputSchema>;

const TarotCardReadingOutputSchema = z.object({
  card1Interpretation: z
    .string()
    .describe('첫 번째 타로 카드에 대한 상세한 해석입니다.'),
  card2Interpretation: z
    .string()
    .describe('두 번째 타로 카드에 대한 상세한 해석입니다.'),
  card3Interpretation: z
    .string()
    .describe('세 번째 타로 카드에 대한 상세한 해석입니다.'),
  overallAdvice: z.string().describe('카드 리딩을 바탕으로 한 전반적인 조언입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('1에서 45 사이의 행운의 숫자 세 개입니다.'),
});
export type TarotCardReadingOutput = z.infer<typeof TarotCardReadingOutputSchema>;

export async function tarotCardReading(input: TarotCardReadingInput): Promise<TarotCardReadingOutput> {
  return tarotCardReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tarotCardReadingPrompt',
  input: {schema: TarotCardReadingInputSchema},
  output: {schema: TarotCardReadingOutputSchema},
  prompt: `당신은 수십 년간 명성을 쌓아온, 예리한 통찰력과 깊은 지혜를 지닌 여성 정통 타로 마스터입니다. 당신의 해석은 놀랍도록 정확하며, 많은 이들에게 삶의 중요한 길잡이가 되어 왔습니다. 모든 답변은 한국어로, 마치 사용자와 마주 앉아 대화하듯 따뜻하고 공감하는 어조로 전달해주세요.

사용자가 다음 질문을 했습니다: "{{{question}}}"
사용자가 선택한 카드는 다음과 같습니다: {{{card1}}}, {{{card2}}}, {{{card3}}}.

각 카드를 사용자의 질문과 현재 상황에 비추어 매우 상세하고 깊이 있게 해석해주세요. 각 카드가 지닌 다층적인 의미와 상징, 다른 카드와의 관계성, 그리고 사용자에게 주는 구체적인 메시지를 명확하게 풀어내야 합니다. 단순한 카드 의미 나열이 아닌, 통찰력 있는 분석을 제공해주세요.

선택된 3장의 각 카드에 대한 상세한 해석을 반드시 포함해주세요:
카드 1 ({{{card1}}}): [여기에 {{{card1}}}에 대한 구체적이고 심층적인 해석. 사용자의 질문과 연결하여 설명합니다.]
카드 2 ({{{card2}}}): [여기에 {{{card2}}}에 대한 구체적이고 심층적인 해석. 사용자의 질문과 연결하여 설명합니다.]
카드 3 ({{{card3}}}): [여기에 {{{card3}}}에 대한 구체적이고 심층적인 해석. 사용자의 질문과 연결하여 설명합니다.]

세 카드의 조합을 통해 드러나는 전반적인 흐름과 메시지를 종합적으로 분석하고, 이를 바탕으로 사용자에게 구체적이고 실용적인 조언을 제공해주세요. 마치 오랜 경험에서 우러나오는 따뜻하면서도 현실적인 조언처럼, 사용자가 앞으로 나아갈 길을 밝혀주는 지침을 내려주세요. 사용자의 현재 상황에 대한 심층적인 분석과 함께, 가능한 어려움과 그것을 극복할 방법에 대해서도 언급해주세요.

마지막으로, 이 타로 리딩을 바탕으로 사용자에게 특별한 행운을 가져다 줄 1부터 45 사이의 숫자 3개를 추천해주세요.

당신의 지혜와 직관으로 사용자의 길을 밝혀주세요. 카드의 목소리에 귀 기울여 명확성과 깊은 통찰을 전달하는 데 집중해주세요.
`,
});

const tarotCardReadingFlow = ai.defineFlow(
  {
    name: 'tarotCardReadingFlow',
    inputSchema: TarotCardReadingInputSchema,
    outputSchema: TarotCardReadingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

