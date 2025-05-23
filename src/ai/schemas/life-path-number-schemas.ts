
/**
 * @fileOverview Zod schemas and TypeScript types for the Life Path Number analysis flow.
 */
import { z } from 'genkit';

export const LifePathNumberInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
});
export type LifePathNumberInput = z.infer<typeof LifePathNumberInputSchema>;

export const LifePathNumberOutputSchema = z.object({
  lifePathNumber: z.number().int().min(1).max(33).describe('계산된 인생여정수 (1-9 또는 마스터 넘버 11, 22, 33).'),
  numberMeaning: z.string().describe('해당 인생여정수의 핵심적인 의미와 상징입니다.'),
  personalityTraits: z.string().describe('해당 인생여정수를 가진 사람의 주요 성격 특성, 강점과 약점입니다.'),
  lifePurpose: z.string().describe('해당 인생여정수의 삶의 목적 또는 주요 과제입니다.'),
  careerSuggestions: z.string().describe('해당 인생여정수에 어울리는 직업 또는 경력 분야에 대한 제안입니다.'),
  relationshipCompatibility: z.string().describe('다른 숫자들과의 관계에서 나타날 수 있는 궁합 또는 상호작용 방식에 대한 간략한 설명입니다.'),
  advice: z.string().describe('해당 인생여정수를 가진 사람을 위한 삶의 조언입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('이 인생여정수 분석을 바탕으로 한 1에서 45 사이의 서로 다른 행운의 숫자 세 개를 다양하게, 특정 숫자에 편향되지 않도록 추천합니다.'),
});
export type LifePathNumberOutput = z.infer<typeof LifePathNumberOutputSchema>;
