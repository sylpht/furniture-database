/*
 * Call Scripts — generates personalized call scripts based on company type, tone, and product
 * Enhanced with tone selection (official/friendly) and product choice
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneCall, Copy, Check, ChevronDown, ChevronUp, Sparkles, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Company {
  Название: string;
  Специализация: string;
  "Краткое описание": string;
  Сегмент: string;
  Тип?: string;
  Город: string;
}

type Tone = "official" | "friendly";
type Product = "liquid_metal" | "textures" | "coatings" | "all";

interface ScriptVariant {
  intro: string;
  hook: string;
  offer: string;
  close: string;
}

// Product descriptions
const PRODUCTS: Record<Product, string> = {
  liquid_metal: "жидкий металл",
  textures: "декоративные текстуры",
  coatings: "премиальные покрытия",
  all: "декоративные покрытия и жидкий металл",
};

// Scripts with different tones
const SCRIPTS: Record<string, Record<Tone, Record<Product, ScriptVariant>>> = {
  "Мебельная компания": {
    official: {
      liquid_metal: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы специализируемся на жидком металле для мебельных производств.",
        hook: "Я изучил(а) ваше портфолио и вижу, что вы производите качественную мебель. Жидкий металл позволяет создавать уникальные, премиальные фасады, которые выделяют продукцию на рынке.",
        offer: "Предлагаю рассмотреть образцы жидкого металла для ваших текущих проектов. Это может стать значительным конкурентным преимуществом.",
        close: "Готов(а) отправить каталог и образцы. Когда вам было бы удобно обсудить возможности сотрудничества?",
      },
      textures: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы производим декоративные текстуры для мебельных фасадов.",
        hook: "Ваша продукция отличается качеством. Декоративные текстуры позволяют расширить линейку и предложить клиентам больше вариантов дизайна.",
        offer: "Предлагаю бесплатные образцы текстур для оценки на ваших изделиях.",
        close: "Могу отправить подборку образцов. Есть ли у вас интерес к расширению ассортимента?",
      },
      coatings: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы разработали линейку премиальных покрытий для мебели.",
        hook: "Я вижу, что вы работаете на премиум-сегменте. Наши покрытия обеспечивают высокую износостойкость и эстетическую привлекательность.",
        offer: "Предлагаю провести презентацию образцов и обсудить возможности применения в ваших проектах.",
        close: "Когда вам было бы удобно встретиться или провести видеопрезентацию?",
      },
      all: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы специализируемся на декоративных покрытиях и жидком металле для мебельных производств.",
        hook: "Видел(а) ваши работы — впечатляет качество. Мы работаем с несколькими мебельными фабриками и помогаем им выделить продукцию за счёт уникальных покрытий: жидкий металл, декоративные текстуры, премиальная отделка фасадов.",
        offer: "Хотел(а) бы предложить вам бесплатные образцы наших покрытий, чтобы вы могли оценить качество на своих изделиях. Это может стать конкурентным преимуществом для вашей продукции.",
        close: "Могу отправить каталог и образцы на ваш адрес. Когда вам было бы удобно обсудить детали — может быть, на этой неделе?",
      },
    },
    friendly: {
      liquid_metal: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем классный жидкий металл для мебели.",
        hook: "Я посмотрел(а) ваши проекты и они мне очень понравились! Жидкий металл — это то, что может сделать вашу мебель по-настоящему уникальной и запоминающейся.",
        offer: "Хочу предложить вам попробовать наши образцы. Думаю, вашим клиентам это очень понравится!",
        close: "Давайте встретимся или я пришлю вам образцы. Когда вам удобнее?",
      },
      textures: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы создаём крутые декоративные текстуры для мебели.",
        hook: "Ваша мебель выглядит отлично! Декоративные текстуры помогут вам предложить клиентам ещё больше вариантов и выделиться от конкурентов.",
        offer: "Хочу показать вам наши образцы. Уверен(а), они вам понравятся!",
        close: "Давайте обсудим это. Когда вам удобнее всего?",
      },
      coatings: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем супер-премиальные покрытия для мебели.",
        hook: "Я вижу, что вы работаете на высоком уровне. Наши покрытия — это идеальное дополнение к вашей продукции!",
        offer: "Хотел(а) бы показать вам, что мы можем сделать. Думаю, вы будете впечатлены!",
        close: "Давайте найдём время для встречи или видеозвонка?",
      },
      all: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем крутые покрытия и жидкий металл для мебели.",
        hook: "Мне очень нравятся ваши работы! Мы помогли уже многим фабрикам выделиться с помощью уникальных покрытий и жидкого металла.",
        offer: "Хотел(а) бы предложить вам попробовать наши образцы. Уверен(а), они вам понравятся!",
        close: "Давайте обсудим это. Когда вам было бы удобнее всего?",
      },
    },
  },
  "Дизайн-студия / Архбюро": {
    official: {
      liquid_metal: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы производим жидкий металл для интерьерных проектов.",
        hook: "Я знаком(а) с вашими проектами. Жидкий металл открывает новые возможности для создания уникальных интерьерных решений.",
        offer: "Предлагаю провести презентацию образцов и обсудить возможности применения в ваших проектах.",
        close: "Готов(а) организовать показ образцов в вашей студии. Когда вам было бы удобно?",
      },
      textures: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы разработали коллекцию декоративных текстур для интерьеров.",
        hook: "Ваши проекты отличаются оригинальностью. Декоративные текстуры позволяют реализовать самые смелые дизайнерские идеи.",
        offer: "Предлагаю расширить вашу палитру материалов за счёт наших текстур.",
        close: "Могу организовать презентацию. Когда вам было бы удобно встретиться?",
      },
      coatings: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы производим премиальные декоративные покрытия для интерьеров.",
        hook: "Я вижу, что вы работаете на премиум-сегменте и уделяете внимание деталям. Наши покрытия помогут вам создавать по-настоящему эксклюзивные интерьеры.",
        offer: "Предлагаю стать партнёром и получить доступ к полной коллекции образцов.",
        close: "Давайте обсудим условия сотрудничества. Когда вам удобно?",
      },
      all: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы производим декоративные покрытия и жидкий металл для интерьерных проектов.",
        hook: "Знаю, что вы реализуете интересные дизайн-проекты. Наши покрытия часто используются дизайнерами для создания уникальных интерьерных решений — стеновые панели, мебельные фасады, декоративные элементы.",
        offer: "Хотел(а) бы предложить партнёрство: мы предоставляем дизайнерам расширенную палитру образцов и техническую поддержку при реализации проектов. Для ваших клиентов это будет эксклюзивное решение.",
        close: "Могу прислать портфолио реализованных проектов и организовать показ образцов в вашей студии. Когда вам было бы удобно?",
      },
    },
    friendly: {
      liquid_metal: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем жидкий металл для интерьеров.",
        hook: "Ваши проекты просто восхитительны! Жидкий металл — это то, что может сделать интерьер по-настоящему впечатляющим.",
        offer: "Хочу показать вам наши образцы и обсудить, как это может помочь вашим проектам.",
        close: "Давайте встретимся? Я уверен(а), вам понравится!",
      },
      textures: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы создаём крутые декоративные текстуры для интерьеров.",
        hook: "Мне очень нравятся ваши работы! Декоративные текстуры помогут вам реализовать ещё более смелые идеи.",
        offer: "Хочу показать вам, что мы можем предложить. Думаю, это вам очень пригодится!",
        close: "Давайте обсудим это. Когда вам удобнее?",
      },
      coatings: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем супер-премиальные покрытия для интерьеров.",
        hook: "Я вижу, что вы работаете на высоком уровне и не боитесь экспериментировать. Наши покрытия — это идеально для ваших проектов!",
        offer: "Хотел(а) бы показать вам образцы и обсудить возможности.",
        close: "Давайте найдём время для встречи?",
      },
      all: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем крутые покрытия и жидкий металл для интерьеров.",
        hook: "Ваши проекты мне очень нравятся! Мы помогли уже многим дизайнерам создавать по-настоящему уникальные интерьеры.",
        offer: "Хотел(а) бы предложить вам попробовать наши материалы. Уверен(а), они вам понравятся!",
        close: "Давайте обсудим это. Когда вам было бы удобнее?",
      },
    },
  },
  "HoReCa мебель": {
    official: {
      liquid_metal: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы специализируемся на жидком металле для мебели в сегменте HoReCa.",
        hook: "Я знаю, что вы производите мебель для отелей и ресторанов. Жидкий металл обеспечивает не только премиальный внешний вид, но и высокую износостойкость.",
        offer: "Предлагаю рассмотреть жидкий металл для ваших текущих проектов HoReCa.",
        close: "Могу отправить каталог с примерами для отелей и ресторанов. Есть ли у вас сейчас проекты?",
      },
      textures: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы производим декоративные текстуры для мебели HoReCa.",
        hook: "В сегменте HoReCa важна не только функциональность, но и эстетика. Декоративные текстуры помогают создать атмосферу и выделиться.",
        offer: "Предлагаю образцы текстур, специально разработанные для HoReCa-объектов.",
        close: "Давайте обсудим, какие текстуры подойдут для ваших проектов?",
      },
      coatings: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы производим премиальные покрытия для мебели HoReCa.",
        hook: "Мебель для отелей и ресторанов должна быть прочной и красивой. Наши покрытия идеально подходят для этих требований.",
        offer: "Предлагаю провести презентацию образцов, специально подобранных для вашего типа проектов.",
        close: "Когда вам было бы удобно обсудить детали?",
      },
      all: {
        intro: "Добрый день! Меня зовут [Имя], компания [Ваша компания]. Мы специализируемся на декоративных покрытиях для мебели и интерьеров в сегменте HoReCa.",
        hook: "Знаю, что вы производите мебель для отелей и ресторанов. В этом сегменте особенно важны износостойкость и премиальный внешний вид. Наши покрытия — жидкий металл, декоративные текстуры — выдерживают интенсивную эксплуатацию и выглядят впечатляюще.",
        offer: "Предлагаю рассмотреть наши решения для ваших текущих проектов. Мы можем подготовить образцы под конкретный объект и помочь с подбором покрытий под дизайн-концепцию.",
        close: "Могу отправить каталог с примерами для HoReCa-объектов. Есть ли у вас сейчас проекты, где это было бы актуально?",
      },
    },
    friendly: {
      liquid_metal: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем жидкий металл для мебели в ресторанах и отелях.",
        hook: "Я знаю, что вы работаете с крутыми проектами! Жидкий металл — это то, что сделает мебель по-настоящему впечатляющей и долговечной.",
        offer: "Хочу показать вам образцы и обсудить, как это может помочь вашим проектам.",
        close: "Давайте встретимся? Уверен(а), вам понравится!",
      },
      textures: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем крутые текстуры для мебели в HoReCa.",
        hook: "Ваши проекты выглядят отлично! Декоративные текстуры помогут создать ещё более уникальную атмосферу.",
        offer: "Хочу показать вам образцы, которые идеально подойдут для ваших объектов.",
        close: "Давайте обсудим это. Когда вам удобнее?",
      },
      coatings: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем супер-прочные и красивые покрытия для мебели в ресторанах и отелях.",
        hook: "Я вижу, что вы работаете на высоком уровне. Наши покрытия — это идеально для HoReCa!",
        offer: "Хотел(а) бы показать вам, что мы можем предложить. Думаю, это вам очень пригодится!",
        close: "Давайте встретимся или проведём видеозвонок?",
      },
      all: {
        intro: "Привет! Я [Имя] из [Ваша компания]. Мы делаем крутые покрытия и жидкий металл для мебели в ресторанах и отелях.",
        hook: "Мне очень нравятся ваши проекты! Мы помогли уже многим компаниям создавать мебель, которая выглядит супер и служит долго.",
        offer: "Хотел(а) бы предложить вам попробовать наши материалы. Уверен(а), они вам понравятся!",
        close: "Давайте обсудим это. Когда вам было бы удобнее?",
      },
    },
  },
};

export function getFullScript(company: Company, tone: Tone, product: Product): string {
  const companyType = company.Тип || "Мебельная компания";
  const scriptVariants = SCRIPTS[companyType] || SCRIPTS["Мебельная компания"];
  const script = scriptVariants[tone][product];
  
  const personalize = (text: string) => {
    return text
      .replace(/\[Имя\]/g, "___")
      .replace(/\[Ваша компания\]/g, "___");
  };
  
  return `${personalize(script.intro)}\n\n${personalize(script.hook)}\n\n${personalize(script.offer)}\n\n${personalize(script.close)}`;
}

export default function CallScriptPanel({ company }: { company: Company }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>("official");
  const [product, setProduct] = useState<Product>("all");
  const [showSettings, setShowSettings] = useState(false);

  const companyType = company.Тип || "Мебельная компания";
  const scriptVariants = SCRIPTS[companyType] || SCRIPTS["Мебельная компания"];
  const script = scriptVariants[tone][product];

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
    const full = `Компания: ${company.Название} (${company.Город})\nТип: ${companyType}\nСпециализация: ${company.Специализация || "—"}\nТон: ${tone === "official" ? "Официальный" : "Дружелюбный"}\nПродукт: ${PRODUCTS[product]}\n\n--- ПРИВЕТСТВИЕ ---\n${personalize(script.intro)}\n\n--- ЗАЦЕПКА ---\n${personalize(script.hook)}\n\n--- ПРЕДЛОЖЕНИЕ ---\n${personalize(script.offer)}\n\n--- ЗАКРЫТИЕ ---\n${personalize(script.close)}`;
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

  const getCompanyTypeLabel = () => {
    if (companyType === "Дизайн-студия / Архбюро") return "дизайн-студии";
    if (companyType === "HoReCa мебель") return "HoReCa";
    return "мебельной компании";
  };

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Скрипт звонка для {getCompanyTypeLabel()}
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Адаптирован для: <span className="text-foreground">{company.Название}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-7 text-xs"
                  >
                    <Settings2 className="w-3 h-3 mr-1" />
                    Параметры
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyFullScript} className="h-7 text-xs">
                    {copiedSection === "full" ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedSection === "full" ? "Скопировано!" : "Копировать всё"}
                  </Button>
                </div>
              </div>

              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card rounded-lg p-3 border border-border/50 space-y-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Тон разговора:</p>
                    <div className="flex gap-2">
                      <Button
                        variant={tone === "official" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTone("official")}
                        className="text-xs h-7"
                      >
                        Официальный
                      </Button>
                      <Button
                        variant={tone === "friendly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTone("friendly")}
                        className="text-xs h-7"
                      >
                        Дружелюбный
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Продукт:</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={product === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProduct("all")}
                        className="text-xs h-7"
                      >
                        Все продукты
                      </Button>
                      <Button
                        variant={product === "liquid_metal" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProduct("liquid_metal")}
                        className="text-xs h-7"
                      >
                        Жидкий металл
                      </Button>
                      <Button
                        variant={product === "textures" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProduct("textures")}
                        className="text-xs h-7"
                      >
                        Текстуры
                      </Button>
                      <Button
                        variant={product === "coatings" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProduct("coatings")}
                        className="text-xs h-7"
                      >
                        Покрытия
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">
                  {tone === "official" ? "📋 Официальный" : "😊 Дружелюбный"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {PRODUCTS[product]}
                </Badge>
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
