
// src/lib/numerology-utils.ts

/**
 * 한글 자모와 숫자 매핑 (스텔라's 저니 블로그 기반)
 * 자음: ㄱㅋㅊ(1), ㄴ(2), ㄷㅌ(3), ㄹ(4), ㅁㅍ(5), ㅂ(6), ㅅ(7), ㅇㅎ(8), ㅈ(9)
 * 모음: ㅏㅑ(1), ㅓㅕ(2), ㅗㅛ(3), ㅜㅠ(4), ㅡ(5), ㅣ(6), ㅐㅒ(7), ㅔㅖ(8)
 */
const KOREAN_LETTER_VALUES: { [key: string]: number } = {
  // 자음
  'ㄱ': 1, 'ㅋ': 1, 'ㅊ': 1,
  'ㄴ': 2,
  'ㄷ': 3, 'ㅌ': 3,
  'ㄹ': 4,
  'ㅁ': 5, 'ㅍ': 5,
  'ㅂ': 6,
  'ㅅ': 7,
  'ㅇ': 8, 'ㅎ': 8,
  'ㅈ': 9,
  // 모음
  'ㅏ': 1, 'ㅑ': 1,
  'ㅓ': 2, 'ㅕ': 2,
  'ㅗ': 3, 'ㅛ': 3,
  'ㅜ': 4, 'ㅠ': 4,
  'ㅡ': 5,
  'ㅣ': 6,
  'ㅐ': 7, 'ㅒ': 7,
  'ㅔ': 8, 'ㅖ': 8,
  // 복합 모음 (기본 모음 값의 합 또는 특정 값으로 단순화 - 여기서는 자주 사용되는 것 위주로)
  'ㅘ': 3 + 1, // ㅗ + ㅏ = 3 + 1 = 4
  'ㅙ': 3 + 7, // ㅗ + ㅐ = 3 + 7 = 10 -> 1
  'ㅚ': 3 + 6, // ㅗ + ㅣ = 3 + 6 = 9
  'ㅝ': 4 + 2, // ㅜ + ㅓ = 4 + 2 = 6
  'ㅞ': 4 + 8, // ㅜ + ㅔ = 4 + 8 = 12 -> 3
  'ㅟ': 4 + 6, // ㅜ + ㅣ = 4 + 6 = 10 -> 1
  'ㅢ': 5 + 6, // ㅡ + ㅣ = 5 + 6 = 11
};

// 초성, 중성, 종성 분리 코드 (유니코드 기반)
const CHO_HANGUL = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];
const JUNG_HANGUL = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];
const JONG_HANGUL = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const HANGUL_START_CHARCODE = '가'.charCodeAt(0);
const HANGUL_END_CHARCODE = '힣'.charCodeAt(0);

function getJamo(char: string): string[] {
  const charCode = char.charCodeAt(0);
  if (charCode < HANGUL_START_CHARCODE || charCode > HANGUL_END_CHARCODE) {
    return [char]; // 한글 음절이 아니면 그대로 반환
  }
  const hangulOffset = charCode - HANGUL_START_CHARCODE;
  const choIndex = Math.floor(hangulOffset / (JUNG_HANGUL.length * JONG_HANGUL.length));
  const jungIndex = Math.floor((hangulOffset % (JUNG_HANGUL.length * JONG_HANGUL.length)) / JONG_HANGUL.length);
  const jongIndex = hangulOffset % JONG_HANGUL.length;

  const jamos = [CHO_HANGUL[choIndex], JUNG_HANGUL[jungIndex]];
  if (jongIndex > 0) {
    jamos.push(JONG_HANGUL[jongIndex]);
  }
  return jamos;
}

/**
 * 숫자 합계를 한 자리 또는 마스터 숫자로 축소합니다.
 */
function reduceNumber(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
}

/**
 * 한글 이름으로 운명수를 계산합니다.
 * @param name 한글 이름 (예: "홍길동")
 * @returns 계산된 운명수
 */
export function calculateDestinyNumber(name: string): number {
  // 이름에서 한글만 추출 (괄호 안 한자는 무시)
  const koreanOnlyName = name.replace(/\s*\(.*\)\s*$/, "").trim();
  let totalValue = 0;

  for (const char of koreanOnlyName) {
    const jamos = getJamo(char);
    for (const jamo of jamos) {
      totalValue += KOREAN_LETTER_VALUES[jamo] || 0;
    }
  }
  return reduceNumber(totalValue);
}

/**
 * 한글 이름으로 영혼수를 계산합니다.
 * @param name 한글 이름 (예: "홍길동")
 * @returns 계산된 영혼수
 */
export function calculateSoulUrgeNumber(name: string): number {
  const koreanOnlyName = name.replace(/\s*\(.*\)\s*$/, "").trim();
  let totalValue = 0;
  const vowels = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";

  for (const char of koreanOnlyName) {
    const jamos = getJamo(char);
    // 중성(모음)만 고려
    if (jamos.length >= 2) {
      const jung = jamos[1]; // 중성
      if (vowels.includes(jung)) {
        totalValue += KOREAN_LETTER_VALUES[jung] || 0;
      }
    }
  }
  return reduceNumber(totalValue);
}

/**
 * 한글 이름으로 성격수를 계산합니다.
 * @param name 한글 이름 (예: "홍길동")
 * @returns 계산된 성격수
 */
export function calculatePersonalityNumber(name: string): number {
  const koreanOnlyName = name.replace(/\s*\(.*\)\s*$/, "").trim();
  let totalValue = 0;
  const consonants = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

  for (const char of koreanOnlyName) {
    const jamos = getJamo(char);
    // 초성(자음) 고려
    const cho = jamos[0];
    if (consonants.includes(cho)) {
      totalValue += KOREAN_LETTER_VALUES[cho] || 0;
    }
    // 종성(자음) 고려
    if (jamos.length === 3) {
      const jong = jamos[2];
      if (consonants.includes(jong)) {
        totalValue += KOREAN_LETTER_VALUES[jong] || 0;
      }
    }
  }
  return reduceNumber(totalValue);
}
