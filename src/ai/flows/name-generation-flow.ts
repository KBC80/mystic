'use server';
/**
 * @fileOverview 부모의 정보와 사주를 기반으로 아이에게 길운을 가져다 줄 이름을 생성합니다.
 *
 * - generateAuspiciousName - 길운 작명 과정을 처리하는 함수입니다.
 * - GenerateAuspiciousNameInput - generateAuspiciousName 함수의 입력 타입입니다.
 * - GenerateAuspiciousNameOutput - generateAuspiciousName 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import namingRulesData from '@/lib/naming_rules.json';

const GenerateAuspiciousNameInputSchema = z.object({
  fatherName: z.string().describe('아버지의 성함입니다.'),
  fatherBirthDate: z.string().describe('아버지의 생년월일입니다 (YYYY-MM-DD 형식).'),
  fatherCalendarType: z.enum(['solar', 'lunar']).describe('아버지의 달력 유형입니다 (solar: 양력, lunar: 음력).'),
  fatherBirthTime: z.string().describe('아버지의 태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  motherName: z.string().describe('어머니의 성함입니다.'),
  motherBirthDate: z.string().describe('어머니의 생년월일입니다 (YYYY-MM-DD 형식).'),
  motherCalendarType: z.enum(['solar', 'lunar']).describe('어머니의 달력 유형입니다 (solar: 양력, lunar: 음력).'),
  motherBirthTime: z.string().describe('어머니의 태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  childLastName: z.string().describe('자녀의 성입니다.'),
  childGender: z.enum(['male', 'female']).describe('자녀의 성별입니다 (male: 남자, female: 여자).'),
});
export type GenerateAuspiciousNameInput = z.infer<typeof GenerateAuspiciousNameInputSchema>;

const GeneratedNameSchema = z.object({
  name: z.string().describe('추천된 한글 전체 이름입니다 (성 포함).'),
  hanja: z.string().optional().describe('추천된 이름의 한자 표기입니다 (이름 부분만 해당, 선택 사항).'),
  meaning: z.string().describe('이름의 의미와 풀이, 성씨와의 조화, 세련된 느낌에 대한 설명입니다.'),
  yinYangFiveElements: z.string().describe('이름에 담긴 음양오행 분석 결과 및 사주와의 조화입니다.'),
});

const GenerateAuspiciousNameOutputSchema = z.object({
  recommendedNames: z.array(GeneratedNameSchema).length(5).describe('추천된 5개의 길운 이름 목록입니다.'),
});
export type GenerateAuspiciousNameOutput = z.infer<typeof GenerateAuspiciousNameOutputSchema>;

export async function generateAuspiciousName(input: GenerateAuspiciousNameInput): Promise<GenerateAuspiciousNameOutput> {
  return generateAuspiciousNameFlow(input);
}

const formattedNamingRules = namingRulesData.map(rule => `${rule.번호}. ${rule.제목}: ${rule.설명}`).join('\n');

const auspiciousNamePrompt = ai.definePrompt({
  name: 'auspiciousNamePrompt',
  input: {schema: GenerateAuspiciousNameInputSchema},
  output: {schema: GenerateAuspiciousNameOutputSchema},
  prompt: `당신은 한국 전통 성명학 및 사주명리학 전문가입니다. 다음 부모님과 자녀의 정보를 바탕으로, 부모님의 사주를 고려하여 {{{childGender}}} 아이에게 길운을 가져다 줄 아름답고 의미 있는 이름 5개를 추천해주세요.

**중요 지침:**
1.  추천하는 이름은 반드시 자녀의 성씨 **'{{{childLastName}}}'**를 포함한 **전체 이름**이어야 합니다. (예: 성씨가 '김'이고 추천 이름이 '서윤'이면, '김서윤'으로 제공)
2.  이름은 **'{{{childLastName}}}'** 성씨와 자연스럽게 어울리며, **세련되고 현대적인 느낌**을 주어야 합니다.
3.  단순히 예쁜 이름이 아니라, **깊고 좋은 의미**를 담고 있어야 합니다.
4.  각 이름에는 가능한 경우 **한자 표기 (이름 부분)**, 이름의 **의미와 풀이 (성씨와의 조화 및 세련된 느낌 포함)**, 그리고 **음양오행 및 사주와의 조화**에 대한 분석을 포함해야 합니다.
5.  모든 답변은 **한국어**로 해주세요.

**추가 작명 원칙 (반드시 고려해주세요):**
${formattedNamingRules}

부모 정보:
- 아버지 성함: {{{fatherName}}}
- 아버지 생년월일: {{{fatherBirthDate}}} ({{{fatherCalendarType}}})
- 아버지 태어난 시간: {{{fatherBirthTime}}}
- 어머니 성함: {{{motherName}}}
- 어머니 생년월일: {{{motherBirthDate}}} ({{{motherCalendarType}}})
- 어머니 태어난 시간: {{{motherBirthTime}}}

자녀 정보:
- 성: {{{childLastName}}}
- 성별: {{{childGender}}} (male: 남자, female: 여자)

5개의 독창적이고 현대적이면서도 전통적인 가치를 담은, **'{{{childLastName}}}'** 성씨와 조화로운 이름을 제시해주세요.
각 추천 이름은 다음 정보를 포함해야 합니다:
-   **전체 이름 (한글)**: (예: 김서아)
-   **한자 (선택 사항, 이름 부분만)**: (예: 書雅)
-   **의미**: 이름의 뜻, 좋은 점, 그리고 {{{childLastName}}} 성씨와의 조화 및 세련된 느낌에 대한 설명.
-   **음양오행 및 사주 조화**: 이름이 부모 및 자녀의 사주와 어떻게 조화를 이루는지, 어떤 기운을 보강하는지 설명.
`,
});

const generateAuspiciousNameFlow = ai.defineFlow(
  {
    name: 'generateAuspiciousNameFlow',
    inputSchema: GenerateAuspiciousNameInputSchema,
    outputSchema: GenerateAuspiciousNameOutputSchema,
  },
  async input => {
    const {output} = await auspiciousNamePrompt(input);
    return output!;
  }
);

