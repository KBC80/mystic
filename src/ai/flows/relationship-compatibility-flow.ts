'use server';
/**
 * @fileOverview 두 사람의 궁합을 사주, 오행, 이름 등을 기반으로 분석합니다.
 *
 * - getRelationshipCompatibility - 궁합 분석 과정을 처리하는 함수입니다.
 * - RelationshipCompatibilityInput - getRelationshipCompatibility 함수의 입력 타입입니다.
 * - RelationshipCompatibilityOutput - getRelationshipCompatibility 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonInputSchema = z.object({
  name: z.string().describe('이름 (한글, 한자 포함 가능. 예: 홍길동 또는 홍길동(洪吉童))'),
  birthDate: z.string().describe('생년월일 (YYYY-MM-DD 형식)'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형 (solar: 양력, lunar: 음력)'),
  birthTime: z.string().describe('태어난 시간 (예: 자시, 축시 등 12지신 시간 또는 "모름")'),
  gender: z.enum(['male', 'female']).describe('성별 (male: 남자, female: 여자)'),
});

const RelationshipCompatibilityInputSchema = z.object({
  person1: PersonInputSchema.describe('첫 번째 사람의 정보'),
  person2: PersonInputSchema.describe('두 번째 사람의 정보'),
});
export type RelationshipCompatibilityInput = z.infer<typeof RelationshipCompatibilityInputSchema>;

const OhaengAnalysisSchema = z.object({
  person1Ohaeng: z.string().describe("첫 번째 사람의 사주 오행 구성 요약 (예: 목2, 화1, 토1, 금1, 수0)"),
  person2Ohaeng: z.string().describe("두 번째 사람의 사주 오행 구성 요약"),
  compatibilityDescription: z.string().describe("두 사람의 오행 상생 및 상극 관계에 대한 상세 분석 및 조화도 평가"),
  // Ohaeng 그래프를 위한 데이터는 LLM이 직접 생성하기 어려우므로, 텍스트 설명을 기반으로 클라이언트에서 간략히 시각화하거나,
  // 혹은 이 필드를 빼고 설명에 집중하도록 합니다. 여기서는 설명을 강화하는 방향으로.
});

const SibsinYukchinAnalysisSchema = z.object({
  description: z.string().describe("두 사람의 주요 십신 및 육친 관계가 궁합에 미치는 영향에 대한 상세 분석 (긍정적/부정적 측면 포함)"),
  // 표 데이터는 LLM이 일관되게 생성하기 어려울 수 있으므로, 상세 설명에 집중.
});

const RelationshipCompatibilityOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('궁합 총점 (100점 만점)'),
  overallGrade: z.enum(['최상', '상', '중상', '중', '중하', '하', '최하']).describe('궁합 등급'),
  sajuCompatibility: z.object({
    analysisText: z.string().describe("두 사람의 사주팔자를 종합적으로 비교 분석한 내용 (일간의 관계, 지지의 합충형파해, 주요 신살 등 포함)"),
  }).describe('1. 사주팔자 조화도 분석'),
  ohaengAnalysis: OhaengAnalysisSchema.describe('2. 오행 상생·상극 분석'),
  sibsinYukchinAnalysis: SibsinYukchinAnalysisSchema.describe('3. 십신 및 육친 관계 분석'),
  nameHanjaHarmony: z.object({
    person1NameAnalysis: z.string().describe("첫 번째 사람 이름의 한자(제공된 경우) 음과 의미, 사주와의 조화 분석 요약"),
    person2NameAnalysis: z.string().describe("두 번째 사람 이름의 한자(제공된 경우) 음과 의미, 사주와의 조화 분석 요약"),
    compatibilityDescription: z.string().describe("두 이름 간의 한자(음, 의미) 조화도 평가 및 관계에 미치는 영향"),
  }).describe('4. 이름 한자 조화도 분석'),
  overallInterpretation: z.string().describe('궁합에 대한 최종 종합 해석'),
  strengths: z.string().describe('두 사람 관계의 주요 강점'),
  weaknesses: z.string().describe('두 사람 관계에서 주의해야 할 약점 또는 갈등 요소'),
  improvementAdvice: z.string().describe('관계를 더욱 발전시키거나 어려움을 극복하기 위한 실질적인 조언'),
  luckyNumbers: z.array(z.number().int().min(1).max(45)).length(3).describe('궁합을 좋게 하는 행운의 숫자 3개'),
});
export type RelationshipCompatibilityOutput = z.infer<typeof RelationshipCompatibilityOutputSchema>;

export async function getRelationshipCompatibility(input: RelationshipCompatibilityInput): Promise<RelationshipCompatibilityOutput> {
  return relationshipCompatibilityFlow(input);
}

const relationshipCompatibilityPrompt = ai.definePrompt({
  name: 'relationshipCompatibilityPrompt',
  input: {schema: RelationshipCompatibilityInputSchema},
  output: {schema: RelationshipCompatibilityOutputSchema},
  prompt: `당신은 수십 년 경력의 저명한 동양 철학 및 역학 전문가입니다. 두 사람의 상세 정보를 바탕으로 깊이 있는 궁합 분석을 제공해주세요. 모든 답변은 한국어로, 전문가적이고 통찰력 있는 어조로 작성하되, 사용자가 쉽게 이해할 수 있도록 명확하게 설명해야 합니다. 긍정적인 측면과 함께 현실적인 조언, 주의사항, 잠재적 어려움도 균형 있게 제시하여 두 사람의 관계 발전에 실질적인 도움을 주어야 합니다.

**궁합 분석 대상:**
1.  **첫 번째 사람 ({{{person1.gender}}}):**
    *   이름: {{{person1.name}}}
    *   생년월일: {{{person1.birthDate}}} ({{{person1.calendarType}}})
    *   태어난 시간: {{{person1.birthTime}}}
2.  **두 번째 사람 ({{{person2.gender}}}):**
    *   이름: {{{person2.name}}}
    *   생년월일: {{{person2.birthDate}}} ({{{person2.calendarType}}})
    *   태어난 시간: {{{person2.birthTime}}}

**궁합 풀이 규칙 및 결과 항목 (아래 모든 항목을 상세히 채워주세요):**

1.  **사주팔자 조화도 분석 (sajuCompatibility.analysisText):**
    *   각 개인의 사주팔자(년주, 월주, 일주, 시주)를 간략히 언급하고, 두 사람의 사주팔자를 종합적으로 비교 분석합니다.
    *   특히 일간(日干)의 관계(합, 충, 생, 극 등), 각 지지(地支) 간의 합(合), 충(冲), 형(刑), 파(破), 해(害) 관계, 주요 신살(神殺)의 상호작용 등을 고려하여 관계의 전반적인 조화와 특징, 잠재적인 어려움 등을 상세히 설명해주세요.

2.  **오행 상생·상극 분석 (ohaengAnalysis):**
    *   **person1Ohaeng**: 첫 번째 사람의 사주에 나타난 목, 화, 토, 금, 수 오행의 분포를 간략히 요약합니다. (예: "목 기운이 강하고 수 기운이 부족함")
    *   **person2Ohaeng**: 두 번째 사람의 사주에 나타난 오행 분포를 간략히 요약합니다.
    *   **compatibilityDescription**: 두 사람 사주의 오행이 서로 어떻게 상호작용하는지 (상생, 상극, 설기, 비화 등) 상세히 분석하고, 이것이 관계의 조화, 갈등, 보완 등에 어떤 영향을 미치는지 구체적으로 설명해주세요. 어떤 오행이 서로에게 도움이 되고, 어떤 오행이 충돌을 일으킬 수 있는지 명확히 밝혀주세요.

3.  **십신(十神) 및 육친(六親) 관계 분석 (sibsinYukchinAnalysis.description):**
    *   두 사람의 사주에서 나타나는 주요 십신(비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인) 관계를 분석하여, 이것이 성격, 가치관, 관계의 역할 분담, 상호작용 방식 등에 어떤 영향을 미치는지 설명해주세요.
    *   또한, 육친(부모, 형제, 배우자, 자식 등) 관계가 궁합에 미치는 영향(긍정적, 부정적 측면 모두)도 간략히 언급해주세요. 예를 들어, 배우자 궁의 조화, 또는 특정 육친으로 인한 관계의 어려움 등을 포함할 수 있습니다.

4.  **이름 한자 조화도 분석 (nameHanjaHarmony):** (이름에 한자가 제공된 경우에만 해당. 한자가 없으면 "한자 정보 없음"으로 기술)
    *   **person1NameAnalysis**: 첫 번째 사람 이름의 한자(제공된 경우)의 음(소리오행)과 의미(자원오행)를 간략히 분석하고, 이것이 개인의 성향이나 사주와 어떻게 조화를 이루는지 요약합니다.
    *   **person2NameAnalysis**: 두 번째 사람 이름의 한자(제공된 경우)를 위와 같이 분석합니다.
    *   **compatibilityDescription**: 두 사람 이름의 한자(음, 의미)가 서로에게 어떤 영향을 주는지, 관계의 조화에 긍정적인지 부정적인지, 또는 어떤 보완 작용을 하는지 평가하고 설명해주세요.

5.  **궁합 총점 (overallScore):** 위 모든 분석을 종합하여 0점에서 100점 사이의 점수로 평가해주세요.
6.  **궁합 등급 (overallGrade):** 총점에 따라 '최상', '상', '중상', '중', '중하', '하', '최하' 중 하나의 등급을 부여해주세요.

7.  **종합 해석 (overallInterpretation):** 모든 분석 결과를 바탕으로 두 사람의 궁합에 대한 최종적이고 종합적인 해석을 제공해주세요. 관계의 전반적인 전망, 주요 특징, 그리고 가장 중요한 조언을 포함해야 합니다.
8.  **관계의 강점 (strengths):** 이 관계가 가진 가장 큰 강점이나 긍정적인 측면들을 명확히 제시해주세요.
9.  **관계의 약점 (weaknesses):** 관계에서 나타날 수 있는 주요 약점, 잠재적인 갈등 요소, 또는 서로 주의해야 할 점들을 구체적으로 지적해주세요.
10. **관계 개선 조언 (improvementAdvice):** 약점을 보완하고 관계를 더욱 건강하고 행복하게 발전시키기 위한 실질적이고 구체적인 조언을 2~3가지 제공해주세요.
11. **행운의 숫자 (luckyNumbers):** 이 궁합 분석을 바탕으로 두 사람에게 행운을 가져다 줄 수 있는 1부터 45 사이의 숫자 3개를 추천해주세요.

각 항목에 대한 분석은 깊이 있고, 설득력 있으며, 실제적인 도움이 될 수 있도록 작성해주십시오. 두 사람의 행복한 관계를 위한 진심 어린 조언을 담아주세요.
`,
});

const relationshipCompatibilityFlow = ai.defineFlow(
  {
    name: 'relationshipCompatibilityFlow',
    inputSchema: RelationshipCompatibilityInputSchema,
    outputSchema: RelationshipCompatibilityOutputSchema,
  },
  async (input) => {
    const {output} = await relationshipCompatibilityPrompt(input);
    if (!output) {
      throw new Error("궁합 분석 결과를 생성하지 못했습니다.");
    }
    return output;
  }
);
