/*
 * Call Scripts — generates personalized call scripts based on company type
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneCall, Copy, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Company {
  Название: string;
  Специализация: string;
  "Краткое описание": string;
  Сегмент: string;
  Тип?: string;
  Город: string;
}

const SCRIPTS: Record<string, { intro: string; hook: string; offer: string; close: string }> = {
  "Мебельная компания": {
    intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы специализируемся на декоративных покрытиях и жидком металле для мебельных производств.",
    hook: "Видел(а) ваши работы — впечатляет качество. Мы работаем с несколькими мебельными фабриками и помогаем им выделить продукцию за счёт уникальных покрытий: жидкий металл, декоративные текстуры, премиальная отделка фасадов.",
    offer: "Хотел(а) бы предложить вам бесплатные образцы наших покрытий, чтобы вы могли оценить качество на своих изделиях. Это может стать конкурентным преимуществом для вашей продукции.",
    close: "Могу отправить каталог и образцы на ваш адрес. Когда вам было бы удобно обсудить детали — может быть, на этой неделе?",
  },
  "Дизайн-студия / Архбюро": {
    intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы производим декоративные покрытия и жидкий металл для интерьерных проектов.",
    hook: "Знаю, что вы реализуете интересные дизайн-проекты. Наши покрытия часто используются дизайнерами для создания уникальных интерьерных решений — стеновые панели, мебельные фасады, декоративные элементы.",
    offer: "Хотел(а) бы предложить партнёрство: мы предоставляем дизайнерам расширенную палитру образцов и техническую поддержку при реализации проектов. Для ваших клиентов это будет эксклюзивное решение.",
    close: "Могу прислать портфолио реализованных проектов и организовать показ образцов в вашей студии. Когда вам было бы удобно?",
  },
  "HoReCa мебель": {
    intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы специализируемся на декоративных покрытиях для мебели и интерьеров в сегменте HoReCa.",
    hook: "Знаю, что вы производите мебель для отелей и ресторанов. В этом сегменте особенно важны износостойкость и премиальный внешний вид. Наши покрытия — жидкий металл, декоративные текстуры — выдерживают интенсивную эксплуатацию и выглядят впечатляюще.",
    offer: "Предлагаю рассмотреть наши решения для ваших текущих проектов. Мы можем подготовить образцы под конкретный объект и помочь с подбором покрытий под дизайн-концепцию.",
    close: "Могу отправить каталог с примерами для HoReCa-объектов. Есть ли у вас сейчас проекты, где это было бы актуально?",
  },
};

export default function CallScriptPanel({ company }: { company: Company }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const companyType = company.Тип || "Мебельная компания";
  const script = SCRIPTS[companyType] || SCRIPTS["Мебельная компания"];

  // Personalize script
  const personalize = (text: string) => {
    return text
      .replace(/\[Имя\]/g, "___")
      .replace(/\[Ваша компания\]/g, "___");
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(personalize(text));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullScript = () => {
    const full = `Компания: ${company.Название} (${company.Город})\nТип: ${companyType}\nСпециализация: ${company.Специализация || "—"}\n\n--- ПРИВЕТСТВИЕ ---\n${personalize(script.intro)}\n\n--- ЗАЦЕПКА ---\n${personalize(script.hook)}\n\n--- ПРЕДЛОЖЕНИЕ ---\n${personalize(script.offer)}\n\n--- ЗАКРЫТИЕ ---\n${personalize(script.close)}`;
    navigator.clipboard.writeText(full);
    setCopiedSection("full");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sections = [
    { key: "intro", label: "Приветствие", text: script.intro, emoji: "👋" },
    { key: "hook", label: "Зацепка", text: script.hook, emoji: "🎯" },
    { key: "offer", label: "Предложение", text: script.offer, emoji: "💎" },
    { key: "close", label: "Закрытие", text: script.close, emoji: "🤝" },
  ];

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Скрипт звонка для {companyType === "Дизайн-студия / Архбюро" ? "дизайн-студии" : companyType === "HoReCa мебель" ? "HoReCa" : "мебельной компании"}
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-muted/30 rounded-xl p-4 space-y-3 border border-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  Адаптирован для: <span className="text-foreground">{company.Название}</span>
                </p>
                <Button variant="outline" size="sm" onClick={copyFullScript} className="h-7 text-xs">
                  {copiedSection === "full" ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedSection === "full" ? "Скопировано!" : "Копировать всё"}
                </Button>
              </div>
              {sections.map((s) => (
                <div key={s.key} className="bg-card rounded-lg p-3 border border-border/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">{s.emoji} {s.label}</span>
                    <button
                      onClick={() => copyToClipboard(s.text, s.key)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copiedSection === s.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm text-card-foreground leading-relaxed">{personalize(s.text)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
