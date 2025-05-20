'use server';
/**
 * @fileOverview 사용자가 뽑은 룬 문자를 기반으로 점을 보고 해석을 제공합니다.
 *
 * - interpretRunes - 룬 문자 점 해석 과정을 처리하는 함수입니다.
 * - RuneReadingInput - interpretRunes 함수의 입력 타입입니다.
 * - RuneReadingOutput - interpretRunes 함수의 반환 타입입니다.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { elderFutharkRunes, type Rune } from '@/lib/runes'; // Rune 타입과 데이터 임포트

const DrawnRuneSchema = z.object({
  name: z.string().describe('뽑힌 룬의 영문 이름입니다. (예: Fehu, Uruz)'),
  isReversed: z.boolean().describe('룬이 역방향으로 뽑혔는지 여부입니다.'),
});

const RuneReadingInputSchema = z.object({
  question: z.string().optional().describe('사용자의 질문입니다. (선택 사항)'),
  drawnRunes: z.array(DrawnRuneSchema).min(1).max(5).describe('사용자가 뽑은 룬들의 목록입니다. (최소 1개, 최대 5개)'),
});
export type RuneReadingInput = z.infer<typeof RuneReadingInputSchema>;

const RuneInterpretationSchema = z.object({
  name: z.string().describe('해석된 룬의 영문 이름입니다.'),
  koreanName: z.string().describe('해석된 룬의 한글 이름입니다.'),
  symbol: z.string().describe('해석된 룬의 문자 기호입니다.'),
  isReversed: z.boolean().describe('룬이 역방향이었는지 여부입니다.'),
  interpretation: z.string().describe('해당 룬에 대한 개별적인 심층 해석입니다. 질문과 다른 룬과의 관계를 고려해야 합니다.'),
});

const RuneReadingOutputSchema = z.object({
  runeInterpretations: z.array(RuneInterpretationSchema).describe('각각의 뽑힌 룬에 대한 해석 목록입니다.'),
  overallInterpretation: z.string().describe('뽑힌 룬들의 조합과 사용자의 질문(있는 경우)을 고려한 종합적인 해석 및 조언입니다. 각 룬이 어떻게 상호작용하는지 설명해야 합니다.'),
  luckyNumbers: z.array(z.number().int().min(1).max(45)).length(3).describe('룬 리딩을 바탕으로 한 행운의 숫자 세 개입니다 (1-45 사이).'),
});
export type RuneReadingOutput = z.infer<typeof RuneReadingOutputSchema>;

export async function interpretRunes(input: RuneReadingInput): Promise<RuneReadingOutput> {
  // 입력된 룬 이름으로 실제 룬 데이터(한글 이름, 심볼 등)를 가져와 프롬프트에 전달
  const populatedRunes = input.drawnRunes.map(drawnRune => {
    const runeData = elderFutharkRunes.find(r => r.name === drawnRune.name);
    return {
      ...drawnRune,
      koreanName: runeData?.koreanName || drawnRune.name,
      symbol: runeData?.symbol || '',
      keywordsUpright: runeData?.keywordsUpright || '',
      keywordsReversed: runeData?.keywordsReversed || '',
    };
  });

  return runeReadingFlow({ ...input, populatedRunes });
}

const runeReadingPrompt = ai.definePrompt({
  name: 'runeReadingPrompt',
  input: { schema: RuneReadingInputSchema.extend({
    populatedRunes: z.array(DrawnRuneSchema.extend({
      koreanName: z.string(),
      symbol: z.string(),
      keywordsUpright: z.string(),
      keywordsReversed: z.string(),
    })),
  })},
  output: { schema: RuneReadingOutputSchema },
  prompt: `당신은 수십 년 경력의, 깊은 지혜와 통찰력을 지닌 룬 문자 점술의 대가입니다. 당신의 해석은 매우 정확하며 많은 사람들에게 영적인 길잡이가 되어 왔습니다. 모든 답변은 한국어로, 사용자에게 친절하고 공감하는 어조로 전달해주세요.

사용자의 질문(선택 사항): {{{question}}}

사용자가 뽑은 룬은 다음과 같습니다:
{{#each populatedRunes}}
- **{{koreanName}} ({{name}} {{symbol}})**: {{#if isReversed}}역방향 (키워드: {{keywordsReversed}}){{else}}정방향 (키워드: {{keywordsUpright}}){{/if}}
{{/each}}

각각의 뽑힌 룬에 대해 다음 정보를 포함하여 상세하고 심층적인 해석을 제공해주세요:
1.  **개별 룬 해석**: 각 룬(이름, 한글이름, 심볼, 정/역방향 여부 명시)이 사용자의 질문(있는 경우)과 현재 상황에 비추어 어떤 의미를 가지는지 설명합니다. 룬의 정방향 또는 역방향 키워드를 참고하되, 단순히 나열하는 것이 아니라 깊이 있는 통찰을 담아 해석해야 합니다.
2.  **종합 해석 및 조언**: 뽑힌 룬들의 조합이 전체적으로 어떤 메시지를 전달하는지, 각 룬이 서로 어떻게 영향을 미치는지, 그리고 사용자의 질문(있는 경우)에 대한 최종적인 답이나 조언은 무엇인지 설명합니다. 긍정적인 측면과 함께 주의해야 할 점이나 잠재적인 어려움도 균형 있게 언급해주세요.
3.  **행운의 숫자**: 이 룬 리딩을 바탕으로 사용자에게 특별한 행운을 가져다 줄 1부터 45 사이의 숫자 3개를 추천해주세요.

당신의 지혜와 직관으로 사용자의 길을 밝혀주세요. 룬의 목소리에 귀 기울여 명확성과 깊은 통찰을 전달하는 데 집중해주세요.
`,
});

const runeReadingFlow = ai.defineFlow(
  {
    name: 'runeReadingFlow',
    inputSchema: RuneReadingInputSchema.extend({
        populatedRunes: z.array(DrawnRuneSchema.extend({
            koreanName: z.string(),
            symbol: z.string(),
            keywordsUpright: z.string(),
            keywordsReversed: z.string(),
        })),
    }),
    outputSchema: RuneReadingOutputSchema,
  },
  async (input) => {
    const { output } = await runeReadingPrompt(input);
    if (!output) {
      throw new Error("룬 해석 결과를 생성하지 못했습니다.");
    }
    // Populate koreanName and symbol in the output based on the name from LLM
    const populatedInterpretations = output.runeInterpretations.map(interp => {
        const runeData = elderFutharkRunes.find(r => r.name === interp.name);
        return {
            ...interp,
            koreanName: runeData?.koreanName || interp.name,
            symbol: runeData?.symbol || '',
        };
    });

    return { ...output, runeInterpretations: populatedInterpretations };
  }
);
