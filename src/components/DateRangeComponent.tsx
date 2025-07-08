import { isBefore, startOfYear } from "date-fns";
import addDays from "date-fns/addDays";
import addMonths from "date-fns/addMonths";
import startOfMonth from "date-fns/startOfMonth";
import React from "react";
import { DateRangePicker } from "rsuite";
import type { DateRange } from "rsuite/esm/DateRangePicker";

type DateRangeType = {
  onChange: (e: DateRange) => void;
  range: DateRange;
};

const minDate = new Date(2024, 8, 3);

const DateRangeComponent = ({ range, onChange }: DateRangeType) => {
  return (
    <DateRangePicker
      value={range}
      onChange={(e) => {
        if (e) {
          onChange(e);
          //   setActivePage(1);
          //   setRange(e);
        }
      }}
      ranges={[
        {
          label: "Bulan Ini",
          value: [startOfMonth(new Date()), new Date()],
          placement: "left",
        },
        {
          label: "Bulan Kemarin",
          value: [
            addMonths(startOfMonth(new Date()), -1),
            addDays(startOfMonth(new Date()), -1),
          ],
          placement: "left",
        },
        {
          label: "Tahun Ini",
          value: [startOfYear(new Date()), new Date()],
          placement: "left",
        },
        {
          label: "Tahun Kemarin",
          value: [minDate, addDays(startOfYear(new Date()), -1)],
          placement: "left",
        },
      ]}
      shouldDisableDate={(date) => isBefore(date, minDate)}
      placeholder="Placement left"
      style={{ width: 300 }}
      onShortcutClick={(shortcut, event) => {
        const ranges = shortcut.value;
        if (Array.isArray(ranges) && ranges.length === 2) {
          onChange(ranges);
        }
      }}
    />
  );
};

export default DateRangeComponent;
