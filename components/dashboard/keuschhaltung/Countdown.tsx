"use client";

import { useEffect, useState } from "react";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

type Props = {
  targetDate: string;
};

export function Countdown({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { value: timeLeft.days, label: "Tage" },
    { value: timeLeft.hours, label: "Std." },
    { value: timeLeft.minutes, label: "Min." },
    { value: timeLeft.seconds, label: "Sek." },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 my-4">
      {units.map(({ value, label }) => (
        <div
          key={label}
          className="flex flex-col items-center rounded-md py-3 px-2"
          style={{ background: "var(--card, #1a1a1a)" }}
        >
          <span
            className="text-[26px] font-medium leading-none tabular-nums"
            style={{ color: "#7B1111", fontVariantNumeric: "tabular-nums" }}
          >
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
}
