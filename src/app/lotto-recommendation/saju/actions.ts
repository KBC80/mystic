
'use server';

import { unstable_cache as cache } from 'next/cache';

const LOTTO_API_URL = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

interface WinningNumberApiData {
  returnValue: string;
  totSellamnt?: number;
  drwNoDate?: string;
  firstWinamnt?: number;
  drwtNo6?: number;
  drwtNo4?: number;
  firstPrzwnerCo?: number;
  drwtNo5?: number;
  bnusNo?: number;
  firstAccumamnt?: number;
  drwNo?: number;
  drwtNo2?: number;
  drwtNo3?: number;
  drwtNo1?: number;
}

export interface LatestWinningNumber {
  drwNo: number;
  drwNoDate: string;
  numbers: number[];
  bnusNo: number;
}

// Helper to fetch a single lotto draw with caching
const fetchLottoDraw = cache(
  async (drawNo: number): Promise<WinningNumberApiData | null> => {
    try {
      const response = await fetch(`${LOTTO_API_URL}${drawNo}`);
      if (!response.ok) {
        // console.warn(`Saju API 요청 실패 (회차 ${drawNo}): ${response.status}`);
        return null;
      }
      const data = await response.json() as WinningNumberApiData;
      if (data.returnValue !== 'success') {
        // console.warn(`Saju API 데이터 실패 (회차 ${drawNo}): ${data.returnValue}`);
        return null;
      }
      return data;
    } catch (error) {
      // console.error(`Saju API 호출 중 오류 발생 (회차 ${drawNo}):`, error);
      return null;
    }
  },
  ['lotto-draw-saju'], // Unique cache key for Saju page
  { revalidate: 3600 * 3 } // Cache for 3 hours
);

export async function getLatestLottoDraw(): Promise<{
  latestDraw?: LatestWinningNumber;
  error?: string;
}> {
  try {
    let latestDrawNo = 0;

    // Estimate current draw number
    const now = new Date();
    const startDate = new Date("2002-12-07"); // Lotto Draw 1 date
    const weeksSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    let estimatedCurrentDraw = weeksSinceStart + 1;

    // Find the actual latest draw number by fetching downwards from estimate + a buffer
    const searchBuffer = 10; // Look a bit ahead of the estimate
    for (let i = 0; i <= searchBuffer * 2; i++) { // Search around estimate
      const drawToTry = estimatedCurrentDraw + searchBuffer - i;
      if (drawToTry <= 0) continue;
      const data = await fetchLottoDraw(drawToTry);
      if (data && data.returnValue === 'success' && data.drwNo) {
        latestDrawNo = data.drwNo;
        break;
      }
    }

    if (latestDrawNo === 0) {
      return { error: "최신 회차 번호를 확인할 수 없습니다. API 서비스 상태를 확인해주세요." };
    }

    const latestDrawData = await fetchLottoDraw(latestDrawNo);

    if (latestDrawData && latestDrawData.returnValue === 'success' &&
        latestDrawData.drwNo && latestDrawData.drwNoDate &&
        latestDrawData.drwtNo1 && latestDrawData.drwtNo2 && latestDrawData.drwtNo3 &&
        latestDrawData.drwtNo4 && latestDrawData.drwtNo5 && latestDrawData.drwtNo6 && latestDrawData.bnusNo
    ) {
      const numbers = [
        latestDrawData.drwtNo1, latestDrawData.drwtNo2, latestDrawData.drwtNo3,
        latestDrawData.drwtNo4, latestDrawData.drwtNo5, latestDrawData.drwtNo6
      ].sort((a, b) => a - b);

      return {
        latestDraw: {
          drwNo: latestDrawData.drwNo,
          drwNoDate: latestDrawData.drwNoDate,
          numbers: numbers,
          bnusNo: latestDrawData.bnusNo,
        }
      };
    } else {
      return { error: `최신 (${latestDrawNo}회) 당첨 번호 데이터를 가져오는 데 실패했습니다.` };
    }
  } catch (err) {
    console.error("Error in getLatestLottoDraw:", err);
    return { error: err instanceof Error ? err.message : "최신 당첨 번호 로딩 중 알 수 없는 오류 발생" };
  }
}
