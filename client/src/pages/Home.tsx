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
import CallScriptPanel from "@/components/CallScripts";
import QuickActions from "@/components/QuickActions";
import { SiteCheckerPanel, SiteStatusBadge, useSiteChecker } from "@/components/SiteChecker";
import { exportToCSV } from "@/lib/exportCSV";
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
  if (type === "Дизайн-студия / Архбюро") return <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5"><Palette className="w-3 h-3" />Студия</Badge>;
  if (type === "HoReCa мебель") return <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5 border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400"><UtensilsCrossed className="w-3 h-3" />HoReCa</Badge>;
  return null;
}

/* ========== COMPANY CARD ========== */
function CompanyCard({ company, index, priorityScore, getStatus, setStatus, getNote, setNote, siteStatus }: {
  company: Company; index: number; priorityScore: number;
  getStatus: (n: string) => CallStatus; setStatus: (n: string, s: CallStatus) => void;
  getNote: (n: string) => string; setNote: (n: string, v: string) => void;
  siteStatus?: any;
}) {
  const [expanded, setExpanded] = useState(false);
  const level = getPotentialLevel(company["Потенциал сотрудничества"]);
  const borderColor = level === "high" ? "border-l-teal-500" : level === "medium" ? "border-l-amber-500" : level === "low" ? "border-l-orange-400" : "border-l-slate-300 dark:border-l-slate-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.015, 0.3), duration: 0.3 }}>
      <Card className={`border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer bg-card`} onClick={() => setExpanded(!expanded)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h3 className="font-heading font-bold text-base sm:text-lg text-card-foreground truncate">{company["Название"]}</h3>
                {level === "high" && <Star className="w-4 h-4 text-teal-500 fill-teal-500 shrink-0" />}
                <TypeBadge type={company.Тип} />
                <SiteStatusBadge status={siteStatus} />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{company["Город"]}</span>
                {company["Телефон"] && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{company["Телефон"].split(",")[0]}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <QuickActions phone={company["Телефон"]} email={company["Email"]} site={company["Сайт"]} whatsapp={company["WhatsApp"]} telegram={company["Telegram"]} />
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
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
          {company["Специализация"] && <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{company["Специализация"]}</p>}

          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {company["Краткое описание"] && <p className="text-sm text-muted-foreground">{company["Краткое описание"]}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {company["Регион"] && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 shrink-0" /><span>{company["Регион"]}</span></div>}
                    {company["Адрес"] && <div className="flex items-start gap-2 text-muted-foreground"><Building2 className="w-4 h-4 mt-0.5 shrink-0" /><span className="break-words">{company["Адрес"]}</span></div>}
                    {company["Email"] && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4 shrink-0" /><a href={`mailto:${company["Email"]}`} className="text-primary hover:underline break-all" onClick={(e) => e.stopPropagation()}>{company["Email"]}</a></div>}
                    {company["Сайт"] && <div className="flex items-center gap-2 text-muted-foreground"><Globe className="w-4 h-4 shrink-0" /><a href={company["Сайт"].startsWith("http") ? company["Сайт"] : `https://${company["Сайт"]}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate" onClick={(e) => e.stopPropagation()}>{company["Сайт"].replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></div>}
                    {company["Телефон"] && <div className="flex items-start gap-2 text-muted-foreground"><Phone className="w-4 h-4 mt-0.5 shrink-0" /><span className="break-words">{company["Телефон"]}</span></div>}
                    {company["Соцсети"] && <div className="flex items-start gap-2 text-muted-foreground"><ExternalLink className="w-4 h-4 mt-0.5 shrink-0" /><span className="break-all text-xs">{company["Соцсети"]}</span></div>}
                  </div>
                  {company["Сегмент"] && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {company["Сегмент"].split(/[,/]/).map((seg, i) => <Badge key={i} variant="outline" className="text-xs">{seg.trim()}</Badge>)}
                    </div>
                  )}
                  {company["Первый шаг контакта"] && (
                    <div className="bg-primary/5 rounded-lg p-3 mt-2">
                      <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1"><Target className="w-3.5 h-3.5" />Рекомендация для первого контакта:</p>
                      <p className="text-sm text-primary/80">{company["Первый шаг контакта"]}</p>
                    </div>
                  )}
                  {/* Call Script */}
                  <CallScriptPanel company={company} />
                  {/* Notes */}
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1"><MessageSquare className="w-3.5 h-3.5" />Заметка:</label>
                    <textarea value={getNote(company["Название"])} onChange={(e) => setNote(company["Название"], e.target.value)} placeholder="Добавить заметку..." className="w-full text-sm bg-muted/50 border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" rows={2} />
                  </div>
                  {company["Источник"] && <p className="text-xs text-muted-foreground mt-2">Источник: {company["Источник"]}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ========== TABLE VIEW ========== */
function CompanyTable({ companies, priorityScores, getStatus, setStatus, siteResults, sortColumn, sortDir, onSort }: {
  companies: Company[]; priorityScores: Map<string, number>;
  getStatus: (n: string) => CallStatus; setStatus: (n: string, s: CallStatus) => void;
  siteResults: Record<string, any>; sortColumn: string; sortDir: "asc" | "desc"; onSort: (c: string) => void;
}) {
  const SortHeader = ({ col, label, className = "" }: { col: string; label: string; className?: string }) => (
    <th className={`py-2.5 px-3 text-left font-semibold text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors select-none whitespace-nowrap ${className}`} onClick={() => onSort(col)}>
      <span className="flex items-center gap-1">{label}{sortColumn === col && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
    </th>
  );
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 sticky top-0 z-10">
          <tr className="border-b border-border">
            <SortHeader col="score" label="Балл" className="w-16" />
            <SortHeader col="name" label="Компания" />
            <SortHeader col="city" label="Город" />
            <th className="py-2.5 px-3 text-left font-semibold text-card-foreground">Действия</th>
            <th className="py-2.5 px-3 text-left font-semibold text-card-foreground">Телефон</th>
            <th className="py-2.5 px-3 text-left font-semibold text-card-foreground">Email</th>
            <SortHeader col="potential" label="Потенциал" />
            <th className="py-2.5 px-3 text-left font-semibold text-card-foreground">Статус</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => {
            const level = getPotentialLevel(c["Потенциал сотрудничества"]);
            const score = priorityScores.get(c["Название"]) || 0;
            return (
              <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="py-2 px-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2"
                    style={{ borderColor: score >= 70 ? "#0d9488" : score >= 40 ? "#f59e0b" : "#94a3b8", color: score >= 70 ? "#0d9488" : score >= 40 ? "#f59e0b" : "#94a3b8" }}>{score}</span>
                </td>
                <td className="py-2 px-3 font-medium text-card-foreground max-w-[200px]">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">{c["Название"]}</span>
                    <TypeBadge type={c.Тип} />
                    <SiteStatusBadge status={siteResults[c["Название"]]} />
                  </div>
                </td>
                <td className="py-2 px-3 text-muted-foreground">{c["Город"]}</td>
                <td className="py-2 px-3"><QuickActions phone={c["Телефон"]} email={c["Email"]} site={c["Сайт"]} whatsapp={c["WhatsApp"]} /></td>
                <td className="py-2 px-3 text-muted-foreground text-xs max-w-[150px] truncate">{c["Телефон"]}</td>
                <td className="py-2 px-3">{c["Email"] && <a href={`mailto:${c["Email"]}`} className="text-primary hover:underline text-xs truncate block max-w-[180px]">{c["Email"]}</a>}</td>
                <td className="py-2 px-3">
                  <Badge variant="secondary" className={`text-[10px] ${
                    level === "high" ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                    : level === "medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : level === "low" ? "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    : "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>{getPotentialLabel(c["Потенциал сотрудничества"])}</Badge>
                </td>
                <td className="py-2 px-3"><CallStatusSelector companyName={c["Название"]} getStatus={getStatus} setStatus={setStatus} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ========== MAIN PAGE ========== */
export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { getStatus, setStatus, getNote, setNote, getStats } = useCallStatus();
  const { weights, updateWeight, resetWeights, calculateScore } = usePriorityScore();
  const { results: siteResults, isRunning: siteChecking, progress: siteProgress, checkAll: checkSites } = useSiteChecker();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedPotential, setSelectedPotential] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCallStatus, setSelectedCallStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const cities = useMemo(() => {
    const s = new Set<string>();
    data.companies.forEach((c) => { if (c["Город"]) s.add(c["Город"]); });
    return Array.from(s).sort();
  }, []);

  const priorityScores = useMemo(() => {
    const map = new Map<string, number>();
    data.companies.forEach((c) => map.set(c["Название"], calculateScore(c)));
    return map;
  }, [calculateScore]);

  const filteredCompanies = useMemo(() => {
    let result = data.companies.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || c["Название"].toLowerCase().includes(q) || c["Специализация"]?.toLowerCase().includes(q) || c["Город"]?.toLowerCase().includes(q) || c["Регион"]?.toLowerCase().includes(q) || c["Краткое описание"]?.toLowerCase().includes(q);
      const matchesCity = selectedCity === "all" || c["Город"] === selectedCity;
      const matchesPotential = selectedPotential === "all" || getPotentialLevel(c["Потенциал сотрудничества"]) === selectedPotential;
      const matchesType = selectedType === "all" || (selectedType === "studio" ? c.Тип === "Дизайн-студия / Архбюро" : selectedType === "horeca" ? c.Тип === "HoReCa мебель" : c.Тип === "Мебельная компания");
      const matchesCallStatus = selectedCallStatus === "all" || getStatus(c["Название"]) === selectedCallStatus;
      return matchesSearch && matchesCity && matchesPotential && matchesType && matchesCallStatus;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "score") cmp = (priorityScores.get(a["Название"]) || 0) - (priorityScores.get(b["Название"]) || 0);
      else if (sortBy === "name") cmp = a["Название"].localeCompare(b["Название"]);
      else if (sortBy === "city") cmp = (a["Город"] || "").localeCompare(b["Город"] || "");
      else if (sortBy === "potential") {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2, min: 3 };
        cmp = (order[getPotentialLevel(a["Потенциал сотрудничества"])] || 3) - (order[getPotentialLevel(b["Потенциал сотрудничества"])] || 3);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [searchQuery, selectedCity, selectedPotential, selectedType, selectedCallStatus, sortBy, sortDir, priorityScores, getStatus]);

  const handleTableSort = (col: string) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const cityChartData = useMemo(() => data.city_stats.filter((c) => c.total >= 2).slice(0, 15).map((c) => ({
    name: c.city.length > 14 ? c.city.slice(0, 12) + "…" : c.city, fullName: c.city, total: c.total, high: c.high, medium: c.medium,
  })), []);

  const potentialDistribution = useMemo(() => {
    let high = 0, medium = 0, low = 0, min = 0;
    data.companies.forEach((c) => { const l = getPotentialLevel(c["Потенциал сотрудничества"]); if (l === "high") high++; else if (l === "medium") medium++; else if (l === "low") low++; else min++; });
    return [{ name: "Высокий", value: high, color: COLORS.high }, { name: "Средний", value: medium, color: COLORS.medium }, { name: "Низкий", value: low, color: COLORS.low }, { name: "Минимальный", value: min, color: COLORS.min }];
  }, []);

  const typeDistribution = useMemo(() => {
    const types: Record<string, number> = {};
    data.companies.forEach((c) => { const t = c.Тип || "Мебельная компания"; types[t] = (types[t] || 0) + 1; });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, []);

  const segmentDistribution = useMemo(() => {
    const segs: Record<string, number> = {};
    data.companies.forEach((c) => { if (c["Сегмент"]) c["Сегмент"].split(/[,/]/).forEach((s) => { const seg = s.trim(); if (seg.length > 1) { const key = seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase(); segs[key] = (segs[key] || 0) + 1; } }); });
    return Object.entries(segs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, []);

  const mapCities = useMemo(() => {
    return data.city_stats.filter((c) => data.city_coords[c.city]).map((c) => ({
      city: c.city, total: c.total, high: c.high, lat: data.city_coords[c.city][0], lng: data.city_coords[c.city][1],
    }));
  }, []);

  const callStats = getStats();
  const hasActiveFilters = searchQuery || selectedCity !== "all" || selectedPotential !== "all" || selectedType !== "all" || selectedCallStatus !== "all";
  const resetFilters = () => { setSearchQuery(""); setSelectedCity("all"); setSelectedPotential("all"); setSelectedType("all"); setSelectedCallStatus("all"); };

  const handleExportCSV = () => exportToCSV(filteredCompanies, `furniture_companies_${filteredCompanies.length}.csv`);
  const handleCheckSites = () => checkSites(filteredCompanies.map((c) => ({ name: c["Название"], site: c["Сайт"] })));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, rgba(13,148,136,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.2) 0%, transparent 40%)` }} />
        </div>
        <div className="container relative py-10 sm:py-14 lg:py-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-teal-400" /></div>
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">B2B Аутрич</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-white/70 hover:text-white hover:bg-white/10">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
              База мебельных компаний<span className="text-teal-400"> России</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              {data.total} компаний: {data.furniture_count} мебельных + {data.studios_count} дизайн-студий + {data.horeca_count || 0} HoReCa.
              {data.cities_count} городов, {data.regions_count} регионов.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mt-8">
            {[
              { label: "Компаний", value: data.total, icon: Building2, color: "text-teal-400" },
              { label: "Городов", value: data.cities_count, icon: MapPin, color: "text-amber-400" },
              { label: "Регионов", value: data.regions_count, icon: BarChart3, color: "text-blue-400" },
              { label: "ТОП", value: data.top_count, icon: Star, color: "text-emerald-400" },
              { label: "Мебель", value: data.furniture_count, icon: Briefcase, color: "text-orange-400" },
              { label: "Студии", value: data.studios_count, icon: Palette, color: "text-purple-400" },
              { label: "HoReCa", value: data.horeca_count || 0, icon: UtensilsCrossed, color: "text-rose-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
                <p className="text-xl sm:text-2xl font-heading font-bold text-white"><AnimatedCounter value={stat.value} /></p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
          {Object.values(callStats).some((v) => v > 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-2 mt-4">
              {(Object.entries(callStats) as [CallStatus, number][]).filter(([, v]) => v > 0).map(([s, v]) => (
                <span key={s} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${CALL_STATUS_COLORS[s].bg} ${CALL_STATUS_COLORS[s].text}`}>
                  {CALL_STATUS_LABELS[s]}: {v}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <Tabs defaultValue="companies" className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="bg-card border border-border p-1 rounded-xl shadow-sm flex-wrap h-auto">
              <TabsTrigger value="companies" className="rounded-lg text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Users className="w-4 h-4 mr-1.5" />Компании</TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><BarChart3 className="w-4 h-4 mr-1.5" />Аналитика</TabsTrigger>
              <TabsTrigger value="map" className="rounded-lg text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><MapIcon className="w-4 h-4 mr-1.5" />Карта</TabsTrigger>
              <TabsTrigger value="top" className="rounded-lg text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Sparkles className="w-4 h-4 mr-1.5" />ТОП</TabsTrigger>
              <TabsTrigger value="priority" className="rounded-lg text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><SlidersHorizontal className="w-4 h-4 mr-1.5" />Веса</TabsTrigger>
              <TabsTrigger value="tools" className="rounded-lg text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Globe className="w-4 h-4 mr-1.5" />Инструменты</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 text-xs"><Download className="w-3.5 h-3.5 mr-1" />CSV ({filteredCompanies.length})</Button>
              <Button variant={viewMode === "cards" ? "default" : "outline"} size="sm" onClick={() => setViewMode("cards")} className="h-8"><LayoutGrid className="w-4 h-4" /></Button>
              <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")} className="h-8"><Table2 className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* COMPANIES TAB */}
          <TabsContent value="companies" className="space-y-4">
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Поиск по названию, городу, специализации..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={showFilters ? "bg-primary/10 border-primary/30 text-primary" : ""}>
                    <Filter className="w-4 h-4 mr-1.5" />Фильтры{hasActiveFilters && <span className="ml-1.5 w-2 h-2 rounded-full bg-primary" />}
                  </Button>
                </div>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="pt-4 mt-4 border-t border-border space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Город</label>
                            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                              <option value="all">Все города ({cities.length})</option>
                              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Потенциал</label>
                            <select value={selectedPotential} onChange={(e) => setSelectedPotential(e.target.value)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                              <option value="all">Все уровни</option>
                              <option value="high">Высокий</option>
                              <option value="medium">Средний</option>
                              <option value="low">Низкий</option>
                              <option value="min">Минимальный</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Тип</label>
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                              <option value="all">Все типы</option>
                              <option value="furniture">Мебельные компании</option>
                              <option value="studio">Дизайн-студии / Архбюро</option>
                              <option value="horeca">HoReCa мебель</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Статус обзвона</label>
                            <select value={selectedCallStatus} onChange={(e) => setSelectedCallStatus(e.target.value)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                              <option value="all">Все статусы</option>
                              <option value="not_called">Не звонили</option>
                              <option value="in_progress">В работе</option>
                              <option value="callback">Перезвонить</option>
                              <option value="rejected">Отказ</option>
                              <option value="interested">Интерес</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Сортировка</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                              <option value="score">По баллу приоритета</option>
                              <option value="potential">По потенциалу</option>
                              <option value="name">По названию</option>
                              <option value="city">По городу</option>
                            </select>
                          </div>
                        </div>
                        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground"><X className="w-3.5 h-3.5 mr-1" />Сбросить</Button>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Найдено: <span className="font-semibold text-foreground">{filteredCompanies.length}</span> компаний</p>
              <Button variant="ghost" size="sm" onClick={handleExportCSV} className="text-xs text-muted-foreground"><Download className="w-3.5 h-3.5 mr-1" />Экспорт CSV</Button>
            </div>

            {viewMode === "cards" ? (
              <div className="space-y-3">
                {filteredCompanies.map((c, i) => (
                  <CompanyCard key={c["Название"] + i} company={c} index={i} priorityScore={priorityScores.get(c["Название"]) || 0} getStatus={getStatus} setStatus={setStatus} getNote={getNote} setNote={setNote} siteStatus={siteResults[c["Название"]]} />
                ))}
                {filteredCompanies.length === 0 && (
                  <div className="text-center py-16"><Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground text-lg">Компании не найдены</p></div>
                )}
              </div>
            ) : (
              <CompanyTable companies={filteredCompanies} priorityScores={priorityScores} getStatus={getStatus} setStatus={setStatus} siteResults={siteResults} sortColumn={sortBy} sortDir={sortDir} onSort={handleTableSort} />
            )}
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="font-heading text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Компании по городам (ТОП-15)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={cityChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} className="fill-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", color: "var(--card-foreground)" }} />
                      <Bar dataKey="total" fill="#0d9488" radius={[0, 4, 4, 0]} name="Всего" />
                      <Bar dataKey="high" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Высокий потенциал" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="font-heading text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-500" />Распределение по потенциалу</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie data={potentialDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={3} dataKey="value">
                        {potentialDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", color: "var(--card-foreground)" }} />
                      <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-sm text-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="font-heading text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-500" />Типы компаний</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                        {typeDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", color: "var(--card-foreground)" }} />
                      <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-sm text-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="font-heading text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-rose-500" />Сводка по городам</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-auto max-h-[300px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border">
                          <th className="text-left py-2.5 px-3 font-semibold text-card-foreground">Город</th>
                          <th className="text-center py-2.5 px-2 font-semibold text-card-foreground">Всего</th>
                          <th className="text-center py-2.5 px-2 font-semibold text-teal-600 dark:text-teal-400">Выс.</th>
                          <th className="text-center py-2.5 px-2 font-semibold text-amber-600 dark:text-amber-400">Ср.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.city_stats.map((city, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelectedCity(city.city); }}>
                            <td className="py-2 px-3 text-card-foreground">{city.city}</td>
                            <td className="py-2 px-2 text-center font-medium">{city.total}</td>
                            <td className="py-2 px-2 text-center">{city.high > 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 text-xs font-semibold">{city.high}</span>}</td>
                            <td className="py-2 px-2 text-center">{city.medium > 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold">{city.medium}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MAP TAB */}
          <TabsContent value="map" className="space-y-4">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="font-heading text-lg flex items-center gap-2"><MapIcon className="w-5 h-5 text-primary" />Карта компаний по городам</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Размер точки пропорционален количеству компаний. Бирюзовые — города с высоким потенциалом. Нажмите на город для фильтрации.</p>
                <RussiaMap cities={mapCities} onCityClick={(city) => setSelectedCity(city)} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOP TAB */}
          <TabsContent value="top" className="space-y-4">
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 border-teal-200 dark:border-teal-800 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2"><Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" /><h3 className="font-heading font-bold text-teal-800 dark:text-teal-200 text-lg">Компании с высоким потенциалом ({data.top_count})</h3></div>
                <p className="text-sm text-teal-700 dark:text-teal-300">Наиболее перспективные для декоративных покрытий, жидкого металла и премиальных отделочных материалов.</p>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {data.companies.filter((c) => getPotentialLevel(c["Потенциал сотрудничества"]) === "high").map((c, i) => (
                <CompanyCard key={c["Название"] + "-top-" + i} company={c} index={i} priorityScore={priorityScores.get(c["Название"]) || 0} getStatus={getStatus} setStatus={setStatus} getNote={getNote} setNote={setNote} siteStatus={siteResults[c["Название"]]} />
              ))}
            </div>
          </TabsContent>

          {/* PRIORITY WEIGHTS TAB */}
          <TabsContent value="priority" className="space-y-4">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-lg flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-primary" />Настройка весов приоритизации</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetWeights}>Сбросить</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">Настройте вес каждого критерия от 0 до 10. Итоговый балл (0-100) рассчитывается автоматически.</p>
                {(Object.keys(weights) as (keyof PriorityWeights)[]).map((key) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">{WEIGHT_LABELS[key]}</label>
                      <span className="text-sm font-bold text-primary w-8 text-right">{weights[key]}</span>
                    </div>
                    <Slider value={[weights[key]]} onValueChange={([v]) => updateWeight(key, v)} min={0} max={10} step={1} className="w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOOLS TAB */}
          <TabsContent value="tools" className="space-y-4">
            <SiteCheckerPanel
              companies={filteredCompanies.map((c) => ({ name: c["Название"], site: c["Сайт"] }))}
              results={siteResults}
              isRunning={siteChecking}
              progress={siteProgress}
              onCheck={handleCheckSites}
            />
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-heading font-bold text-base flex items-center gap-2 mb-3"><Download className="w-5 h-5 text-primary" />Экспорт данных</h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleExportCSV} variant="outline"><Download className="w-4 h-4 mr-1.5" />Экспорт текущей выборки ({filteredCompanies.length} компаний)</Button>
                  <Button onClick={() => exportToCSV(data.companies, `all_furniture_companies_${data.total}.csv`)} variant="outline"><Download className="w-4 h-4 mr-1.5" />Экспорт всей базы ({data.total} компаний)</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">CSV-файл с кодировкой UTF-8 BOM, совместим с Excel и Google Sheets.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">База мебельных компаний России для B2B-аутрича</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{data.total} компаний &middot; {data.cities_count} городов &middot; {data.regions_count} регионов</p>
        </div>
      </footer>
    </div>
  );
}
