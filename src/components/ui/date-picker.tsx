"use client";

import * as React from "react";
import { formatDisplayDate } from "../../utils/dateFormat";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { cn } from "./utils";

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Optional: show Clear and Today buttons in the popover */
  showActions?: boolean;
}

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "dd/mm/yy",
  disabled = false,
  className,
  showActions = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? new Date(value + "T12:00:00") : undefined;
  const isInvalid = value && Number.isNaN(selectedDate!.getTime());

  const handleSelect = (d: Date | undefined) => {
    if (d) onChange(d.toISOString().slice(0, 10));
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleToday = () => {
    onChange(getTodayISO());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 rounded-md border border-border bg-input-background px-3 text-sm",
            "hover:bg-background focus-visible:ring-2 focus-visible:ring-theme/20 focus-visible:border-theme",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
          {value && !isInvalid ? formatDisplayDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-border bg-background rounded-xl shadow-lg"
        align="start"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
        {showActions && (
          <div className="flex items-center justify-between gap-2 p-2 border-t border-border">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-sm text-theme hover:text-theme-dark font-medium transition-colors cursor-pointer"
              onClick={handleToday}
            >
              Today
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
