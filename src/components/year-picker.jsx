"use client";

import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function YearPicker({ value, onChange, startYear = 2000, endYear }) {
  const currentYear = new Date().getFullYear();
  const maxYear = endYear || currentYear + 5;
  const [years, setYears] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const list = [];
    for (let y = maxYear; y >= startYear; y--) {
      list.push(y);
    }
    setYears(list);
  }, [startYear, endYear, maxYear]);

  const handleSelect = (year) => {
    onChange(year);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-32">
          {value || "Chọn năm"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <Command>
          <CommandInput placeholder="Tìm năm..." />
          <CommandEmpty>Không tìm thấy năm</CommandEmpty>
          <CommandGroup>
            {years.map((year) => (
              <CommandItem
                key={year}
                onSelect={() => handleSelect(year)}
                className="flex items-center justify-between"
              >
                {year}
                {String(year) === String(value) && <Check className="w-4 h-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
