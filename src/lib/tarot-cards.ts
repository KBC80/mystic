// Based on a standard 78-card Rider-Waite deck.

export const tarotCardNames: string[] = [
  // Major Arcana (22 cards)
  "바보", "마법사", "고위 여사제", "여제", "황제",
  "교황", "연인", "전차", "힘", "은둔자",
  "운명의 수레바퀴", "정의", "매달린 남자", "죽음", "절제",
  "악마", "탑", "별", "달", "태양",
  "심판", "세계",

  // Minor Arcana - Wands (14 cards)
  "완드 에이스", "완드 2", "완드 3", "완드 4", "완드 5",
  "완드 6", "완드 7", "완드 8", "완드 9", "완드 10",
  "완드 시종", "완드 기사", "완드 여왕", "완드 왕",

  // Minor Arcana - Cups (14 cards)
  "컵 에이스", "컵 2", "컵 3", "컵 4", "컵 5",
  "컵 6", "컵 7", "컵 8", "컵 9", "컵 10",
  "컵 시종", "컵 기사", "컵 여왕", "컵 왕",

  // Minor Arcana - Swords (14 cards)
  "검 에이스", "검 2", "검 3", "검 4", "검 5",
  "검 6", "검 7", "검 8", "검 9", "검 10",
  "검 시종", "검 기사", "검 여왕", "검 왕",

  // Minor Arcana - Pentacles (14 cards)
  "펜타클 에이스", "펜타클 2", "펜타클 3", "펜타클 4", "펜타클 5",
  "펜타클 6", "펜타클 7", "펜타클 8", "펜타클 9", "펜타클 10",
  "펜타클 시종", "펜타클 기사", "펜타클 여왕", "펜타클 왕",
];

if (tarotCardNames.length !== 78) { 
  console.warn(`경고: ${tarotCardNames.length}개의 타로 카드 이름이 정의되었습니다. 78개가 필요합니다. tarot-cards.ts 파일을 확인해주세요.`);
}


const cardImageMap: { [key: string]: string } = {
  // Major Arcana
  "바보": "00-TheFool.jpg",
  "마법사": "01-TheMagician.jpg",
  "고위 여사제": "02-TheHighPriestess.jpg",
  "여제": "03-TheEmpress.jpg",
  "황제": "04-TheEmperor.jpg",
  "교황": "05-TheHierophant.jpg",
  "연인": "06-TheLovers.jpg",
  "전차": "07-TheChariot.jpg",
  "힘": "08-Strength.jpg",
  "은둔자": "09-TheHermit.jpg",
  "운명의 수레바퀴": "10-WheelOfFortune.jpg",
  "정의": "11-Justice.jpg",
  "매달린 남자": "12-TheHangedMan.jpg",
  "죽음": "13-Death.jpg",
  "절제": "14-Temperance.jpg",
  "악마": "15-TheDevil.jpg",
  "탑": "16-TheTower.jpg",
  "별": "17-TheStar.jpg",
  "달": "18-TheMoon.jpg",
  "태양": "19-TheSun.jpg",
  "심판": "20-Judgement.jpg",
  "세계": "21-TheWorld.jpg",

  // Minor Arcana - Wands
  "완드 에이스": "Wands01.jpg", "완드 2": "Wands02.jpg", "완드 3": "Wands03.jpg", "완드 4": "Wands04.jpg", "완드 5": "Wands05.jpg",
  "완드 6": "Wands06.jpg", "완드 7": "Wands07.jpg", "완드 8": "Wands08.jpg", "완드 9": "Wands09.jpg", "완드 10": "Wands10.jpg",
  "완드 시종": "Wands11.jpg", "완드 기사": "Wands12.jpg", "완드 여왕": "Wands13.jpg", "완드 왕": "Wands14.jpg",

  // Minor Arcana - Cups
  "컵 에이스": "Cups01.jpg", "컵 2": "Cups02.jpg", "컵 3": "Cups03.jpg", "컵 4": "Cups04.jpg", "컵 5": "Cups05.jpg",
  "컵 6": "Cups06.jpg", "컵 7": "Cups07.jpg", "컵 8": "Cups08.jpg", "컵 9": "Cups09.jpg", "컵 10": "Cups10.jpg",
  "컵 시종": "Cups11.jpg", "컵 기사": "Cups12.jpg", "컵 여왕": "Cups13.jpg", "컵 왕": "Cups14.jpg",

  // Minor Arcana - Swords
  "검 에이스": "Swords01.jpg", "검 2": "Swords02.jpg", "검 3": "Swords03.jpg", "검 4": "Swords04.jpg", "검 5": "Swords05.jpg",
  "검 6": "Swords06.jpg", "검 7": "Swords07.jpg", "검 8": "Swords08.jpg", "검 9": "Swords09.jpg", "검 10": "Swords10.jpg",
  "검 시종": "Swords11.jpg", "검 기사": "Swords12.jpg", "검 여왕": "Swords13.jpg", "검 왕": "Swords14.jpg",

  // Minor Arcana - Pentacles (14 cards)
  "펜타클 에이스": "Pentacles01.jpg", "펜타클 2": "Pentacles02.jpg", "펜타클 3": "Pentacles03.jpg",
  "펜타클 4": "Pentacles04.jpg", "펜타클 5": "Pentacles05.jpg",
  "펜타클 6": "Pentacles06.jpg", "펜타클 7": "Pentacles07.jpg", "펜타클 8": "Pentacles08.jpg", "펜타클 9": "Pentacles09.jpg", "펜타클 10": "Pentacles10.jpg",
  "펜타클 시종": "Pentacles11.jpg", "펜타클 기사": "Pentacles12.jpg", "펜타클 여왕": "Pentacles13.jpg", "펜타클 왕": "Pentacles14.jpg",
};

// Check if all tarotCardNames have a corresponding image in the map
const missingImages = tarotCardNames.filter(name => !cardImageMap[name]);
if (missingImages.length > 0) {
  console.error(`오류: 다음 타로 카드 이름에 대한 이미지가 cardImageMap에 없습니다: ${missingImages.join(', ')}`);
}

export interface TarotCard {
  id: string;
  name: string;
  imageUrl: string;
  dataAiHint: string;
  isFaceUp: boolean;
}

// Generate a deck of 78 cards
export function generateDeck(): TarotCard[] {
  return tarotCardNames.map((name, index) => {
    const imageName = cardImageMap[name];
    const imageUrl = imageName ? `/image/${imageName}` : `https://picsum.photos/200/300?random=${index}`; // Fallback placeholder
    if (!imageName) {
      console.warn(`경고: 카드 "${name}"에 대한 이미지를 찾을 수 없습니다. 플레이스홀더 이미지를 사용합니다.`);
    }
    const hintName = name.toLowerCase().replace(/\s+/g, ''); // e.g., "고위여사제"
    const hintParts = hintName.match(/.{1,4}/g) || []; // Split into parts of up to 4 chars for two words
    const dataAiHint = `타로 ${hintParts.slice(0,2).join(" ")}`.trim();


    return {
      id: `card-${index}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      imageUrl: imageUrl,
      dataAiHint: dataAiHint, 
      isFaceUp: false,
    };
  });
}
