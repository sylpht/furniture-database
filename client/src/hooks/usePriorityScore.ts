import { useState, useCallback, useMemo, useEffect } from "react";

export interface PriorityWeights {
  potential: number;      // Потенциал сотрудничества (0-10)
  premium: number;        // Премиум-сегмент (0-10)
  hasEmail: number;       // Наличие email (0-10)
  hasPhone: number;       // Наличие телефона (0-10)
  hasSite: number;        // Наличие сайта (0-10)
  customWork: number;     // Работа на заказ (0-10)
  designFocus: number;    // Дизайнерский уклон (0-10)
}

const DEFAULT_WEIGHTS: PriorityWeights = {
  potential: 8,
  premium: 7,
  hasEmail: 5,
  hasPhone: 4,
  hasSite: 3,
  customWork: 6,
  designFocus: 5,
};

const WEIGHTS_KEY = "furniture_priority_weights";

function loadWeights(): PriorityWeights {
  try {
    const raw = localStorage.getItem(WEIGHTS_KEY);
    return raw ? { ...DEFAULT_WEIGHTS, ...JSON.parse(raw) } : DEFAULT_WEIGHTS;
  } catch {
    return DEFAULT_WEIGHTS;
  }
}

export const WEIGHT_LABELS: Record<keyof PriorityWeights, string> = {
  potential: "Потенциал сотрудничества",
  premium: "Премиум-сегмент",
  hasEmail: "Наличие email",
  hasPhone: "Наличие телефона",
  hasSite: "Наличие сайта",
  customWork: "Работа на заказ",
  designFocus: "Дизайнерский уклон",
};

export function usePriorityScore() {
  const [weights, setWeights] = useState<PriorityWeights>(loadWeights);

  useEffect(() => {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
  }, [weights]);

  const updateWeight = useCallback((key: keyof PriorityWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, Math.min(10, value)) }));
  }, []);

  const resetWeights = useCallback(() => {
    setWeights(DEFAULT_WEIGHTS);
  }, []);

  const calculateScore = useCallback(
    (company: any): number => {
      let score = 0;
      const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
      if (maxScore === 0) return 0;

      const pot = (company["Потенциал сотрудничества"] || "").toLowerCase();
      const spec = ((company["Специализация"] || "") + " " + (company["Краткое описание"] || "") + " " + (company["Сегмент"] || "")).toLowerCase();

      // Potential
      if (pot.includes("высокий")) score += weights.potential;
      else if (pot.includes("средний")) score += weights.potential * 0.6;
      else if (pot.includes("низкий")) score += weights.potential * 0.3;

      // Premium
      if (/премиум|premium|люкс|элитн|дизайнерск/.test(spec)) score += weights.premium;
      else if (/ателье|авторск|кастом/.test(spec)) score += weights.premium * 0.7;

      // Contact channels
      if (company["Email"]) score += weights.hasEmail;
      if (company["Телефон"]) score += weights.hasPhone;
      if (company["Сайт"]) score += weights.hasSite;

      // Custom work
      if (/на заказ|индивидуальн|по проект|кастомн/.test(spec)) score += weights.customWork;

      // Design focus
      if (/дизайн|архитект|интерьер/.test(spec)) score += weights.designFocus;

      return Math.round((score / maxScore) * 100);
    },
    [weights]
  );

  return { weights, updateWeight, resetWeights, calculateScore };
}
