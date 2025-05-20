
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, Archive, Search, AlertTriangle, User, Gift, ExternalLink } from 'lucide-react'; 
import { fetchHistoricalDraw, getRecentHistoricalDraws, type HistoricalDrawData } from './actions';

const getLottoBallColorClass = (number: number): string => {
  if (number >= 1 && number <= 10) return 'bg-yellow-400 text-black';
  if (number >= 11 && number <= 20) return 'bg-blue-500 text-white';
  if (number >= 21 && number <= 30) return 'bg-red-500 text-white';
  if (number >= 31 && number <= 40) return 'bg-gray-600 text-white';
  if (number >= 41 && number <= 45) return 'bg-green-500 text-white';
  return 'bg-gray-300 text-black';
};

const LottoBall = ({ number, size = 'medium' }: { number: number, size?: 'small' | 'medium' }) => {
  const sizeClasses = size === 'small' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-lg';
  return (
    <div className={`flex items-center justify-center rounded-full font-bold shadow-md ${sizeClasses} ${getLottoBallColorClass(number)}`}>
      {number}
    </div>
  );
};

const formatCurrency = (amount: number) => {
  if (amount === 0) return '0원';
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};

export default function LottoHistoryPage() {
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentDraws, setRecentDraws] = useState<HistoricalDrawData[]>([]);
  const [selectedDraw, setSelectedDraw] = useState<HistoricalDrawData | null>(null);
  const [drawNoInput, setDrawNoInput] = useState<string>("");
  const [latestDrawNo, setLatestDrawNo] = useState<number | null>(null);

  useEffect(() => {
    async function loadRecentDraws() {
      setIsLoadingRecent(true);
      setError(null);
      const data = await getRecentHistoricalDraws(5);
      if (data.error) {
        setError(data.error);
      } else {
        setRecentDraws(data.recentDraws || []);
        if (data.latestDrawNo) {
            setLatestDrawNo(data.latestDrawNo);
            setDrawNoInput(data.latestDrawNo.toString()); // Initialize input with latest draw number
        }
      }
      setIsLoadingRecent(false);
    }
    loadRecentDraws();
  }, []);

  const handleFetchDraw = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const numDrawNo = parseInt(drawNoInput, 10);
    if (isNaN(numDrawNo) || numDrawNo <= 0) {
      setError("유효한 회차 번호를 입력해주세요.");
      return;
    }
    setIsLoadingSelected(true);
    setError(null);
    setSelectedDraw(null);
    const data = await fetchHistoricalDraw(numDrawNo);
    if (data.error) {
      setError(data.error);
    } else {
      setSelectedDraw(data.drawDetails || null);
    }
    setIsLoadingSelected(false);
  };

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Archive className="text-primary h-6 w-6" /> 역대 당첨번호 조회
          </CardTitle>
          <CardDescription className="break-words">
            과거 로또 당첨 번호, 1등 당첨자 수 및 1인당 당첨금을 회차별로 조회합니다.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {isLoadingRecent && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground break-words">최근 당첨 정보 로딩 중...</p>
        </div>
      )}

      {error && !isLoadingRecent && !isLoadingSelected && (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
      )}

      {!isLoadingRecent && recentDraws.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">최근 5회차 당첨 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>회차</TableHead>
                    <TableHead>추첨일</TableHead>
                    <TableHead>당첨번호 + 보너스</TableHead>
                    <TableHead className="text-center">1등 당첨자/금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDraws.map((draw) => (
                    <TableRow key={draw.drwNo}>
                      <TableCell>{draw.drwNo}회</TableCell>
                      <TableCell>{draw.drwNoDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                          {draw.numbers.map(num => <LottoBall key={`recent-${draw.drwNo}-${num}`} number={num} size="small" />)}
                          <span className="mx-1 text-muted-foreground">+</span>
                          <LottoBall number={draw.bnusNo} size="small" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground"/> {draw.firstPrzwnerCo}명
                          </div>
                          <div className="text-xs text-muted-foreground break-words">
                              {draw.firstPrzwnerCo > 0 ? `(각 ${formatCurrency(draw.firstWinamnt)})` : '(당첨자 없음)'}
                          </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">특정 회차 조회</CardTitle>
          {latestDrawNo && <CardDescription className="break-words">조회 가능 범위: 1회 ~ {latestDrawNo}회</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchDraw} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-grow w-full sm:w-auto">
              <label htmlFor="drawNoInput" className="block text-sm font-medium text-foreground mb-1">회차 번호 입력</label>
              <Input
                id="drawNoInput"
                type="number"
                value={drawNoInput}
                onChange={(e) => setDrawNoInput(e.target.value)}
                placeholder="회차 번호를 입력하세요"
                min="1"
                max={latestDrawNo?.toString()}
                className="max-w-xs"
              />
            </div>
            <Button type="submit" disabled={isLoadingSelected} className="w-full sm:w-auto">
              {isLoadingSelected ? <LoadingSpinner size={20} /> : <><Search className="mr-2 h-4 w-4" /> 조회하기</>}
            </Button>
          </form>

          {isLoadingSelected && (
            <div className="flex justify-center items-center p-6 mt-4">
              <LoadingSpinner size={28} />
              <p className="ml-2 text-muted-foreground break-words">선택한 회차 정보를 불러오는 중...</p>
            </div>
          )}

          {error && isLoadingSelected === false && ( // Show error only if not loading another request
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>조회 오류</AlertTitle>
                <AlertDescription className="break-words">{error}</AlertDescription>
            </Alert>
          )}

          {selectedDraw && !isLoadingSelected && (
            <Card className="mt-6 bg-secondary/30 shadow">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{selectedDraw.drwNo}회 당첨 정보</CardTitle>
                <CardDescription className="break-words">추첨일: {selectedDraw.drwNoDate}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-md text-foreground">당첨 번호</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDraw.numbers.map(num => <LottoBall key={`selected-${selectedDraw.drwNo}-${num}`} number={num} />)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-md text-foreground">보너스 번호</h4>
                  <LottoBall number={selectedDraw.bnusNo} />
                </div>
                <div>
                  <h4 className="font-semibold text-md text-foreground">1등 당첨자 수</h4>
                  <p className="text-muted-foreground flex items-center gap-1"><User className="h-5 w-5"/> {selectedDraw.firstPrzwnerCo}명</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md text-foreground">1등 당첨금 (1인당)</h4>
                  <p className="text-muted-foreground flex items-center gap-1 break-words">
                    <Gift className="h-5 w-5 text-yellow-500"/> 
                    {selectedDraw.firstPrzwnerCo > 0 ? formatCurrency(selectedDraw.firstWinamnt) : '당첨자 없음'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
        <a href="https://dhlottery.co.kr" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            동행복권 사이트 바로가기
          </Button>
        </a>
      </div>
    </div>
  );
}

