
'use server';

import { unstable_cache as cache } from 'next/cache';
import { recommendScientificLottoNumbers, type ScientificLottoRecommendationInput, type ScientificLottoRecommendationOutput } from '@/ai/flows/scientific-lotto-recommendation-flow';

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

export interface WinningNumber {
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
}

export interface ProcessedWinningNumber extends WinningNumber {
  numbers: number[];
  sum: number;
  evenCount: number;
  oddCount: number;
}

export interface CalculatedAverages {
  averageSum: number;
  averageEvenOddRatio: string;
  summaryForDisplay: string; 
  frequentNumbers: { num: number; count: number }[];
  leastFrequentNumbers: { num: number; count: number }[];
  analyzedDrawsCount: number;
  notAppearedNumbers: number[];
}

// Helper to fetch a single lotto draw with caching
const fetchLottoDraw = cache(
  async (drawNo: number): Promise<WinningNumberApiData | null> => {
    try {
      const response = await fetch(`${LOTTO_API_URL}${drawNo}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json() as WinningNumberApiData;
      if (data.returnValue !== 'success') {
        return null; 
      }
      return data;
    } catch (error) {
      return null;
    }
  },
  ['lotto-draw-scientific-v3'], 
  { revalidate: 3600 * 3 } 
);


async function getMostRecentDraws(count: number): Promise<{ draws: WinningNumber[], latestDrawNo: number | null }> {
  let latestDrawNo: number | null = null;
  const draws: WinningNumber[] = [];

  const now = new Date();
  const startDate = new Date("2002-12-07"); 
  const weeksSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  let estimatedCurrentDraw = weeksSinceStart + 1; 

  const searchBuffer = 10; 
  for (let i = 0; i <= searchBuffer * 2; i++) { 
    const drawToTry = estimatedCurrentDraw + searchBuffer - i;
    if (drawToTry <= 0) continue;
    const data = await fetchLottoDraw(drawToTry);
    if (data && data.returnValue === 'success' && data.drwNo) {
      latestDrawNo = data.drwNo;
      break;
    }
  }
  
  if (latestDrawNo === null) {
     return { draws, latestDrawNo: null };
  }

  for (let i = 0; i < count; i++) {
    const currentDrawToFetch = latestDrawNo - i;
    if (currentDrawToFetch <= 0) break;
    const data = await fetchLottoDraw(currentDrawToFetch);
    if (data && data.returnValue === 'success' &&
        data.drwNo && data.drwNoDate &&
        data.drwtNo1 && data.drwtNo2 && data.drwtNo3 &&
        data.drwtNo4 && data.drwtNo5 && data.drwtNo6 && data.bnusNo
    ) {
      draws.push({
        drwNo: data.drwNo,
        drwNoDate: data.drwNoDate,
        drwtNo1: data.drwtNo1,
        drwtNo2: data.drwtNo2,
        drwtNo3: data.drwtNo3,
        drwtNo4: data.drwtNo4,
        drwtNo5: data.drwtNo5,
        drwtNo6: data.drwtNo6,
        bnusNo: data.bnusNo,
      });
    }
  }
  return { draws, latestDrawNo };
}

function processRawDraws(rawDraws: WinningNumber[]): ProcessedWinningNumber[] {
  return rawDraws.map(d => {
    const numbers = [d.drwtNo1, d.drwtNo2, d.drwtNo3, d.drwtNo4, d.drwtNo5, d.drwtNo6].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = 6 - evenCount;
    return { ...d, numbers, sum, evenCount, oddCount };
  });
}

function calculateAveragesAndSummarize(processedDraws: ProcessedWinningNumber[], lastN: number): CalculatedAverages {
  const relevantDraws = processedDraws.slice(0, lastN);
  if (relevantDraws.length === 0) {
    return { 
      averageSum: 0, 
      averageEvenOddRatio: "0:0", 
      summaryForDisplay: "분석할 데이터가 충분하지 않습니다.", 
      frequentNumbers: [],
      leastFrequentNumbers: [],
      analyzedDrawsCount: 0,
      notAppearedNumbers: []
    };
  }

  const totalSum = relevantDraws.reduce((acc, d) => acc + d.sum, 0);
  
  const evenOddRatios: { [key: string]: number } = {};
  relevantDraws.forEach(d => {
    const ratioKey = `${d.evenCount}:${d.oddCount}`;
    evenOddRatios[ratioKey] = (evenOddRatios[ratioKey] || 0) + 1;
  });
  let mostCommonRatio = "3:3"; 
  let maxCount = 0;
  for (const ratio in evenOddRatios) {
    if (evenOddRatios[ratio] > maxCount) {
      mostCommonRatio = ratio;
      maxCount = evenOddRatios[ratio];
    }
  }
  
  const averageSum = totalSum / relevantDraws.length;
  
  const allNumbers = relevantDraws.flatMap(d => d.numbers);
  const numberCounts: { [key: number]: number } = {};
  allNumbers.forEach(num => {
    numberCounts[num] = (numberCounts[num] || 0) + 1;
  });

  const sortedNumberCounts = Object.entries(numberCounts)
    .map(([numStr, count]) => ({ num: parseInt(numStr), count }))
    .sort((a,b) => b.count - a.count); 
  
  const frequentNumbersForUI = sortedNumberCounts.slice(0, 7); 
  
  const appearingSortedByCountAsc = [...sortedNumberCounts].sort((a,b) => a.count - b.count);
  const leastFrequentNumbersForUI = appearingSortedByCountAsc.slice(0, 7);

  const allPossibleNumbers = Array.from({ length: 45 }, (_, i) => i + 1);
  const appearingNumbersSet = new Set(allNumbers);
  const notAppearedNumbersRaw = allPossibleNumbers.filter(num => !appearingNumbersSet.has(num));
  const notAppearedNumbersForUI = notAppearedNumbersRaw.slice(0, 7);


  let summaryForDisplay = `최근 ${relevantDraws.length}회차 (${relevantDraws.length > 0 ? relevantDraws[relevantDraws.length-1].drwNo : 'N/A'}회 ~ ${relevantDraws.length > 0 ? relevantDraws[0].drwNo : 'N/A'}회) 분석 요약:\n`;
  summaryForDisplay += `- 평균 당첨 번호 합계: 약 ${averageSum.toFixed(0)} (일반적인 범위: 100-180)\n`;
  summaryForDisplay += `- 가장 흔한 짝수:홀수 비율: ${mostCommonRatio}\n`;
  if (frequentNumbersForUI.length > 0) {
    summaryForDisplay += `- 최근 자주 등장한 주요 숫자 (상위 ${frequentNumbersForUI.length}개, 출현횟수): ${frequentNumbersForUI.map(item => `${item.num}(${item.count}회)`).join(', ')}\n`;
  }
  
  if (leastFrequentNumbersForUI.length > 0) {
    summaryForDisplay += `- 최근 가장 드물게 등장한 주요 숫자 (하위 ${leastFrequentNumbersForUI.length}개, 출현횟수): ${leastFrequentNumbersForUI.map(item => `${item.num}(${item.count}회)`).join(', ')}\n`;
  }
  
  if (notAppearedNumbersRaw.length > 0) {
      summaryForDisplay += `- 최근 ${relevantDraws.length}회 동안 미출현한 주요 숫자: ${notAppearedNumbersForUI.join(', ')}${notAppearedNumbersRaw.length > 7 ? ' 등' : ''}\n`;
  }


  return { 
    averageSum, 
    averageEvenOddRatio: mostCommonRatio, 
    summaryForDisplay, 
    frequentNumbers: frequentNumbersForUI,
    leastFrequentNumbers: leastFrequentNumbersForUI,
    analyzedDrawsCount: relevantDraws.length,
    notAppearedNumbers: notAppearedNumbersForUI
  };
}


export async function getInitialScientificLottoData(numberOfDrawsForAnalysisStr?: string): Promise<{
  recentDraws?: ProcessedWinningNumber[]; 
  averages?: CalculatedAverages; 
  latestDrawNo?: number | null;
  error?: string;
}> {
  try {
    const { draws: rawRecentDrawsForDisplay, latestDrawNo: latestDrawNoForDisplay } = await getMostRecentDraws(5);
    if (latestDrawNoForDisplay === null) {
      return { error: "최신 회차 정보를 가져올 수 없습니다.", latestDrawNo: null };
    }
    if (rawRecentDrawsForDisplay.length === 0) {
      return { error: "최근 당첨 번호를 가져올 수 없습니다.", latestDrawNo: latestDrawNoForDisplay };
    }
    const processedRecentDrawsForDisplay = processRawDraws(rawRecentDrawsForDisplay);
    
    if (numberOfDrawsForAnalysisStr) {
        let numDrawsToAnalyze = parseInt(numberOfDrawsForAnalysisStr, 10);
        if (isNaN(numDrawsToAnalyze) || numDrawsToAnalyze < 5 || numDrawsToAnalyze > latestDrawNoForDisplay) { // Max check against latestDrawNo
            return { 
              recentDraws: processedRecentDrawsForDisplay, 
              error: `분석할 회차 수는 5에서 ${latestDrawNoForDisplay} 사이여야 합니다.`,
              latestDrawNo: latestDrawNoForDisplay 
            };
        }
        const { draws: rawDrawsForAnalysis, latestDrawNo: latestDrawNoForAnalysisInner } = await getMostRecentDraws(numDrawsToAnalyze);
        if (latestDrawNoForAnalysisInner === null) { // Should not happen if latestDrawNoForDisplay is not null
             return { 
               recentDraws: processedRecentDrawsForDisplay, 
               error: "분석을 위한 과거 데이터를 가져오는 중 최신 회차 정보를 확인할 수 없습니다.",
               latestDrawNo: latestDrawNoForDisplay 
              };
        }
        if (rawDrawsForAnalysis.length < 5) { 
            return { 
                recentDraws: processedRecentDrawsForDisplay, 
                error: `분석을 위한 과거 당첨 데이터를 충분히 가져올 수 없습니다 (최소 5회차 필요, 현재 ${rawDrawsForAnalysis.length}회차).`,
                latestDrawNo: latestDrawNoForDisplay 
            };
        }
        const processedDrawsForAnalysis = processRawDraws(rawDrawsForAnalysis);
        const averages = calculateAveragesAndSummarize(processedDrawsForAnalysis, numDrawsToAnalyze);
        return { recentDraws: processedRecentDrawsForDisplay, averages, latestDrawNo: latestDrawNoForDisplay };
    }

    return { recentDraws: processedRecentDrawsForDisplay, latestDrawNo: latestDrawNoForDisplay };

  } catch (error) {
    console.error("Error in getInitialScientificLottoData:", error);
    return { error: error instanceof Error ? error.message : "데이터를 가져오는 중 오류 발생", latestDrawNo: null };
  }
}

interface GetLottoRecommendationsActionInput {
  includeNumbersStr?: string;
  excludeNumbersStr?: string;
  numberOfDrawsForAnalysisStr: string; 
}

export async function getLottoRecommendationsAction({
  includeNumbersStr,
  excludeNumbersStr,
  numberOfDrawsForAnalysisStr,
}: GetLottoRecommendationsActionInput): Promise<{
  llmResponse?: ScientificLottoRecommendationOutput;
  historicalDataSummaryForLLM?: string; 
  analysisDataForUI?: { 
    analyzedDrawsCount: number;
    averageSum: number;
    averageEvenOddRatio: string;
    frequentNumbers: { num: number; count: number }[];
    leastFrequentNumbers: { num: number; count: number }[];
    notAppearedNumbers: number[];
  };
  error?: string;
}> {
  try {
    const { latestDrawNo } = await getMostRecentDraws(1); // Fetch to get the absolute latest draw number
    if (latestDrawNo === null) {
        return { error: "LLM 추천을 위한 과거 데이터를 가져오는 중 최신 회차 정보를 확인할 수 없습니다." };
    }
    
    let numDrawsToAnalyze = parseInt(numberOfDrawsForAnalysisStr, 10);
    if (isNaN(numDrawsToAnalyze) || numDrawsToAnalyze < 5 || numDrawsToAnalyze > latestDrawNo) {
       return { error: `분석할 회차 수는 5회에서 ${latestDrawNo}회 사이여야 합니다.` };
    }
    
    const { draws: rawDrawsForAnalysis } = await getMostRecentDraws(numDrawsToAnalyze); 
    
    if (rawDrawsForAnalysis.length < 5) { 
      return { error: `LLM 추천을 위한 과거 당첨 데이터를 충분히 가져올 수 없습니다 (최소 5회차 필요, 현재 ${rawDrawsForAnalysis.length}회차).` };
    }
    const processedDrawsForAnalysis = processRawDraws(rawDrawsForAnalysis);
    const analysisSummary = calculateAveragesAndSummarize(processedDrawsForAnalysis, numDrawsToAnalyze);

    const parseNumbers = (str: string | undefined): number[] | undefined => {
      if (!str) return undefined;
      const nums = str.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 45);
      return nums.length > 0 ? Array.from(new Set(nums)) : undefined;
    };

    const includeNumbers = parseNumbers(includeNumbersStr);
    const excludeNumbers = parseNumbers(excludeNumbersStr);
    
    if (includeNumbers && includeNumbers.length > 6) {
        return { error: "포함할 숫자는 최대 6개까지 지정할 수 있습니다."};
    }
    if (excludeNumbers && excludeNumbers.length > 39) { 
        return { error: "제외할 숫자가 너무 많습니다."};
    }
    if (includeNumbers && excludeNumbers && includeNumbers.some(n => excludeNumbers.includes(n))) {
        return { error: "포함할 숫자와 제외할 숫자에 중복된 값이 있습니다." };
    }

    const inputForLLM: ScientificLottoRecommendationInput = {
      historicalDataSummary: analysisSummary.summaryForDisplay,
      includeNumbers: includeNumbers,
      excludeNumbers: excludeNumbers,
    };

    const llmResponse = await recommendScientificLottoNumbers(inputForLLM);
    return { 
        llmResponse, 
        historicalDataSummaryForLLM: analysisSummary.summaryForDisplay,
        analysisDataForUI: { 
            analyzedDrawsCount: analysisSummary.analyzedDrawsCount,
            averageSum: analysisSummary.averageSum,
            averageEvenOddRatio: analysisSummary.averageEvenOddRatio,
            frequentNumbers: analysisSummary.frequentNumbers,
            leastFrequentNumbers: analysisSummary.leastFrequentNumbers,
            notAppearedNumbers: analysisSummary.notAppearedNumbers || [],
        },
    };

  } catch (error) {
    console.error("Error in getLottoRecommendationsAction:", error);
    return { error: error instanceof Error ? error.message : "로또 번호 추천 중 오류 발생" };
  }
}

