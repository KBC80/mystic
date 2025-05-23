
// src/lib/numerology-utils.ts
import { cardImageMap } from './tarot-cards';

/**
 * 한글 자모와 숫자 매핑 (새로운 참조 자료 기반: https://blog.naver.com/taeil2626/220515564001)
 * 자음: ㄱㅋ(1), ㄴ(2), ㄷㅌ(3), ㄹ(4), ㅁ(5), ㅂㅍ(6), ㅅ(7), ㅇㅎ(8), ㅈㅊ(9)
 * 모음: ㅏㅑ(1), ㅓㅕ(2), ㅗㅛ(3), ㅜㅠ(4), ㅡ(5), ㅣ(6), ㅐㅒ(7), ㅔㅖ(8)
 * 된소리는 예사소리 값 따름. 복합모음은 구성 단모음 값의 합.
 */
const KOREAN_LETTER_VALUES: { [key: string]: number } = {
  // 자음
  'ㄱ': 1, 'ㅋ': 1, 'ㄲ': 1,
  'ㄴ': 2,
  'ㄷ': 3, 'ㅌ': 3, 'ㄸ': 3,
  'ㄹ': 4,
  'ㅁ': 5,
  'ㅂ': 6, 'ㅍ': 6, 'ㅃ': 6,
  'ㅅ': 7, 'ㅆ': 7,
  'ㅇ': 8, 'ㅎ': 8,
  'ㅈ': 9, 'ㅊ': 9, 'ㅉ': 9,
  // 모음
  'ㅏ': 1, 'ㅑ': 1,
  'ㅓ': 2, 'ㅕ': 2,
  'ㅗ': 3, 'ㅛ': 3,
  'ㅜ': 4, 'ㅠ': 4,
  'ㅡ': 5,
  'ㅣ': 6,
  'ㅐ': 7, 'ㅒ': 7,
  'ㅔ': 8, 'ㅖ': 8,
  // 복합 모음 (구성 단모음 값의 합, 이후 reduceNumber에서 필요시 축소됨)
  'ㅘ': 3 + 1, // ㅗ(3) + ㅏ(1) = 4
  'ㅙ': 3 + 7, // ㅗ(3) + ㅐ(7) = 10
  'ㅚ': 3 + 6, // ㅗ(3) + ㅣ(6) = 9
  'ㅝ': 4 + 2, // ㅜ(4) + ㅓ(2) = 6
  'ㅞ': 4 + 8, // ㅜ(4) + ㅔ(8) = 12
  'ㅟ': 4 + 6, // ㅜ(4) + ㅣ(6) = 10
  'ㅢ': 5 + 6, // ㅡ(5) + ㅣ(6) = 11
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
    return [char]; 
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
 * 한글 이름으로 운명수를 계산합니다. (자음 + 모음)
 * @param name 한글 이름 (예: "홍길동")
 * @returns 계산된 운명수
 */
export function calculateDestinyNumber(name: string): number {
  const koreanOnlyName = name.replace(/\s*\(.*\)\s*$/, "").trim();
  let totalValue = 0;

  for (const char of koreanOnlyName) {
    const jamos = getJamo(char);
    for (const jamo of jamos) {
      // ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ 같은 복합 종성 처리
      if (jamo.length > 1) { // 복합 자모인 경우 (예: ㄳ)
        for (const singleJamo of jamo) { // 각 단일 자모로 분해하여 값 계산
          totalValue += KOREAN_LETTER_VALUES[singleJamo] || 0;
        }
      } else {
        totalValue += KOREAN_LETTER_VALUES[jamo] || 0;
      }
    }
  }
  return reduceNumber(totalValue);
}

/**
 * 한글 이름으로 영혼수(생명수)를 계산합니다. (모음)
 * @param name 한글 이름 (예: "홍길동")
 * @returns 계산된 영혼수
 */
export function calculateSoulUrgeNumber(name: string): number {
  const koreanOnlyName = name.replace(/\s*\(.*\)\s*$/, "").trim();
  let totalValue = 0;

  for (const char of koreanOnlyName) {
    const jamos = getJamo(char);
    if (jamos.length >= 2) {
      const jung = jamos[1]; // 중성 (모음)
      totalValue += KOREAN_LETTER_VALUES[jung] || 0;
    }
  }
  return reduceNumber(totalValue);
}

/**
 * 한글 이름으로 성격수를 계산합니다. (자음)
 * @param name 한글 이름 (예: "홍길동")
 * @returns 계산된 성격수
 */
export function calculatePersonalityNumber(name: string): number {
  const koreanOnlyName = name.replace(/\s*\(.*\)\s*$/, "").trim();
  let totalValue = 0;

  for (const char of koreanOnlyName) {
    const jamos = getJamo(char);
    // 초성(자음) 고려
    const cho = jamos[0];
     if (cho.length > 1) { // 복합 자모인 경우 (예: ㄲ)
        for (const singleJamo of cho) {
          totalValue += KOREAN_LETTER_VALUES[singleJamo] || 0;
        }
      } else {
        totalValue += KOREAN_LETTER_VALUES[cho] || 0;
      }

    // 종성(자음) 고려
    if (jamos.length === 3) {
      const jong = jamos[2];
      if (jong.length > 1) { // 복합 자모인 경우 (예: ㄳ)
        for (const singleJamo of jong) {
          totalValue += KOREAN_LETTER_VALUES[singleJamo] || 0;
        }
      } else {
        totalValue += KOREAN_LETTER_VALUES[jong] || 0;
      }
    }
  }
  return reduceNumber(totalValue);
}

const numerologyToMajorArcana: { [key: number]: string } = {
  0: "바보", 
  1: "마법사",
  2: "고위 여사제",
  3: "여제",
  4: "황제",
  5: "교황",
  6: "연인",
  7: "전차",
  8: "힘", 
  9: "은둔자",
  10: "운명의 수레바퀴",
  11: "정의", 
  12: "매달린 남자",
  13: "죽음",
  14: "절제",
  15: "악마",
  16: "탑",
  17: "별",
  18: "달",
  19: "태양",
  20: "심판",
  21: "세계",
  22: "바보",
};

export function getTarotImageForNumerology(num: number): { name: string; imageUrl: string; dataAiHint: string } | null {
  let tarotNumberToMap = num;

  if (num === 33) { 
    tarotNumberToMap = 6; 
  } else if (num > 22) { 
    tarotNumberToMap = reduceNumber(num); 
    if (tarotNumberToMap === 33) tarotNumberToMap = 6; 
  }
  
  let cardNameKey = tarotNumberToMap;
  if (num === 11) cardNameKey = 11; 
  else if (num === 22) cardNameKey = 22; 
  
  const cardName = numerologyToMajorArcana[cardNameKey];

  if (cardName && cardImageMap[cardName]) {
    const imageName = cardImageMap[cardName];
    const hintName = cardName.toLowerCase().replace(/\s+/g, '');
    const hintParts = hintName.match(/.{1,4}/g) || [];
    const dataAiHint = `tarot ${hintParts.slice(0,2).join(" ")}`.trim();

    return {
      name: cardName,
      imageUrl: `/image/${imageName}`, 
      dataAiHint: dataAiHint,
    };
  }
  return null;
}

    