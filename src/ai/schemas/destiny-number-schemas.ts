
/**
 * @fileOverview Zod schemas and TypeScript types for the Destiny Number analysis flow.
 */
import { z } from 'genkit';

export const DestinyNumberInputSchema = z.object({
  name: z.string().describe('운명수 분석을 위한 한글 이름입니다. (예: "홍길동")'),
  birthDate: z.string().min(1, "생년월일을 입력해주세요.").describe("운명수 해석에 참고할 생년월일입니다. (YYYY-MM-DD 형식)"),
  destinyNumber: z.number().int().min(1).max(33).describe('TypeScript로 미리 계산된 운명수입니다. (1-9 또는 마스터 넘버 11, 22, 33)'),
});
export type DestinyNumberInput = z.infer<typeof DestinyNumberInputSchema>;

export const DestinyNumberOutputSchema = z.object({
  destinyNumber: z.number().int().min(1).max(33).describe('분석된 운명수입니다. 입력값과 동일해야 합니다.'),
  summary: z.string().describe('운명수 {{{destinyNumber}}}에 대한 핵심 의미와 전반적인 성향 요약입니다.'),
  personalityTraits: z.string().describe('운명수 {{{destinyNumber}}}를 가진 사람의 주요 성격 특성, 강점과 약점입니다.'),
  talentsAndCareer: z.string().describe('운명수 {{{destinyNumber}}}에 따른 타고난 재능과 어울리는 직업 분야 또는 역할에 대한 제안입니다.'),
  relationships: z.string().describe('운명수 {{{destinyNumber}}}를 가진 사람의 대인 관계 및 연애 스타일 특징입니다.'),
  lifePurposeAndAdvice: z.string().describe('운명수 {{{destinyNumber}}}의 삶의 목적 또는 주요 과제, 그리고 더 나은 삶을 위한 조언입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('이 운명수 {{{destinyNumber}}} 분석과 입력된 이름 "{{{name}}}" 및 생년월일 "{{{birthDate}}}"의 기운을 종합적으로 고려하여 1부터 45 사이의 서로 다른 행운의 숫자 세 개를 다양하게, 특정 숫자에 편향되지 않도록 추천합니다.'),
});
export type DestinyNumberOutput = z.infer<typeof DestinyNumberOutputSchema>;

