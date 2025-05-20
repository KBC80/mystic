
'use server';

import { unstable_cache as cache } from 'next/cache';

const LOTTO_API_URL = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

interface WinningNumberApiData {
  returnValue: string;
  totSellamnt?: number;
  drwNoDate?: string;
  firstWinamnt?: number; // 1등 당첨금액 (1인당)
  drwtNo6?: number;
  drwtNo4?: number;
  firstPrzwnerCo?: number; // 1등 당첨인원
  drwtNo5?: number;
  bnusNo?: number;
  firstAccumamnt?: number; // 1등 총 당첨금액 (모든 1등 당첨자 합산)
  drwNo?: number;
  drwtNo2?: number;
  drwtNo3?: number;
  drwtNo1?: number;
}

export interface HistoricalDrawData {
  drwNo: number;
  drwNoDate: string;
  numbers: number[];
  bnusNo: number;
  firstPrzwnerCo: number;
  firstWinamnt: number; // 1등 당첨금 (1인당)
}

// Helper to fetch a single lotto draw with caching
const fetchLottoDrawData = cache(
  async (drawNo: number): Promise<WinningNumberApiData | null> => {
    try {
      const response = await fetch(`${LOTTO_API_URL}${drawNo}`);
      if (!response.ok) {
        // console.warn(`API 요청 실패 (회차 ${drawNo}): ${response.status}`);
        return null;
      }
      const data = await response.json() as WinningNumberApiData;
      if (data.returnValue !== 'success') {
        // This means the draw number doesn't exist or there was an issue
        return null; 
      }
      return data;
    } catch (error) {
      // console.error(`API 호출 중 오류 발생 (회차 ${drawNo}):`, error);
      return null;
    }
  },
  ['lotto-draw-historical'], // Unique cache key for historical page
  { revalidate: 3600 * 6 } // Cache for 6 hours
);

// Function to find the latest draw number
async function findLatestDrawNo(): Promise<number> {
    const now = new Date();
    const startDate = new Date("2002-12-07"); // Lotto Draw 1 date
    const weeksSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    let estimatedCurrentDraw = weeksSinceStart + 1;
    let latestDrawNo = 0;
    const searchBuffer = 10; 

    for (let i = 0; i <= searchBuffer * 2; i++) { 
      const drawToTry = estimatedCurrentDraw + searchBuffer - i;
      if (drawToTry <= 0) continue;
      const data = await fetchLottoDrawData(drawToTry);
      if (data && data.returnValue === 'success' && data.drwNo) {
        latestDrawNo = data.drwNo;
        break;
      }
    }
    if (latestDrawNo === 0) {
        throw new Error("최신 회차 번호를 확인할 수 없습니다. API 서비스 상태를 확인해주세요.");
    }
    return latestDrawNo;
}


export async function fetchHistoricalDraw(drwNo: number): Promise<{ drawDetails?: HistoricalDrawData; error?: string }> {
  if (drwNo <= 0) {
    return { error: "유효한 회차 번호를 입력해주세요." };
  }
  try {
    const data = await fetchLottoDrawData(drwNo);
    if (!data) {
      return { error: `${drwNo}회차 정보를 가져오지 못했습니다. 존재하지 않는 회차일 수 있습니다.` };
    }

    if (data.returnValue === 'success' &&
        data.drwNo && data.drwNoDate &&
        data.drwtNo1 && data.drwtNo2 && data.drwtNo3 &&
        data.drwtNo4 && data.drwtNo5 && data.drwtNo6 && data.bnusNo &&
        data.firstPrzwnerCo !== undefined &&
        data.firstWinamnt !== undefined 
    ) {
      const numbers = [
        data.drwtNo1, data.drwtNo2, data.drwtNo3,
        data.drwtNo4, data.drwtNo5, data.drwtNo6
      ].sort((a, b) => a - b);

      return {
        drawDetails: {
          drwNo: data.drwNo,
          drwNoDate: data.drwNoDate,
          numbers: numbers,
          bnusNo: data.bnusNo,
          firstPrzwnerCo: data.firstPrzwnerCo,
          firstWinamnt: data.firstWinamnt, // 1등 당첨금 (1인당)
        }
      };
    } else {
      return { error: `${drwNo}회차 당첨 번호 데이터를 가져오는 데 실패했습니다.` };
    }
  } catch (err) {
    console.error(`Error in fetchHistoricalDraw for draw ${drwNo}:`, err);
    return { error: err instanceof Error ? err.message : `${drwNo}회차 정보 조회 중 알 수 없는 오류 발생` };
  }
}

export async function getRecentHistoricalDraws(count: number): Promise<{ recentDraws?: HistoricalDrawData[]; error?: string; latestDrawNo?: number }> {
  try {
    const latestDrawNo = await findLatestDrawNo();
    const draws: HistoricalDrawData[] = [];

    for (let i = 0; i < count; i++) {
      const currentDrawToFetch = latestDrawNo - i;
      if (currentDrawToFetch <= 0) break;
      
      const { drawDetails, error } = await fetchHistoricalDraw(currentDrawToFetch);
      if (error) {
        // Log warning but continue if possible, e.g., for one missing draw in sequence
        console.warn(`최근 회차 조회 중 오류 (회차 ${currentDrawToFetch}): ${error}`);
        // If it's the very first draw (latest) that fails, it's more critical
        if (i === 0) {
          return { error: `최신 회차(${latestDrawNo}) 정보를 가져오는데 실패했습니다: ${error}`, latestDrawNo };
        }
        continue; // Skip this draw and try the next older one
      }
      if (drawDetails) {
        draws.push(drawDetails);
      }
    }

    if (draws.length === 0 && count > 0) {
      return { error: `최근 ${count}회차 당첨 번호를 가져오지 못했습니다. (감지된 최신 회차: ${latestDrawNo})`, latestDrawNo };
    }

    return { recentDraws: draws, latestDrawNo };

  } catch (err) {
    console.error("Error in getRecentHistoricalDraws:", err);
    return { error: err instanceof Error ? err.message : "최근 당첨 번호 로딩 중 알 수 없는 오류 발생" };
  }
}

