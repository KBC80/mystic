// src/lib/hanja-utils.ts
import hanjaFullData from './hanja_full_data.json';

export interface HanjaDetail {
  hanja: string;
  specificReading: string; // e.g., "높을 고" or "갈 역" - the segment relevant to the phonetic syllable
  // originalFullReading: string; // The full "음" field from JSON, e.g., "넓을 홍" or "갈 역, 쉬울 이" (optional if needed elsewhere)
  description: string; // The "설명" field from JSON (usually English/Japanese description)
  strokeCount: number;
}

// Map to store Hanja details indexed by their Korean phonetic syllable
const hanjaMapBySyllable: Map<string, HanjaDetail[]> = new Map();
let isMapInitialized = false;

function initializeHanjaMap() {
  if (isMapInitialized) return;

  for (const [hanjaChar, detailsObj] of Object.entries(hanjaFullData as Record<string, any>)) {
    const originalFullReading: string = detailsObj.음 || ''; // e.g., "갈 역, 쉬울 이" or "돌이킬 반"
    
    // Split by comma or semicolon for multiple readings
    const readingSegments = originalFullReading.split(/,|;/); 
    
    readingSegments.forEach(segment => {
      const trimmedSegment = segment.trim(); // e.g., "갈 역" or "쉬울 이"
      if (!trimmedSegment) return;

      const words = trimmedSegment.split(/\s+/); // e.g., ["갈", "역"] or ["쉬울", "이"]
      if (words.length > 0) {
        // The Korean phonetic syllable is usually the last word in the reading segment.
        const phoneticSyllable = words[words.length - 1]; 
        
        // Validate if it's a single Korean character.
        if (phoneticSyllable && phoneticSyllable.length === 1 && /^[가-힣]$/.test(phoneticSyllable)) { 
          const currentList = hanjaMapBySyllable.get(phoneticSyllable) || [];
          currentList.push({
            hanja: hanjaChar,
            specificReading: trimmedSegment, // Store the relevant segment like "갈 역"
            // originalFullReading: originalFullReading, // Store original if needed
            description: detailsObj.설명, // This is the "설명" field
            strokeCount: detailsObj.획수,
          });
          hanjaMapBySyllable.set(phoneticSyllable, currentList);
        }
      }
    });
  }
  isMapInitialized = true;
}

export function findHanjaForSyllable(syllable: string): HanjaDetail[] {
  if (!isMapInitialized) {
    initializeHanjaMap(); // Initialize on first call
  }
  return hanjaMapBySyllable.get(syllable) || [];
}

export function splitKoreanName(name: string): string[] {
  // Basic syllable splitting for Korean names.
  // This will split "홍길동" into ["홍", "길", "동"].
  // It filters out non-Korean characters before splitting.
  return name.replace(/[^가-힣]/g, '').split('');
}

