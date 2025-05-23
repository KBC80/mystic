
/**
 * @fileOverview Zod schemas and TypeScript types for the Personality Number (성격수) analysis flow.
 */
import { z } from 'genkit';

export const PersonalityNumberInputSchema = z.object({
  name: z.string().describe('성격수 분석을 위한 한글 이름입니다. (예: "홍길동")'),
  personalityNumber: z.number().int().min(1).max(33).describe('TypeScript로 미리 계산된 성격수입니다. (1-9 또는 마스터 넘버 11, 22, 33)'),
});
export type PersonalityNumberInput = z.infer<typeof PersonalityNumberInputSchema>;

export const PersonalityNumberOutputSchema = z.object({
  personalityNumber: z.number().int().min(1).max(33).describe('분석된 성격수입니다. 입력값과 동일해야 합니다.'),
  summary: z.string().describe('성격수 {{{personalityNumber}}}에 대한 핵심 의미와 타인에게 비치는 모습 요약입니다.'),
  externalTraits: z.string().describe('성격수 {{{personalityNumber}}}를 가진 사람이 외부 세계에 보여주는 주요 성격 특성, 강점과 약점입니다.'),
  firstImpression: z.string().describe('성격수 {{{personalityNumber}}}를 가진 사람이 다른 사람들에게 주는 일반적인 첫인상입니다.'),
  socialStyle: z.string().describe('성격수 {{{personalityNumber}}}를 가진 사람의 사회적 상호작용 스타일 및 대인관계 방식입니다.'),
  howToDevelop: z.string().describe('이 성격수의 긍정적인 면을 강화하고, 약점을 보완하여 더 나은 사회적 관계를 맺기 위한 조언입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('이 성격수 {{{personalityNumber}}} 분석과 이름 "{{{name}}}"의 기운을 종합적으로 고려하여 1부터 45 사이의 서로 다른 행운의 숫자 3개를 다양하게, 특정 숫자에 편향되지 않도록 추천합니다.'),
});
export type PersonalityNumberOutput = z.infer<typeof PersonalityNumberOutputSchema>;
