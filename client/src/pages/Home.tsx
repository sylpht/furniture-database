/*
 * Design: Scandinavian Data Canvas — light/dark switchable
 * Features: card/table view, call statuses, priority scoring, interactive map,
 *           call scripts, quick actions, CSV export, site checker, HoReCa
 */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Building2, MapPin, Phone, Mail, Globe, Filter,
  ChevronDown, ChevronUp, Star, TrendingUp, Users, BarChart3,
  ExternalLink, X, Sparkles, Target, Briefcase, LayoutGrid,
  Table2, Moon, Sun, SlidersHorizontal, MessageSquare,
  PhoneCall, PhoneOff, PhoneMissed, CheckCircle2, Clock,
  Map as MapIcon, Palette, Download, UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { useCallStatus, CALL_STATUS_LABELS, CALL_STATUS_COLORS, type CallStatus } from "@/hooks/useCallStatus";
import { usePriorityScore, WEIGHT_LABELS, type PriorityWeights } from "@/hooks/usePriorityScore";
import RussiaMap from "@/components/RussiaMap";
import CallScriptPanel, { getFullScript } from "@/components/CallScripts";
import QuickActions from "@/components/QuickActions";
import { SiteCheckerPanel, SiteStatusBadge, useSiteChecker } from "@/components/SiteChecker";
import { exportToCSV } from "@/lib/exportCSV";
import { CompanyModal } from "@/components/CompanyModal";
import rawData from "@/data.json";

interface Company {
  Название: string;
  Город: string;
  Регион: string;
  Адрес: string;
  Телефон: string;
  WhatsApp: string;
  Telegram: string;
  Email: string;
  Сайт: string;
  Соцсети: string;
  Специализация: string;
  "Краткое описание": string;
  Сегмент: string;
  "Потенциал сотрудничества": string;
  "Первый шаг контакта": string;
  Источник: string;
  Тип?: string;
}

interface CityStats {
  city: string;
  region: string;
  total: number;
  high: number;
  medium: number;
  low: number;
  min: number;
}

const data = rawData as {
  companies: Company[];
  city_stats: CityStats[];
  city_coords: Record<string, number[]>;
  total: number;
  top_count: number;
  premium_count: number;
  regions_count: number;
  cities_count: number;
  studios_count: number;
  furniture_count: number;
  horeca_count: number;
};

const COLORS = { high: "#0d9488", medium: "#f59e0b", low: "#f97316", min: "#94a3b8" };
const PIE_COLORS = ["#0d9488", "#f59e0b", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function getPotentialLevel(pot: string): string {
  if (pot.includes("ВЫСОКИЙ")) return "high";
  if (pot.includes("СРЕДНИЙ")) return "medium";
  if (pot.includes("НИЗКИЙ")) return "low";
  return "min";
}
function getPotentialLabel(pot: string): string {
  if (pot.includes("ВЫСОКИЙ")) return "Высокий";
  if (pot.includes("СРЕДНИЙ")) return "Средний";
  if (pot.includes("НИЗКИЙ")) return "Низкий";
  return "Минимальный";
}

/* ========== RUSSIAN PLURALIZATION ========== */
function pluralize(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const lastDigit = abs % 10;
  if (abs >= 11 && abs <= 19) return many;
  if (lastDigit === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4) return few;
  return many;
}

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); } else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
}

