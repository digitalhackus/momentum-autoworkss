"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react@0.487.0";
import { DayPicker, useDayPicker, useNavigation, CaptionNavigation } from "react-day-picker@8.10.1";

import { cn } from "./utils";

function getMonthNames(): string[] {
  return Array.from(
    { length: 12 },
    (_, i) => new Date(2000, i, 1).toLocaleString(undefined, { month: "long" })
  );
}

interface CalendarCaptionProps {
  id?: string;
  displayMonth: Date;
  displayIndex?: number;
}

const MIN_YEAR = 1000;
const MAX_YEAR = 9999;

function CalendarCaption({ id, displayMonth }: CalendarCaptionProps) {
  const { classNames, styles } = useDayPicker();
  const { goToMonth } = useNavigation();
  const [openDropdown, setOpenDropdown] = React.useState<"month" | null>(null);
  const [yearEditing, setYearEditing] = React.useState(false);
  const [yearInput, setYearInput] = React.useState("");
  const captionRef = React.useRef<HTMLDivElement>(null);
  const yearInputRef = React.useRef<HTMLInputElement>(null);

  const monthNames = React.useMemo(() => getMonthNames(), []);
  const currentYear = displayMonth.getFullYear();

  React.useEffect(() => {
    if (openDropdown === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (captionRef.current && !captionRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  React.useEffect(() => {
    if (yearEditing) {
      setYearInput(String(currentYear));
      yearInputRef.current?.focus();
      yearInputRef.current?.select();
    }
  }, [yearEditing, currentYear]);

  const applyYearInput = () => {
    const n = parseInt(yearInput, 10);
    if (!Number.isNaN(n) && n >= MIN_YEAR && n <= MAX_YEAR) {
      goToMonth(new Date(n, displayMonth.getMonth(), 1));
    }
    setYearEditing(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    goToMonth(new Date(currentYear, monthIndex, 1));
    setOpenDropdown(null);
  };

  const toggleMonth = () => setOpenDropdown((d) => (d === "month" ? null : "month"));

  const handleYearInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyYearInput();
    } else if (e.key === "Escape") {
      setYearEditing(false);
    }
  };

  const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYearInput(v);
  };

  const handleMonthKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpenDropdown(null);
    if (e.key === "Enter" || e.key === " ") e.preventDefault();
  };

  return (
    <div ref={captionRef} className={classNames.caption} style={styles.caption}>
      <CaptionNavigation displayMonth={displayMonth} id={id} />
      <div
        id={id}
        role="presentation"
        aria-live="polite"
        className={cn(classNames.caption_label, "flex items-center justify-center gap-1")}
        style={styles.caption_label}
      >
        <div className="relative">
          <button
            type="button"
            onClick={toggleMonth}
            onKeyDown={handleMonthKeyDown}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === "month"}
            aria-label="Select month"
            className="calendar-header-trigger rounded px-1.5 py-0.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme focus-visible:ring-offset-2"
          >
            {monthNames[displayMonth.getMonth()]}
          </button>
          {openDropdown === "month" && (
            <ul
              role="listbox"
              aria-label="Month"
              className="calendar-header-dropdown absolute left-1/2 top-full z-50 mt-1 max-h-[220px] min-w-[120px] -translate-x-1/2 overflow-auto rounded-lg border border-border bg-background py-1 shadow-lg"
            >
              {monthNames.map((name, i) => (
                <li key={name} role="option" aria-selected={displayMonth.getMonth() === i}>
                  <button
                    type="button"
                    onClick={() => handleMonthSelect(i)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-sm transition-colors focus:bg-theme/10 focus:text-theme focus:outline-none",
                      displayMonth.getMonth() === i
                        ? "bg-theme/10 text-theme font-medium"
                        : "text-foreground hover:bg-theme/10 hover:text-theme"
                    )}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative">
          {yearEditing ? (
            <input
              ref={yearInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Edit year"
              value={yearInput}
              onChange={handleYearInputChange}
              onBlur={applyYearInput}
              onKeyDown={handleYearInputKeyDown}
              className="calendar-header-year-input w-14 rounded border border-border bg-background px-1.5 py-0.5 text-center text-sm font-medium text-foreground focus:border-theme focus:outline-none focus:ring-1 focus:ring-theme"
            />
          ) : (
            <button
              type="button"
              onClick={() => setYearEditing(true)}
              aria-label="Edit year (click to type)"
              className="calendar-header-trigger rounded px-1.5 py-0.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme focus-visible:ring-offset-2"
            >
              {currentYear}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <div data-themed-calendar className={cn("rounded-xl border border-border bg-background shadow-lg p-3", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="p-0"
        classNames={{
          months: "flex flex-col sm:flex-row gap-2",
          month: "flex flex-col gap-4",
          caption: "flex justify-center pt-1 relative items-center w-full px-12",
          caption_label: "text-sm font-medium text-foreground",
          nav: "flex items-center gap-2",
          nav_button:
            "inline-flex items-center justify-center size-7 rounded-md border border-border bg-background text-theme hover:bg-theme-50 hover:text-theme-dark transition-colors cursor-pointer",
          nav_button_previous: "absolute left-0 top-1/2 -translate-y-1/2",
          nav_button_next: "absolute right-0 top-1/2 -translate-y-1/2",
          table: "w-full",
          head_row: "flex flex-nowrap w-full",
          head_cell:
            "text-muted-foreground w-8 h-8 flex shrink-0 items-center justify-center rounded-md text-[0.8rem] font-normal",
          row: "flex flex-nowrap w-full mt-2 gap-0",
          cell: cn(
            "relative w-8 h-8 flex shrink-0 items-center justify-center p-0 text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md",
          ),
          day: cn(
            "size-8 min-w-8 min-h-8 flex items-center justify-center p-0 font-normal rounded-md transition-colors cursor-pointer",
            "hover:bg-theme-50 hover:text-theme-dark",
            "aria-selected:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme focus-visible:ring-offset-2",
          ),
          day_range_start:
            "day-range-start aria-selected:bg-theme aria-selected:text-white",
          day_range_end:
            "day-range-end aria-selected:bg-theme aria-selected:text-white",
          day_selected:
            "!bg-theme !text-white !border-0 hover:!bg-theme-dark focus:!bg-theme focus:!ring-theme",
          day_today:
            "rdp-day_today !bg-theme !text-white !rounded-full font-medium hover:!bg-theme-dark aria-selected:!bg-theme aria-selected:!text-white",
          day_outside:
            "day-outside text-muted-foreground opacity-60 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent",
          day_range_middle:
            "aria-selected:bg-theme-50 aria-selected:text-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          Caption: CalendarCaption,
          IconLeft: ({ className: iconClass, ...rest }) => (
            <ChevronLeft className={cn("size-4 text-theme", iconClass)} {...rest} />
          ),
          IconRight: ({ className: iconClass, ...rest }) => (
            <ChevronRight className={cn("size-4 text-theme", iconClass)} {...rest} />
          ),
        }}
        {...props}
      />
    </div>
  );
}

export { Calendar };
