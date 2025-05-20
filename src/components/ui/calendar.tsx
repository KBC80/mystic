
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type CaptionProps, useNavigation } from "react-day-picker"
import { ko } from "date-fns/locale";
import { format, getYear, getMonth, setYear, setMonth } from "date-fns";

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onSelect?: (date: Date | undefined) => void;
};


function CustomCaption(props: CaptionProps & { 
  onBackToMonthView?: () => void;
  onBackToYearView?: () => void;
  currentView: 'days' | 'months' | 'years';
  showYearMonthPicker?: boolean;
  onYearClick?: () => void;
  onMonthClick?: () => void;
 }) {
  const { 
    displayMonth, 
    onBackToMonthView, 
    onBackToYearView, 
    currentView,
    // showYearMonthPicker, // This prop seems unused in the CustomCaption logic itself
    onYearClick,
    onMonthClick
  } = props;
  const { goToMonth, nextMonth, previousMonth } = useNavigation();


  if (currentView === 'years') {
    // Year selection UI is handled by renderYearView, so CustomCaption for 'years' view is minimal.
    // It primarily acts as a title placeholder if DayPicker were to render it directly.
    // The actual navigation (prev/next decade) is in renderYearView.
    return (
      <div className="flex justify-center items-center pt-1 relative">
        {/* Title for year view is handled by renderYearView's header */}
      </div>
    );
  }

  if (currentView === 'months') {
    // Month selection UI is handled by renderMonthView.
    // CustomCaption for 'months' view shows the selected year and allows going back to year view.
    return (
      <div className="flex justify-center items-center pt-1 relative">
         <Button
            variant="ghost"
            size="sm"
            onClick={onBackToYearView} // This should navigate back to year view
            className="absolute left-1"
          >
          <ChevronLeft className="h-4 w-4" />
          연도
        </Button>
        <h2 className="text-sm font-medium cursor-pointer hover:underline" onClick={onYearClick}>
          {format(displayMonth, "yyyy년", { locale: ko })}
        </h2>
      </div>
    );
  }

  // Day View Caption
  return (
    <div className="flex justify-between items-center pt-1 relative px-1">
       <Button
            variant="ghost"
            size="sm"
            onClick={onBackToMonthView} // This should navigate back to month view
            className="absolute left-1 flex items-center"
          >
          <ChevronLeft className="h-4 w-4 mr-1" />
          월
        </Button>
      <div className="flex-1 text-center">
        <span className="text-sm font-medium cursor-pointer hover:underline" onClick={onMonthClick}>
          {format(displayMonth, "MMMM", { locale: ko })}
        </span>
        <span className="text-sm font-medium ml-1 cursor-pointer hover:underline" onClick={onYearClick}>
           {format(displayMonth, "yyyy", { locale: ko })}
        </span>
      </div>
      <div className="flex items-center">
        <Button
            onClick={() => previousMonth && goToMonth(previousMonth)}
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={!previousMonth}
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
            onClick={() => nextMonth && goToMonth(nextMonth)}
            variant="outline"
            size="icon"
            className="h-7 w-7 ml-1"
            disabled={!nextMonth}
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  fromYear: fromYearProp,
  toYear: toYearProp,
  ...props
}: CalendarProps) {
  const [currentView, setCurrentView] = React.useState<'years' | 'months' | 'days'>('years');
  // displayDate will hold the currently selected year/month for navigation purposes
  // It's initialized to `selected` if provided, otherwise today.
  // It's updated when year/month is selected in respective views.
  const [displayDate, setDisplayDate] = React.useState<Date>(selected || new Date()); 
  
  // yearPage tracks the starting year of the current decade view in 'years' mode
  const [yearPage, setYearPage] = React.useState<number>(getYear(selected || new Date()));

  const fromYear = fromYearProp || getYear(new Date()) - 100;
  const toYear = toYearProp || getYear(new Date()) + 0; // Default to current year

  React.useEffect(() => {
    if (selected) {
      setDisplayDate(selected); // Ensure displayDate reflects the selected date if it changes
      // setCurrentView('days'); // Optionally switch to day view if a date is selected
      setYearPage(getYear(selected)); // Center year view on selected year's decade
    } else {
      // If no date is selected, default to showing the decade of `toYear`
      setDisplayDate(setYear(new Date(), toYear)); // Set displayDate to the `toYear`
      setYearPage(toYear); 
      setCurrentView('years');
    }
  }, [selected, toYear]);


  const handleYearSelect = (year: number) => {
    setDisplayDate(setYear(displayDate, year)); // Update displayDate with the chosen year
    setCurrentView('months');
  };

  const handleMonthSelect = (monthIndex: number) => {
    // Create a new date object for displayDate to ensure re-render
    // Use the year from the current displayDate and the new monthIndex
    setDisplayDate(prev => setMonth(setYear(new Date(), getYear(prev)), monthIndex));
    setCurrentView('days');
  };
  
  const handleDaySelect = (date: Date | undefined) => {
    if (onSelect) {
      onSelect(date);
    }
    // After selecting a day, the parent component (e.g., Popover) should handle closing.
    // We don't reset the view here.
  };

  const renderYearView = () => {
    const yearsPerPage = 12; // For a 3x4 grid
    // Calculate the first year of the decade to display based on yearPage
    // Ensure yearPage stays within [fromYear, toYear] bounds for calculations
    const currentDecadeStartYear = Math.floor((Math.min(Math.max(yearPage, fromYear), toYear) - fromYear) / yearsPerPage) * yearsPerPage + fromYear;
    
    const years: number[] = [];
    for (let i = 0; i < yearsPerPage; i++) {
      const year = currentDecadeStartYear + i;
      if (year >= fromYear && year <= toYear) {
        years.push(year);
      }
    }

    // If years array is empty (e.g., yearPage is beyond `toYear`), adjust to show the last valid page
    if (years.length === 0 && currentDecadeStartYear > fromYear) {
        const lastPageStartYear = Math.max(fromYear, toYear - yearsPerPage + 1);
         for (let i = 0; i < yearsPerPage; i++) {
            const year = lastPageStartYear + i;
            if (year >= fromYear && year <= toYear) {
                years.push(year);
            }
        }
    }


    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYearPage(Math.max(fromYear, yearPage - yearsPerPage))}
            disabled={currentDecadeStartYear <= fromYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold">
            연도 선택 ({years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : `${currentDecadeStartYear} - ${currentDecadeStartYear + yearsPerPage -1}`})
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYearPage(Math.min(toYear, yearPage + yearsPerPage))}
            disabled={currentDecadeStartYear + yearsPerPage > toYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant={getYear(displayDate) === year && currentView !== 'days' ? "default" : "outline"}
              size="sm"
              onClick={() => handleYearSelect(year)}
              className="w-full"
            >
              {year}년
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const months = Array.from({ length: 12 }, (_, i) => i); // 0 for January, 11 for December
    return (
      <div className="p-3">
         {/* Header for Month View, showing selected year and back button */}
         <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentView('years')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> 연도 선택
            </Button>
            <div className="text-sm font-semibold">
                {format(displayDate, "yyyy년", { locale: ko })} - 월 선택
            </div>
            <div className="w-[calc(2rem+8px)]"></div> {/* Placeholder for alignment */}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((monthIndex) => (
            <Button
              key={monthIndex}
              variant={getMonth(displayDate) === monthIndex && currentView !== 'days' ? "default" : "outline"}
              size="sm"
              onClick={() => handleMonthSelect(monthIndex)}
              className="w-full"
            >
              {format(setMonth(new Date(), monthIndex), "MMMM", { locale: ko })}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption_label: "hidden", // We use CustomCaption
          nav: "space-x-1 flex items-center", // Default nav buttons, hidden by CustomCaption essentially
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1", // These are for default nav, overridden by CustomCaption
          nav_button_next: "absolute right-1", // These are for default nav, overridden by CustomCaption
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        locale={ko}
        month={displayDate} // Crucial: DayPicker's month is controlled by displayDate
        selected={selected}
        onSelect={handleDaySelect} // This is DayPicker's onSelect for days
        components={{
          Caption: (captionProps) => <CustomCaption 
            {...captionProps} 
            displayMonth={displayDate} // Pass the controlled displayDate to CustomCaption
            currentView="days" 
            onBackToMonthView={() => setCurrentView('months')}
            onYearClick={() => setCurrentView('years')} // Allow jumping to year view from day caption
            onMonthClick={() => setCurrentView('months')} // Allow jumping to month view from day caption
           />,
        }}
        fromYear={fromYear}
        toYear={toYear}
        captionLayout="dropdown-buttons" // Enable built-in year/month dropdowns if preferred for day view
        fromMonth={fromYear ? new Date(fromYear, 0) : undefined}
        toMonth={toYear ? new Date(toYear, 11) : undefined}
        disabled={props.disabled} // Pass through other DayPicker props
        // onMonthChange={setDisplayDate} // Update displayDate if user changes month via DayPicker's internal nav (if any)
        // onYearChange={(year) => setDisplayDate(setYear(displayDate, year))} // Update displayDate for year changes
        {...props}
      />
    );
  };


  // Main render logic based on currentView
  if (currentView === 'years') {
    return renderYearView();
  }
  if (currentView === 'months') {
    return renderMonthView();
  }
  // Default to day view
  return renderDayView();
}
Calendar.displayName = "Calendar"

export { Calendar }