/* ========== CALL STATUS SELECTOR ========== */
function CallStatusSelector({ companyName, getStatus, setStatus }: { companyName: string; getStatus: (n: string) => CallStatus; setStatus: (n: string, s: CallStatus) => void }) {
  const [open, setOpen] = useState(false);
  const current = getStatus(companyName);
  const colors = CALL_STATUS_COLORS[current];
  const statusIcons: Record<CallStatus, React.ReactNode> = {
    not_called: <PhoneOff className="w-3 h-3" />, in_progress: <PhoneCall className="w-3 h-3" />,
    callback: <Clock className="w-3 h-3" />, rejected: <PhoneMissed className="w-3 h-3" />, interested: <CheckCircle2 className="w-3 h-3" />,
  };
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors ${colors.bg} ${colors.text} ${colors.border}`}>
        {statusIcons[current]}{CALL_STATUS_LABELS[current]}<ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
          {(Object.keys(CALL_STATUS_LABELS) as CallStatus[]).map((s) => (
            <button key={s} onClick={() => { setStatus(companyName, s); setOpen(false); }} className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted transition-colors ${current === s ? "font-bold" : ""}`}>
              {statusIcons[s]}<span className={CALL_STATUS_COLORS[s].text}>{CALL_STATUS_LABELS[s]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== TYPE BADGE ========== */
function TypeBadge({ type }: { type?: string }) {
  if (type === "Дизайн-студия / Архбюро" || type === "Дизайн-студия") return <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5"><Palette className="w-3 h-3" />Студия</Badge>;
  if (type === "HoReCa мебель") return <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5 border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400"><UtensilsCrossed className="w-3 h-3" />HoReCa</Badge>;
  return null;
}

/* ========== COMPANY CARD ========== */
function CompanyCard({ company, index, priorityScore, getStatus, setStatus, onSelect, siteStatus }: {
  company: Company; index: number; priorityScore: number;
  getStatus: (n: string) => CallStatus; setStatus: (n: string, s: CallStatus) => void;
  onSelect: (c: Company) => void;
  siteStatus?: any;
}) {
  const level = getPotentialLevel(company["Потенциал сотрудничества"]);
  const borderColor = level === "high" ? "border-l-teal-500" : level === "medium" ? "border-l-amber-500" : level === "low" ? "border-l-orange-400" : "border-l-slate-300 dark:border-l-slate-600";

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, "");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.015, 0.3), duration: 0.3 }}>
      <Card className={`border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer bg-card group`} onClick={() => onSelect(company)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h3 className="font-heading font-bold text-base sm:text-lg text-card-foreground truncate group-hover:text-primary transition-colors">{company["Название"]}</h3>
                {level === "high" && <Star className="w-4 h-4 text-teal-500 fill-teal-500 shrink-0" />}
                <TypeBadge type={company.Тип} />
                <SiteStatusBadge status={siteStatus} />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{company["Город"]}</span>
                {company["Телефон"] ? (
                  <a 
                    href={`tel:${formatPhone(company["Телефон"].split(',')[0])}`} 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {company["Телефон"].split(",")[0]}
                  </a>
                ) : (
                  <span className="flex items-center gap-1 italic text-muted-foreground/50"><Phone className="w-3.5 h-3.5" />Нет телефона</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <div className="hidden sm:flex items-center gap-2">
                <QuickActions phone={company["Телефон"]} email={company["Email"]} site={company["Сайт"]} whatsapp={company["WhatsApp"]} telegram={company["Telegram"]} companyName={company["Название"]} scriptText={getFullScript(company, "official", "all")} />
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{ borderColor: priorityScore >= 70 ? "#0d9488" : priorityScore >= 40 ? "#f59e0b" : "#94a3b8", color: priorityScore >= 70 ? "#0d9488" : priorityScore >= 40 ? "#f59e0b" : "#94a3b8" }}>
                {priorityScore}
              </div>
              <CallStatusSelector companyName={company["Название"]} getStatus={getStatus} setStatus={setStatus} />
              <Badge variant="secondary" className={`text-xs whitespace-nowrap ${
                level === "high" ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
                : level === "medium" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                : level === "low" ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
                : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
              }`}>{getPotentialLabel(company["Потенциал сотрудничества"])}</Badge>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          {company["Специализация"] && <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{company["Специализация"]}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [minPriority, setMinPriority] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { getStatus, setStatus } = useCallStatus();
  const { getScore, weights, setWeights } = usePriorityScore();
  const { checkSite, results: siteResults, isChecking } = useSiteChecker();

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const filteredCompanies = useMemo(() => {
    return data.companies.filter((c) => {
      const matchesSearch =
        c["Название"].toLowerCase().includes(search.toLowerCase()) ||
        c["Город"].toLowerCase().includes(search.toLowerCase()) ||
        c["Специализация"].toLowerCase().includes(search.toLowerCase());
      const matchesRegion = !selectedRegion || c["Регион"] === selectedRegion;
      const matchesCity = !selectedCity || c["Город"] === selectedCity;
      const matchesType = !selectedType || c["Тип"] === selectedType;
      const matchesPriority = getScore(c) >= minPriority;
      return matchesSearch && matchesRegion && matchesCity && matchesType && matchesPriority;
    }).sort((a, b) => getScore(b) - getScore(a));
  }, [search, selectedRegion, selectedCity, selectedType, minPriority, getScore]);

  const stats = useMemo(() => {
    const total = filteredCompanies.length;
    const high = filteredCompanies.filter(c => getPotentialLevel(c["Потенциал сотрудничества"]) === "high").length;
    const regions = new Set(filteredCompanies.map(c => c["Регион"])).size;
    const cities = new Set(filteredCompanies.map(c => c["Город"])).size;
    return { total, high, regions, cities };
  }, [filteredCompanies]);

  const regionOptions = useMemo(() => Array.from(new Set(data.companies.map(c => c["Регион"]))).sort(), []);
  const cityOptions = useMemo(() => {
    const base = selectedRegion ? data.companies.filter(c => c["Регион"] === selectedRegion) : data.companies;
    return Array.from(new Set(base.map(c => c["Город"]))).sort();
  }, [selectedRegion]);
  const typeOptions = useMemo(() => Array.from(new Set(data.companies.map(c => c["Тип"]).filter(Boolean))).sort(), []);

  const mapCities = useMemo(() => {
    return data.city_stats.map(s => ({
      ...s,
      lat: data.city_coords[s.city]?.[0],
      lng: data.city_coords[s.city]?.[1],
    })).filter(c => c.lat && c.lng);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-bold leading-none tracking-tight">FurnitureDB</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1">B2B Outreach Engine</p>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, городу или специализации..."
                className="pl-10 bg-muted/50 border-none focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2" onClick={() => exportToCSV(filteredCompanies)}>
              <Download className="w-4 h-4" /> Экспорт
            </Button>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <PhoneCall className="w-4 h-4" /> Начать обзвон
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Всего компаний", value: stats.total, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Высокий потенциал", value: stats.high, icon: Star, color: "text-teal-500", bg: "bg-teal-500/10" },
            { label: "Регионов", value: stats.regions, icon: MapPin, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Городов", value: stats.cities, icon: MapIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="border-none bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold"><AnimatedCounter value={stat.value} /></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="list" className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="list" className="gap-2"><LayoutGrid className="w-4 h-4" /> Список</TabsTrigger>
              <TabsTrigger value="map" className="gap-2"><MapIcon className="w-4 h-4" /> Карта</TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="w-4 h-4" /> Аналитика</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64 md:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="w-4 h-4" /> Фильтры
                {(selectedRegion || selectedCity || selectedType || minPriority > 0) && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">!</Badge>
                )}
              </Button>
              <div className="hidden sm:flex border rounded-lg p-1 bg-muted/50">
                <Button variant={view === "card" ? "secondary" : "ghost"} size="sm" onClick={() => setView("card")} className="h-8 w-8 p-0">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setView("table")} className="h-8 w-8 p-0">
                  <Table2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                <Card className="border-dashed">
                  <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Регион</label>
                      <select className="w-full bg-background border rounded-md h-9 px-3 text-sm" value={selectedRegion || ""} onChange={(e) => { setSelectedRegion(e.target.value || null); setSelectedCity(null); }}>
                        <option value="">Все регионы</option>
                        {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Город</label>
                      <select className="w-full bg-background border rounded-md h-9 px-3 text-sm" value={selectedCity || ""} onChange={(e) => setSelectedCity(e.target.value || null)}>
                        <option value="">Все города</option>
                        {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Тип компании</label>
                      <select className="w-full bg-background border rounded-md h-9 px-3 text-sm" value={selectedType || ""} onChange={(e) => setSelectedType(e.target.value || null)}>
                        <option value="">Все типы</option>
                        {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Мин. приоритет</label>
                        <span className="text-xs font-bold text-primary">{minPriority}</span>
                      </div>
                      <Slider value={[minPriority]} max={100} step={5} onValueChange={([v]) => setMinPriority(v)} className="py-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <TabsContent value="list" className="mt-0">
            <div className="grid grid-cols-1 gap-4">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company, i) => (
                  <CompanyCard
                    key={company["Название"]}
                    company={company}
                    index={i}
                    priorityScore={getScore(company)}
                    getStatus={getStatus}
                    setStatus={setStatus}
                    onSelect={handleCompanySelect}
                    siteStatus={siteResults[company["Сайт"]]}
                  />
                ))
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">Ничего не найдено</h3>
                  <p className="text-muted-foreground">Попробуйте изменить параметры фильтрации</p>
                  <Button variant="link" onClick={() => { setSearch(""); setSelectedRegion(null); setSelectedCity(null); setSelectedType(null); setMinPriority(0); }}>Сбросить все фильтры</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <RussiaMap cities={mapCities} onCityClick={(city) => { setSelectedCity(city); }} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider">Топ-10 городов по количеству компаний</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.city_stats.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="city" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider">Распределение по типам</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Студии', value: data.studios_count },
                          { name: 'Мебель', value: data.furniture_count },
                          { name: 'HoReCa', value: data.horeca_count }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <CompanyModal 
        company={selectedCompany} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold">FurnitureDB</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Профессиональная база данных мебельных компаний и дизайн-студий России для B2B-аутрича и развития партнерской сети.
          </p>
          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 Furniture Database Engine. Все права защищены.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Политика конфиденциальности</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
