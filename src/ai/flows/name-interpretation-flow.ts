'use server';
/**
 * @fileOverview 사용자의 이름, 생년월일시, 성별을 바탕으로 동서양 철학, 사주명리학, 성명학(한자 수리획수법, 음양오행, 발음오행, 자원오행), 주역 등을 종합적으로 분석하고 인생 조언을 제공합니다.
 *
 * - interpretName - 이름 해석 과정을 처리하는 함수입니다.
 * - InterpretNameInput - interpretName 함수의 입력 타입입니다.
 * - InterpretNameOutput - interpretName 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import suri81Data from '@/lib/suri_81_data.json';
import ichingData from '@/lib/iching_64_data.json';


const InterpretNameInputSchema = z.object({
  name: z.string().describe('해석할 이름입니다. AI가 한글, 한자(제공된 경우)를 판단하여 분석합니다. 예: 홍길동 또는 홍길동(洪吉童)'),
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  birthTime: z.string().describe('태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  gender: z.enum(['male', 'female']).describe('성별입니다 (male: 남자, female: 여자).'),
});
export type InterpretNameInput = z.infer<typeof InterpretNameInputSchema>;

// --- Schema Definitions for Output ---

const SajuPillarSchema = z.object({
  cheonGan: z.string().describe('천간 (예: 甲, 乙)'),
  jiJi: z.string().describe('지지 (예: 子, 丑)'),
  eumYang: z.string().describe('음양 (예: 陽, 陰)'),
  ohaeng: z.string().describe('오행 (예: 木, 火)'),
});

const SajuOhaengDistributionSchema = z.object({
  wood: z.number().int().describe('목(木)의 개수 또는 상대적 강도 (0-5 범위)'),
  fire: z.number().int().describe('화(火)의 개수 또는 상대적 강도 (0-5 범위)'),
  earth: z.number().int().describe('토(土)의 개수 또는 상대적 강도 (0-5 범위)'),
  metal: z.number().int().describe('금(金)의 개수 또는 상대적 강도 (0-5 범위)'),
  water: z.number().int().describe('수(水)의 개수 또는 상대적 강도 (0-5 범위)'),
});

const SuriGyeokSchema = z.object({
  name: z.string().describe('격의 이름 및 해당 운세 시기 (예: 원격(元格) - 초년운 (0-20세)). 정확한 나이 구간을 명시해야 합니다.'),
  suriNumber: z.number().int().describe('수리 획수 (1-81).'),
  rating: z.string().describe('81수리 이론에 따른 해당 수리의 길흉 등급 (예: 대길, 길, 평, 흉, 대흉, 양운수, 상운수 등)'),
  interpretation: z.string().describe('해당 격에 대한 81수리 이론 기반의 상세 해설입니다. 해당 시기의 성격적 특징, 주요 운세 흐름(학업, 대인관계, 건강, 재물, 직업 등)에 대한 구체적이고 심층적인 내용을 포함해야 합니다. 단순한 키워드 나열이 아닌, 삶의 지침이 될 수 있는 통찰력 있는 설명을 제공해야 합니다.'),
});
export type SuriGyeokSchema = z.infer<typeof SuriGyeokSchema>;


const DetailedScoreSchema = z.object({
  score: z.number().min(0).max(100).describe('항목별 점수입니다. 0에서 100 사이의 값이어야 합니다.'),
  maxScore: z.number().int().gte(1).describe('해당 항목의 만점입니다. 1 이상의 정수여야 합니다.'),
});

const InterpretNameOutputSchema = z.object({
  // 1. 기본 정보 요약
  basicInfoSummary: z.object({
    koreanName: z.string().describe('이름 (한글)'),
    hanjaName: z.string().optional().describe('이름 (한자, 제공된 경우)'),
    gender: z.string().describe('성별 (남자/여자)'),
    solarBirthDate: z.string().describe('양력 생년월일 (YYYY-MM-DD)'),
    lunarBirthDate: z.string().describe('음력 생년월일 (YYYY-MM-DD) - 사주 분석의 기준'),
    birthTime: z.string().describe('출생 시간 (예: 자시 (23:00-00:59))'),
    sajuPillars: z.object({
      yearPillar: SajuPillarSchema.describe('년주'),
      monthPillar: SajuPillarSchema.describe('월주'),
      dayPillar: SajuPillarSchema.describe('일주'),
      timePillar: SajuPillarSchema.describe('시주 (모를 경우 불명확하게 표시)'),
    }).describe('사주팔자 구성'),
    gapjaYearName: z.string().describe('음력 기준 60갑자 간지 (예: 경신년)'),
    zodiacSign: z.string().describe('음력 기준 띠 (예: 원숭이띠)'),
    zodiacColor: z.string().optional().describe('띠 색깔 (예: 흰색, 선택 사항)'),
    sajuOhaengDistribution: SajuOhaengDistributionSchema.describe('사주 오행 분포 (각 오행별 상대적 강도 또는 개수)'),
    neededOhaengInSaju: z.string().describe('사주에서 보충이 필요한 오행'),
  }).describe('사용자 기본 정보 및 사주 요약'),

  // 2. 종합 점수 및 평가
  overallAssessment: z.object({
    totalScore: z.number().int().min(0).max(100).describe('종합 점수 (100점 만점)'),
    summaryEvaluation: z.enum(['매우 좋음', '좋음', '보통', '주의 필요', '나쁨']).describe('간단한 요약 평가 문구'),
    overallFortuneSummary: z.string().describe('간단한 인생 총운 요약입니다. 이름의 전반적인 기운과 삶에 미칠 수 있는 영향을 포함해야 합니다.'),
    detailedScores: z.object({
        eumYangOhaengScore: DetailedScoreSchema.describe('음양오행 조화 점수 (만점: 20점)'),
        suriGilhyungScore: DetailedScoreSchema.describe('수리길흉 점수 (만점: 35점)'),
        pronunciationOhaengScore: DetailedScoreSchema.describe('발음오행 점수 (만점: 25점)'),
        resourceOhaengScore: DetailedScoreSchema.describe('자원오행 보완 점수 (만점: 20점)'),
    }).describe('세부 항목별 점수'),
  }).describe('이름의 종합적인 평가'),
  
  // 3. 상세 분석 섹션
  detailedAnalysis: z.object({
    nameStructureAnalysis: z.object({
      hanjaStrokeCounts: z.array(z.object({ character: z.string(), strokes: z.number().int().optional(), yinYang: z.string().describe("해당 글자의 획수에 따른 음양 (예: 양(陽) 또는 음(陰))") })).optional().describe("이름의 각 글자(한글, 또는 제공된 경우 한자)에 대한 획수와 그에 따른 음양입니다. 한자가 명시된 경우(예: '洪'), 해당 한자의 **정자(正字) 획수**를 사용합니다. 한글만 있는 음절의 경우, 일반적인 한글 획수 계산법을 적용합니다. 각 항목은 { character: \"글자\", strokes: 획수, yinYang: \"음양표기 (예: 양(陽) 또는 음(陰))\" } 형태로 제공되어야 합니다."),
      yinYangHarmony: z.object({
        nameYinYangComposition: z.string().describe('이름의 음양 구성 (예: 陽(양)-陰(음)-陽(양), 각 글자 획수 기반). `hanjaStrokeCounts`의 `yinYang` 값과 반드시 일치해야 합니다.'),
        assessment: z.string().describe('음양 조화에 대한 평가 (예: 음양이 조화롭습니다.)'),
      }).describe('이름의 음양 조화 분석 (획수오행)'),
      pronunciationOhaeng: z.object({
        initialConsonants: z.array(z.object({ character: z.string(), consonant: z.string(), ohaeng: z.string()})).describe('이름 각 글자의 초성 및 오행'),
        harmonyRelationship: z.string().describe('초성 오행 간의 상생 또는 상극 관계 설명'),
        assessment: z.string().describe('발음오행에 대한 평가'),
      }).describe('발음 오행 분석'),
    }).describe('오행 및 음양 상세 분석 (이름 구조, 소리, 한자 뜻 포함)'),
    
    suriGilhyungAnalysis: z.object({
        introduction: z.string().describe("수리길흉은 원형이정(元亨利貞)의 수리 4격을 구성한 후, 한문획수, 한자획수로 풀이한 81수리 성명학입니다. 초년운, 청년운, 장년운, 말년운/인생 총운으로 길흉을 따져 이름이 갖는 운세를 설명합니다."),
        wonGyeok: SuriGyeokSchema.describe('원격(元格) - 초년운 (0-20세)에 대한 분석입니다. (예상 이름 필드 값: "원격(元格) - 초년운 (0-20세)")'),
        hyeongGyeok: SuriGyeokSchema.describe('형격(亨格) - 청년운 (21-40세)에 대한 분석입니다. (예상 이름 필드 값: "형격(亨格) - 청년운 (21-40세)")'),
        iGyeok: SuriGyeokSchema.describe('이격(利格) - 장년운 (41-60세) 대한 분석입니다. (예상 이름 필드 값: "이격(利格) - 장년운 (41-60세)")'),
        jeongGyeok: SuriGyeokSchema.describe('정격(貞格) - 말년운/총운 (60세 이후)에 대한 분석입니다. (예상 이름 필드 값: "정격(貞格) - 말년운/총운 (60세 이후)")')
    }).describe('수리길흉 분석 (원형이정 4격 기반)'),

    resourceOhaengAnalysis: z.object({
      sajuDeficientOhaeng: z.string().describe('사주에서 가장 보충이 필요한 오행 (용신 또는 희신)'),
      nameHanjaOhaeng: z.string().describe('이름 한자의 자원오행(한자 뜻 오행) 구성 요약'),
      complementAssessment: z.string().describe('이름의 자원오행이 사주의 부족한 오행을 얼마나 잘 보완하는지에 대한 심층 평가'),
    }).describe('자원오행 분석 (사주 보완 여부)'),

    iChingHexagram: z.object({
      hexagramName: z.string().describe('이름의 수리 또는 특성을 바탕으로 도출된 주역 64괘 중 관련성이 높은 괘의 이름 (예: 건위천, 곤위지 등)'),
      hexagramImage: z.string().optional().describe('괘의 이미지 (예: ䷀ (중천건), ䷁ (중지곤) - 텍스트 또는 이미지 URL)'),
      interpretation: z.string().describe('해당 괘의 의미와 이름의 운명에 대한 간략하고 이해하기 쉬운 해석입니다 (중학생 수준).'),
    }).describe('주역 괘 분석'),
  }).describe('상세 이름 분석 결과'),

  // 주의사항
  cautionsAndRecommendations: z.object({
    inauspiciousHanja: z.array(z.string()).optional().describe('이름에 사용된 불용한자 목록 및 그 이유 (있는 경우)'),
    auspiciousHanja: z.array(z.string()).optional().describe('이름에 사용된 길한 한자 목록 및 그 이유 (있는 경우)'),
    generalAdvice: z.string().optional().describe('이름과 관련한 전반적인 조언, 추가적인 주의사항, 운세 개선을 위한 구체적인 해결방안이나 지니면 좋은 물건 등의 조언. 단순한 격려가 아닌, 실질적이고 구체적인 내용을 담아야 합니다.'),
    luckyNumbers: z.array(z.number().int().min(1).max(45)).length(3).optional().describe('이름 풀이를 바탕으로 한 행운의 숫자 세 개 (1-45 사이).'),
  }).describe('고려사항 및 조언'),
});

export type InterpretNameOutput = z.infer<typeof InterpretNameOutputSchema>;

const simplifyHexagramPrompt = ai.definePrompt({
  name: 'simplifyHexagramPrompt',
  input: { schema: z.object({
    hexagramName: z.string(),
    originalInterpretation: z.string(),
    userName: z.string(),
  })},
  output: { schema: z.object({
    simplifiedInterpretation: z.string().describe("중학생도 이해하기 쉬운 괘의 해설입니다.")
  })},
  prompt: `당신은 주역(周易)에 정통한 학자이며, 복잡한 주역의 지혜를 일반인도 이해하기 쉽게 설명하는 데 능숙합니다. 다음은 {{{userName}}}님의 이름과 관련된 주역 {{{hexagramName}}} 괘의 원본 해설입니다:

--- 원본 해설 ---
{{{originalInterpretation}}}
--- 원본 해설 끝 ---

이 해설의 핵심적인 의미를 유지하면서, 마치 옆에서 친절하게 설명해 주듯이, 평이하고 명료한 언어로 풀어 설명해주십시오. 중학생도 이해할 수 있을 정도의 쉬운 비유나 일상적인 예를 사용하면 더욱 좋습니다. 한자어나 전문 용어 사용은 최대한 피하고, 꼭 필요하다면 쉬운 말로 풀어 설명해주세요. 문장은 짧고 명확하게 작성해주세요.
{{{userName}}}님이 이 설명을 통해 자신의 삶에 대한 긍정적인 통찰과 지혜를 얻을 수 있도록 도와주십시오.
`,
});


const nameInterpretationPrompt = ai.definePrompt({
  name: 'nameInterpretationPrompt',
  input: {schema: InterpretNameInputSchema},
  output: {schema: InterpretNameOutputSchema.extend({
    detailedAnalysis: InterpretNameOutputSchema.shape.detailedAnalysis.extend({
      iChingHexagram: InterpretNameOutputSchema.shape.detailedAnalysis.shape.iChingHexagram.omit({ interpretation: true })
    })
  })},
  prompt: `당신은 수십 년간 동서양 철학, 사주명리학, 한국 전통 성명학(한자 수리획수법 - 81수리 이론 기반 원형이정 4격, 음양오행, 발음오행, 자원오행), 주역 등을 깊이 연구하고 통달한 최고의 학자입니다. 당신의 이름풀이는 단순한 예측을 넘어, 개인의 삶에 대한 깊은 통찰과 지혜를 제공하며, 매우 정확하고 상세합니다.

다음 사용자 정보를 바탕으로, 제시된 "이름풀이 결과 페이지 구성안"의 모든 항목을 빠짐없이 채워주십시오. (단, '주역 괘 분석'의 'interpretation' 항목은 비워두십시오. 해당 부분은 다른 단계에서 처리됩니다.) 각 항목에 대한 분석은 반드시 "해석 관련 규칙"을 엄격히 준수하여 이루어져야 합니다. 모든 답변은 한국어로, 전문가적이고 학문적인 어조로 작성하되, 사용자가 쉽게 이해할 수 있도록 명확하게 설명해주십시오. 특히, 긍정적인 측면과 함께 주의하거나 개선해야 할 점도 균형 있게 제시하여 사용자가 자신의 삶을 더 잘 개척해나갈 수 있도록 실질적인 조언을 제공해야 합니다.

**사용자 정보:**
- 이름: {{{name}}} (AI는 제공된 이름이 한글인지, 한글과 한자(괄호 안에 명시된 경우)가 혼용되었는지 등을 판단하여 분석합니다. 한자 이름 풀이 시에는 반드시 해당 한자의 **정자(正字) 획수**를 기준으로 분석해야 합니다.)
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}
- 성별: {{{gender}}}

**해석 관련 규칙:**
1.  **사주 분석:**
    *   입력된 생년월일시를 기준으로 **음력 날짜를 확정**하고, 이를 바탕으로 년주, 월주, 일주, 시주의 천간, 지지, 음양, 오행을 정확히 계산하여 명시합니다. (시주가 '모름'일 경우 해당 부분을 '불명' 또는 합리적 추론으로 처리)
    *   음력 기준 60갑자 간지(예: 갑자년)와 띠(예: 쥐띠), 가능하다면 띠의 색깔(예: 흰색)도 함께 제공합니다.
    *   사주 전체의 오행 분포(목,화,토,금,수 각 오행의 상대적 강도 또는 개수)를 분석하고, 사주에서 **가장 보충이 필요한 오행**(용신 또는 희신에 해당)을 명확히 제시합니다.
2.  **이름 분석:**
    *   **한자 획수 및 음양 (hanjaStrokeCounts 및 yinYangHarmony):**
        *   먼저, 이름의 각 글자(한자 또는 한글)에 대한 획수를 계산하여 \\\`hanjaStrokeCounts\\\` 배열에 저장합니다. 한자가 명시된 경우(예: '洪'), 해당 한자의 **정자(正字) 획수**를 사용합니다. 한글만 있는 음절의 경우, 일반적인 한글 획수 계산법(예: ㄱ=1획, ㅏ=1획 등)을 적용합니다. 각 \\\`hanjaStrokeCounts\\\` 항목에는 { character: "글자", strokes: 획수, yinYang: "음양표기 (예: 양(陽) 또는 음(陰))" } 형태로 제공되어야 하며, \\\`yinYang\\\` 필드는 해당 글자의 계산된 획수(홀수=양, 짝수=음)에 따라 정확히 '양(陽)' 또는 '음(陰)'으로 채워져야 합니다. 획수를 알 수 없는 경우 strokes 필드를 생략할 수 있습니다.
        *   \\\`yinYangHarmony.nameYinYangComposition\\\` 필드에는 \\\`hanjaStrokeCounts\\\` 배열의 각 항목에서 결정된 \\\`yinYang\\\` 값(예: '음(陰)' 또는 '양(陽)')들을 순서대로 '-' 문자로 연결하여 문자열로 표시합니다 (예: \\\`hanjaStrokeCounts\\\`가 洪(음), 吉(음), 童(음)으로 분석되었다면 "음(陰)-음(陰)-음(陰)"으로, 李(양), 明(음), 博(음)으로 분석되었다면 "양(陽)-음(陰)-음(陰)"으로 정확히 명시합니다). 이 음양 배열은 반드시 \\\`hanjaStrokeCounts\\\`에서 계산된 각 글자 획수 및 \\\`yinYang\\\` 필드와 일치해야 합니다.
        *   마지막으로, \\\`yinYangHarmony.assessment\\\` 필드에 이렇게 도출된 이름 전체의 음양 배열과 그 조화도에 대한 상세한 평가를 제공합니다.
    *   **발음오행:** 이름 각 한글 음절의 초성(자음)에 해당하는 오행(예: ㄱ,ㅋ=木 / ㄴ,ㄷ,ㄹ,ㅌ=火 / ㅇ,ㅎ=土 / ㅅ,ㅈ,ㅊ=金 / ㅁ,ㅂ,ㅍ=水)을 분석하고, 초성 오행 간의 상생/상극 관계를 설명하고 평가합니다.
    *   **수리길흉 분석 (81수리 이론 기반 원형이정 4격):**
        *   **원격(元格, 초년운 0-20세):** (성이 한 글자일 경우) 이름 첫 글자 획수 + 이름 두번째 글자 획수. (성이 두 글자일 경우) 성씨 두번째 글자 획수 + 이름 첫 글자 획수. (이름이 외자일 경우) 이름 첫 글자 획수 + 1획. 산출된 수를 81수리표에 대입하여 길흉과 의미를 해석합니다. 해당 시기의 성격적 특징, 주요 운세 흐름(학업, 친구관계 등), 건강, 잠재력에 대해 **81수리 이론의 해당 번호 설명을 참고하여 구체적이고 심층적으로 설명**합니다. name 필드 값은 "원격(元格) - 초년운 (0-20세)" 이어야 합니다.
        *   **형격(亨格, 청년운 21-40세):** 성씨 첫 글자 획수 + 이름 첫 글자 획수. (성이 두 글자일 경우) 성씨 첫 글자 획수 + 성씨 두번째 글자 획수. 산출된 수를 81수리표에 대입하여 길흉과 의미를 해석합니다. 사회생활 시작, 직업, 결혼, 재물 형성, 대인관계 확장 등 청년기의 주요 과업과 운세를 중심으로 **81수리 이론의 해당 번호 설명을 참고하여 구체적이고 심층적으로 설명**합니다. name 필드 값은 "형격(亨格) - 청년운 (21-40세)" 이어야 합니다.
        *   **이격(利格, 장년운 41-60세):** 성씨 첫 글자 획수 + 이름 마지막 글자 획수. (성이 두 글자일 경우) 성씨 첫 글자 획수 + 이름 마지막 글자 획수. (외자 이름일 경우) 성씨 획수 + 1획. 산출된 수를 81수리표에 대입하여 길흉과 의미를 해석합니다. 사회적 성취, 가정의 안정, 건강 변화, 자녀 관계 등 장년기의 운세 변화와 특징을 **81수리 이론의 해당 번호 설명을 참고하여 구체적이고 심층적으로 분석**합니다. name 필드 값은 "이격(利格) - 장년운 (41-60세)" 이어야 합니다.
        *   **정격(貞格, 말년운/총운 60세 이후):** 성씨와 이름의 모든 글자 획수의 총합. 산출된 수를 81수리표에 대입하여 길흉과 의미를 해석합니다. 인생 전체를 아우르는 총운이자 노년기의 건강, 안정, 자손과의 관계, 삶의 마무리 등을 **81수리 이론의 해당 번호 설명을 참고하여 종합적이고 심층적으로 조망**합니다. name 필드 값은 "정격(貞格) - 말년운/총운 (60세 이후)" 이어야 합니다.
        *   각 격(원형이정)에 대해 해당 운세 시기, 수리 번호, 길흉 등급('대길', '길', '평', '흉', '대흉', 또는 '양운수', '상운수' 등 81수리 이론의 분류에 따름), 그리고 그 수리가 의미하는 성격, 건강, 재물, 대인관계, 사회적 성취 등에 대한 구체적이고 심층적인 해설을 제공합니다. 해석은 단순한 키워드 나열이 아니라, 실제 삶에 적용될 수 있는 통찰력 있는 설명이어야 합니다.
    *   **자원오행 분석 (사주 보완):** 이름에 사용된 한자(한자 이름의 경우)의 본래 뜻(자의)이 가지는 오행(자원오행)을 분석합니다. 이 자원오행이 사용자의 사주에서 부족한 오행(용신/희신)을 효과적으로 보완하는지, 또는 오히려 기신(忌神)을 강화시키는지 등을 심층적으로 평가합니다. (한글 이름일 경우, 해당 분석은 제한되거나 일반론으로 설명합니다.)
    *   **주역 괘 도출:** 이름의 전체 획수(총격 수리) 또는 이름의 특성을 고려하여 가장 관련성이 높은 주역 64괘 중 하나를 도출하고, 해당 괘의 기본적인 이름 (예: "지천태")과 괘의 이미지(선택 사항)만 기록합니다. 'interpretation' 필드는 비워두십시오.
3.  **종합 평가 및 조언:**
    *   위 모든 분석(사주, 음양, 수리, 자원오행 등)을 종합하여 이름에 대한 최종 점수(100점 만점)와 평가 등급('매우 좋음', '좋음', '보통', '주의 필요', '나쁨')을 산정합니다. 간단한 요약 평가 문구와 함께 인생 총운에 대한 간략한 요약 (overallFortuneSummary)도 포함해주십시오.
    *   이름의 장점, 단점, 그리고 삶에 미치는 영향에 대한 전반적인 조언을 제공합니다.
    *   세부 항목별 점수(음양오행(만점 20점), 수리길흉(만점 35점), 발음오행(만점 25점), 자원오행(만점 20점) 각각)도 제시합니다. 
4.  **주의사항 및 조언 (cautionsAndRecommendations):**
    *   이름에 사용된 한자 중 불용한자(뜻이 나쁘거나, 특정 성별/상황에만 쓰여 부적절한 글자)가 있는지 확인하고, 있다면 그 목록과 이유를 설명합니다. 또한, 이름에 사용된 한자 중 특별히 길한 의미를 가지거나 사주에 긍정적인 영향을 주는 한자가 있다면 그 목록과 이유(auspiciousHanja)도 함께 설명해주십시오.
    *   기타 이름과 관련하여 특별히 주의해야 할 점이나 개선을 위한 제언이 있다면 포함합니다. 전반적인 조언에는 운세를 개선하기 위한 구체적인 해결 방안(예: 특정 색상의 옷 착용, 특정 방향으로 침대 머리 두기, 지니면 좋은 물건 등)이나 추천 활동 등 **실질적이고 구체적인 조언** 포함. (generalAdvice)
    *   **행운의 숫자 (luckyNumbers):** 이 이름 풀이를 바탕으로 사용자에게 특별한 행운을 가져다 줄 1부터 45 사이의 숫자 3개를 추천해주세요.

**이름풀이 결과 페이지 구성안 (아래 모든 항목을 반드시 채워주십시오. 단, 주역 괘 분석의 'interpretation'은 제외):**
... (기존 프롬프트의 상세 구성안 내용 참조) ...
**3. 상세 분석 섹션 (detailedAnalysis):**
    *   ... (다른 항목들) ...
    *   **iChingHexagram (주역 괘 분석):**
        *   hexagramName: 도출된 주역 괘의 이름 (예: 지천태괘)
        *   hexagramImage: (선택 사항) 괘의 유니코드 문자 (예: ䷊)
        *   interpretation: **이 필드는 비워두거나 "추후 제공 예정"으로 설정하십시오.**
... (나머지 구성안 내용 참조) ...

사용자의 미래에 대한 깊은 통찰과 지혜를 담아, 각 항목을 상세하고 정확하게 분석해주십시오. 모든 한자 획수는 **정자(正字)**를 기준으로 하며, 음양오행 및 수리 계산법은 위에 명시된 규칙을 엄격히 따라야 합니다. 특히 수리 4격(원형이정)의 계산 방식을 정확히 이해하고 적용해주십시오. 81수리 이론에 따른 각 수리 번호의 해석을 적극 활용하여 깊이 있는 풀이를 제공해주십시오.
`,
});


export async function interpretName(input: InterpretNameInput): Promise<InterpretNameOutput> {
  try {
    const { output: initialOutput } = await nameInterpretationPrompt(input);
    if (!initialOutput) {
      throw new Error("이름 풀이 초기 결과를 생성하지 못했습니다. AI 모델로부터 응답을 받지 못했습니다.");
    }

    let finalOutput: InterpretNameOutput = {
        ...initialOutput,
        detailedAnalysis: {
            ...initialOutput.detailedAnalysis,
            iChingHexagram: {
                hexagramName: initialOutput.detailedAnalysis.iChingHexagram.hexagramName,
                hexagramImage: initialOutput.detailedAnalysis.iChingHexagram.hexagramImage,
                interpretation: "", 
            }
        }
    };
    
    if (finalOutput.basicInfoSummary && finalOutput.basicInfoSummary.gender !== (input.gender === 'male' ? '남자' : '여자')) {
        finalOutput.basicInfoSummary.gender = (input.gender === 'male' ? '남자' : '여자');
    }

    if (initialOutput.detailedAnalysis?.iChingHexagram?.hexagramName) {
      let hexagramNameFromLLM = initialOutput.detailedAnalysis.iChingHexagram.hexagramName;
      // "괘" 접미사 제거
      let cleanedHexagramName = hexagramNameFromLLM.endsWith("괘")
        ? hexagramNameFromLLM.slice(0, -1)
        : hexagramNameFromLLM;

      const typedIchingData = ichingData as Array<{ id: number; name: string; symbol: string; hexagram: string; number?: string; description: string; summary: { keyword: string; positive: string; caution: string; advice: string; } }>;
      const hexagramInfo = typedIchingData.find(item => item.name === cleanedHexagramName);

      if (hexagramInfo && hexagramInfo.description) {
        const simplifyInput = {
          hexagramName: cleanedHexagramName,
          originalInterpretation: hexagramInfo.description,
          userName: input.name,
        };
        const { output: simplifiedResult } = await simplifyHexagramPrompt(simplifyInput);
        if (simplifiedResult?.simplifiedInterpretation) {
          finalOutput.detailedAnalysis.iChingHexagram.interpretation = simplifiedResult.simplifiedInterpretation;
          finalOutput.detailedAnalysis.iChingHexagram.hexagramName = cleanedHexagramName; // Update to cleaned name
        } else {
          console.warn(`주역 괘 단순화 실패: ${cleanedHexagramName}`);
          finalOutput.detailedAnalysis.iChingHexagram.interpretation = `"${cleanedHexagramName}" 괘의 의미를 요약하는 데 실패했습니다. 원본 해설의 일부: ${hexagramInfo.description.substring(0,100)}...`;
        }
      } else {
        console.warn(`주역 괘 정보 찾기 실패: ${cleanedHexagramName} (원본: ${hexagramNameFromLLM})`);
        finalOutput.detailedAnalysis.iChingHexagram.interpretation = `"${cleanedHexagramName}" 괘에 대한 상세 정보를 찾을 수 없어 해석을 제공할 수 없습니다.`;
      }
    } else if (finalOutput.detailedAnalysis?.iChingHexagram) {
         finalOutput.detailedAnalysis.iChingHexagram.interpretation = "관련된 주역 괘를 찾지 못했습니다.";
    }

    // Ensure all SuriGyeok fields have default values if missing from LLM
    const suriGyeokKeys: (keyof typeof finalOutput.detailedAnalysis.suriGilhyungAnalysis)[] = ['wonGyeok', 'hyeongGyeok', 'iGyeok', 'jeongGyeok'];
    suriGyeokKeys.forEach(key => {
        if (key === 'introduction') return; // Skip introduction
        const gyeok = finalOutput.detailedAnalysis.suriGilhyungAnalysis[key] as SuriGyeokSchema | undefined;

        let defaultName = "";
        if (key === 'wonGyeok') defaultName = "원격(元格) - 초년운 (0-20세)";
        else if (key === 'hyeongGyeok') defaultName = "형격(亨格) - 청년운 (21-40세)";
        else if (key === 'iGyeok') defaultName = "이격(利格) - 장년운 (41-60세)";
        else defaultName = "정격(貞格) - 말년운/총운 (60세 이후)";

        if (!gyeok) {
            (finalOutput.detailedAnalysis.suriGilhyungAnalysis[key] as SuriGyeokSchema) = {
                name: defaultName,
                suriNumber: 0,
                rating: "정보 없음",
                interpretation: "해석 정보를 생성하지 못했습니다."
            };
        } else {
            if (!gyeok.name) gyeok.name = defaultName;
            if (gyeok.suriNumber === undefined) gyeok.suriNumber = 0;
            if (!gyeok.rating) gyeok.rating = "정보 없음";
            if (!gyeok.interpretation) gyeok.interpretation = "해석 정보를 생성하지 못했습니다.";
        }
    });


    return finalOutput;

  } catch (err) {
      console.error("Error during nameInterpretation flow:", err);
      if (err instanceof Error) {
          if (err.message.includes("Service Unavailable") || err.message.includes("503")) {
              throw new Error("AI 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
          } else if (err.message.includes("Bad Request") || err.message.includes("400") || err.message.includes("Invalid JSON payload") || err.message.includes("exclusiveMinimum") || err.message.includes("const")) {
               throw new Error("AI 서비스 요청에 오류가 발생했습니다. 입력 값을 확인하거나 정의된 스키마를 점검해 주세요. (예: 'exclusiveMinimum' 또는 'const' 관련 오류)");
          }
      }
      throw new Error("이름 풀이 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

const interpretNameFlow = ai.defineFlow(
  {
    name: 'interpretNameFlow',
    inputSchema: InterpretNameInputSchema,
    outputSchema: InterpretNameOutputSchema,
  },
  interpretName 
);
