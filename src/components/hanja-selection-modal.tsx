
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { findHanjaForSyllable, type HanjaDetail } from '@/lib/hanja-utils';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HanjaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nameSyllables: string[];
  originalName: string;
  onComplete: (selections: (HanjaDetail | null)[]) => void;
  targetFieldName: string | null; 
}

const HANJAS_PER_PAGE = 12;

export function HanjaSelectionModal({
  isOpen,
  onClose,
  nameSyllables,
  originalName,
  onComplete,
  targetFieldName,
}: HanjaSelectionModalProps) {
  const { toast } = useToast();
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [selectedHanjaPerSyllable, setSelectedHanjaPerSyllable] = useState<(HanjaDetail | null)[]>([]);
  const [hanjaOptions, setHanjaOptions] = useState<HanjaDetail[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [currentPageForHanja, setCurrentPageForHanja] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedHanjaPerSyllable(new Array(nameSyllables.length).fill(null));
      setCurrentSyllableIndex(0);
      setCurrentPageForHanja(0); 
    }
  }, [isOpen, nameSyllables.length]); // nameSyllables.length ensures re-init if syllables change while open (though unlikely)

  useEffect(() => {
    if (isOpen && nameSyllables.length > 0 && currentSyllableIndex < nameSyllables.length) {
      setIsLoadingOptions(true);
      const currentPhoneticSyllable = nameSyllables[currentSyllableIndex];
      let options = findHanjaForSyllable(currentPhoneticSyllable);

      // Helper function to get the descriptive part of the reading (e.g., "높을" from "높을 고")
      const getDescriptivePart = (specificReading: string, syllable: string): string => {
        const pattern = new RegExp("\\s*" + syllable + "$");
        const desc = specificReading.replace(pattern, "").trim();
        return desc || specificReading; 
      };
      
      options.sort((a, b) => {
        const descA = getDescriptivePart(a.specificReading, currentPhoneticSyllable);
        const descB = getDescriptivePart(b.specificReading, currentPhoneticSyllable);
        
        const keyA = descA.length > 0 ? descA[0] : ''; // First character of descriptive part
        const keyB = descB.length > 0 ? descB[0] : '';
        
        return keyA.localeCompare(keyB, 'ko-KR'); // Sort by Korean alphabetical order
      });

      setHanjaOptions(options);
      setCurrentPageForHanja(0); 
      setIsLoadingOptions(false);
    }
  }, [isOpen, nameSyllables, currentSyllableIndex]);

  const handleHanjaSelect = (hanjaDetail: HanjaDetail) => {
    const newSelections = [...selectedHanjaPerSyllable];
    newSelections[currentSyllableIndex] = hanjaDetail;
    setSelectedHanjaPerSyllable(newSelections);
  };

  const handleKeepKorean = () => {
    const newSelections = [...selectedHanjaPerSyllable];
    newSelections[currentSyllableIndex] = null; 
    setSelectedHanjaPerSyllable(newSelections);
    handleNextSyllable(); 
  };

  const handleNextSyllable = () => {
    if (currentSyllableIndex < nameSyllables.length - 1) {
      setCurrentSyllableIndex(prev => prev + 1);
      setCurrentPageForHanja(0); 
    } else {
      handleComplete();
    }
  };
  
  const handlePreviousSyllable = () => {
    if (currentSyllableIndex > 0) {
      setCurrentSyllableIndex(prev => prev - 1);
      setCurrentPageForHanja(0); 
    }
  };

  const handleComplete = () => {
    onComplete(selectedHanjaPerSyllable);
    onClose();
  };

  if (!isOpen || nameSyllables.length === 0) {
    return null;
  }

  const currentSyllable = nameSyllables[currentSyllableIndex];
  const isLastSyllable = currentSyllableIndex === nameSyllables.length - 1;

  const totalPages = Math.ceil(hanjaOptions.length / HANJAS_PER_PAGE);
  const paginatedHanjaOptions = hanjaOptions.slice(
    currentPageForHanja * HANJAS_PER_PAGE,
    (currentPageForHanja + 1) * HANJAS_PER_PAGE
  );

  const getTargetFieldNameDisplay = () => {
    if (!targetFieldName) return "";
    if (targetFieldName === 'name') return "이름";
    if (targetFieldName === 'fatherName') return "아버지 성함";
    if (targetFieldName === 'motherName') return "어머니 성함";
    if (targetFieldName === 'person1.name') return "첫 번째 분 성함";
    if (targetFieldName === 'person2.name') return "두 번째 분 성함";
    return "이름";
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="break-words">한자 변환: {getTargetFieldNameDisplay()} </DialogTitle>
          <DialogDescription className="break-words">
            "{currentSyllable}" ({currentSyllableIndex + 1}/{nameSyllables.length}) 글자에 대한 한자를 선택하거나 한글로 유지하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-1"> {/* Changed to overflow-y-auto for vertical scroll only */}
          <div className="py-2">
            {isLoadingOptions ? (
              <p className="text-center py-4 text-muted-foreground break-words">옵션 로딩 중...</p>
            ) : paginatedHanjaOptions.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {paginatedHanjaOptions.map((opt, optIndex) => {
                  // Extract descriptive part for display
                  const descriptivePart = opt.specificReading.replace(new RegExp("\\s*" + nameSyllables[currentSyllableIndex] + "$"), "").trim();
                  return (
                    <Button
                      key={`${opt.hanja}-${optIndex}-${currentSyllableIndex}-${currentPageForHanja}`}
                      variant={selectedHanjaPerSyllable[currentSyllableIndex]?.hanja === opt.hanja ? "default" : "outline"}
                      onClick={() => handleHanjaSelect(opt)}
                      className="flex flex-col h-auto p-2 text-center text-xs" // text-xs applied here
                    >
                      <span className="text-2xl font-semibold">{opt.hanja}</span>
                      {/* Ensure descriptivePart or a fallback is shown */}
                      <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full break-words">{descriptivePart || opt.specificReading}</span>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground break-words">"{currentSyllable}"에 대한 추천 한자가 없습니다.</p>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 py-2 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPageForHanja(p => Math.max(0, p - 1))} 
              disabled={currentPageForHanja === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> 이전
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPageForHanja + 1} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPageForHanja(p => Math.min(totalPages - 1, p + 1))} 
              disabled={currentPageForHanja === totalPages - 1}
            >
              다음 <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        <DialogFooter className="mt-auto pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
          <Button 
            variant={selectedHanjaPerSyllable[currentSyllableIndex] === null && currentSyllableIndex < selectedHanjaPerSyllable.length && selectedHanjaPerSyllable[currentSyllableIndex] !== undefined ? "secondary" : "outline"} 
            onClick={handleKeepKorean}
            className="w-full break-words"
          >
            "{currentSyllable}" 한글로 유지
          </Button>
          <div className="flex gap-2 w-full">
            {currentSyllableIndex > 0 && (
              <Button variant="outline" onClick={handlePreviousSyllable} className="flex-1">
                이전
              </Button>
            )}
             <Button onClick={isLastSyllable ? handleComplete : handleNextSyllable} className="flex-1">
              {isLastSyllable ? "선택 완료" : "다음 글자"}
            </Button>
          </div>
        </DialogFooter>
         <DialogClose asChild>
            <button className="sr-only">닫기</button>
         </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

