
/**
 * @fileOverview Zod schemas and TypeScript types for the Soul Urge Number (생명수) analysis flow.
 */
import { z } from 'genkit';

export const SoulUrgeNumberInputSchema = z.object({
  name: z.string().describe('생명수 분석을 위한 한글 이름입니다. (예: "홍길동")'),
  birthDate: z.string().min(1, "생년월일을 입력해주세요.").describe("생명수 해석에 참고할 생년월일입니다. (YYYY-MM-DD 형식)"),
  soulUrgeNumber: z.number().int().min(1).max(33).describe('TypeScript로 미리 계산된 생명수(영혼수)입니다. (1-9 또는 마스터 넘버 11, 22, 33)'),
});
export type SoulUrgeNumberInput = z.infer<typeof SoulUrgeNumberInputSchema>;

export const SoulUrgeNumberOutputSchema = z.object({
  soulUrgeNumber: z.number().int().min(1).max(33).describe('분석된 생명수입니다. 입력값과 동일해야 합니다.'),
  summary: z.string().describe('생명수 {{{soulUrgeNumber}}}에 대한 핵심 의미와 내면의 동기 요약입니다.'),
  innerDesires: z.string().describe('생명수 {{{soulUrgeNumber}}}를 가진 사람의 깊은 내면의 욕망과 갈망입니다.'),
  motivations: z.string().describe('생명수 {{{soulUrgeNumber}}}를 움직이게 하는 주요 동기 부여 요인들입니다.'),
  lifeChallenges: z.string().describe('생명수 {{{soulUrgeNumber}}}의 특성으로 인해 겪을 수 있는 삶의 도전 과제 또는 극복해야 할 점입니다.'),
  spiritualPath: z.string().describe('생명수 {{{soulUrgeNumber}}}가 암시하는 영적인 경로 또는 성향에 대한 조언입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('이 생명수 {{{soulUrgeNumber}}} 분석과, 이름 "{{{name}}}" 및 생년월일 "{{{birthDate}}}"의 기운을 종합적으로 고려하여 1부터 45 사이의 서로 다른 행운의 숫자 3개를 다양하게, 특정 숫자에 편향되지 않도록 추천합니다.'),
});
export type SoulUrgeNumberOutput = z.infer<typeof SoulUrgeNumberOutputSchema>;
