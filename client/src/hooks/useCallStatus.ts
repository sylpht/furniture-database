import { useState, useCallback, useEffect } from "react";

export type CallStatus = "not_called" | "in_progress" | "callback" | "rejected" | "interested";

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  not_called: "Не звонили",
  in_progress: "В работе",
  callback: "Перезвонить",
  rejected: "Отказ",
  interested: "Интерес",
};

export const CALL_STATUS_COLORS: Record<CallStatus, { bg: string; text: string; border: string }> = {
  not_called: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700" },
  in_progress: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  callback: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  rejected: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  interested: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
};

const STORAGE_KEY = "furniture_call_statuses";
const NOTES_KEY = "furniture_call_notes";

function loadStatuses(): Record<string, CallStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useCallStatus() {
  const [statuses, setStatuses] = useState<Record<string, CallStatus>>(loadStatuses);
  const [notes, setNotes] = useState<Record<string, string>>(loadNotes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const setStatus = useCallback((companyName: string, status: CallStatus) => {
    setStatuses((prev) => ({ ...prev, [companyName]: status }));
  }, []);

  const getStatus = useCallback(
    (companyName: string): CallStatus => {
      return statuses[companyName] || "not_called";
    },
    [statuses]
  );

  const setNote = useCallback((companyName: string, note: string) => {
    setNotes((prev) => ({ ...prev, [companyName]: note }));
  }, []);

  const getNote = useCallback(
    (companyName: string): string => {
      return notes[companyName] || "";
    },
    [notes]
  );

  const getStats = useCallback(() => {
    const counts: Record<CallStatus, number> = {
      not_called: 0,
      in_progress: 0,
      callback: 0,
      rejected: 0,
      interested: 0,
    };
    Object.values(statuses).forEach((s) => {
      counts[s]++;
    });
    return counts;
  }, [statuses]);

  return { setStatus, getStatus, setNote, getNote, getStats, statuses };
}
