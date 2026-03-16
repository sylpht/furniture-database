/*
 * Design: Scandinavian Data Canvas
 * Color: Warm white bg, teal primary, amber highlights, navy text
 * Typography: Plus Jakarta Sans headings, Source Sans 3 body
 */
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Target,
  Briefcase,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
  total: number;
  top_count: number;
  premium_count: number;
  regions_count: number;
  cities_count: number;
};

const COLORS = {
  high: "#0d9488",
  medium: "#f59e0b",
  low: "#f97316",
  min: "#94a3b8",
};

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
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const level = getPotentialLevel(company["Потенциал сотрудничества"]);

  const borderColor =
    level === "high"
      ? "border-l-teal-500"
      : level === "medium"
        ? "border-l-amber-500"
        : level === "low"
          ? "border-l-orange-400"
          : "border-l-slate-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.4 }}
    >
      <Card
        className={`border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer bg-white`}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 truncate">
                  {company["Название"]}
                </h3>
                {level === "high" && (
                  <Star className="w-4 h-4 text-teal-500 fill-teal-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {company["Город"]}
                </span>
                {company["Телефон"] && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {company["Телефон"].split(",")[0]}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="secondary"
                className={`text-xs whitespace-nowrap ${
                  level === "high"
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : level === "medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : level === "low"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {getPotentialLabel(company["Потенциал сотрудничества"])}
              </Badge>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {company["Специализация"] && (
            <p className="text-sm text-slate-600 mt-2 line-clamp-1">
              {company["Специализация"]}
            </p>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  {company["Краткое описание"] && (
                    <p className="text-sm text-slate-600">{company["Краткое описание"]}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {company["Регион"] && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{company["Регион"]}</span>
                      </div>
                    )}
                    {company["Адрес"] && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="break-words">{company["Адрес"]}</span>
                      </div>
                    )}
                    {company["Email"] && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${company["Email"]}`}
                          className="text-teal-600 hover:underline break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {company["Email"]}
                        </a>
                      </div>
                    )}
                    {company["Сайт"] && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                        <a
                          href={company["Сайт"].startsWith("http") ? company["Сайт"] : `https://${company["Сайт"]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {company["Сайт"].replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </div>
                    )}
                    {company["Телефон"] && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="break-words">{company["Телефон"]}</span>
                      </div>
                    )}
                    {company["Соцсети"] && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <ExternalLink className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="break-all text-xs">{company["Соцсети"]}</span>
                      </div>
                    )}
                  </div>

                  {company["Сегмент"] && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {company["Сегмент"].split(/[,/]/).map((seg, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-slate-50">
                          {seg.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {company["Первый шаг контакта"] && (
                    <div className="bg-teal-50 rounded-lg p-3 mt-2">
                      <p className="text-xs font-semibold text-teal-800 mb-1 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        Рекомендация для первого контакта:
                      </p>
                      <p className="text-sm text-teal-700">{company["Первый шаг контакта"]}</p>
                    </div>
                  )}

                  {company["Источник"] && (
                    <p className="text-xs text-slate-400 mt-2">
                      Источник: {company["Источник"]}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedPotential, setSelectedPotential] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"potential" | "name" | "city">("potential");

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    data.companies.forEach((c) => {
      if (c["Город"]) citySet.add(c["Город"]);
    });
    return Array.from(citySet).sort();
  }, []);

  const filteredCompanies = useMemo(() => {
    let result = data.companies.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c["Название"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        c["Специализация"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c["Город"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c["Регион"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c["Краткое описание"]?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === "all" || c["Город"] === selectedCity;

      const matchesPotential =
        selectedPotential === "all" ||
        getPotentialLevel(c["Потенциал сотрудничества"]) === selectedPotential;

      return matchesSearch && matchesCity && matchesPotential;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a["Название"].localeCompare(b["Название"]));
    } else if (sortBy === "city") {
      result.sort((a, b) => (a["Город"] || "").localeCompare(b["Город"] || ""));
    }

    return result;
  }, [searchQuery, selectedCity, selectedPotential, sortBy]);

  // Chart data
  const cityChartData = useMemo(() => {
    return data.city_stats
      .filter((c) => c.total >= 3)
      .slice(0, 15)
      .map((c) => ({
        name: c.city.length > 14 ? c.city.slice(0, 12) + "…" : c.city,
        fullName: c.city,
        total: c.total,
        high: c.high,
        medium: c.medium,
      }));
  }, []);

  const potentialDistribution = useMemo(() => {
    let high = 0, medium = 0, low = 0, min = 0;
    data.companies.forEach((c) => {
      const level = getPotentialLevel(c["Потенциал сотрудничества"]);
      if (level === "high") high++;
      else if (level === "medium") medium++;
      else if (level === "low") low++;
      else min++;
    });
    return [
      { name: "Высокий", value: high, color: COLORS.high },
      { name: "Средний", value: medium, color: COLORS.medium },
      { name: "Низкий", value: low, color: COLORS.low },
      { name: "Минимальный", value: min, color: COLORS.min },
    ];
  }, []);

  const segmentDistribution = useMemo(() => {
    const segments: Record<string, number> = {};
    data.companies.forEach((c) => {
      if (c["Сегмент"]) {
        c["Сегмент"].split(/[,/]/).forEach((s) => {
          const seg = s.trim().toLowerCase();
          if (seg && seg.length > 1) {
            const key = seg.charAt(0).toUpperCase() + seg.slice(1);
            segments[key] = (segments[key] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(segments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setSelectedPotential("all");
  };

  const hasActiveFilters = searchQuery || selectedCity !== "all" || selectedPotential !== "all";

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(13,148,136,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(245,158,11,0.2) 0%, transparent 40%)`,
          }} />
        </div>
        <div className="container relative py-12 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-teal-400" />
              </div>
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
                B2B Аутрич
              </Badge>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              База мебельных компаний
              <span className="text-teal-400"> России</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Структурированная база для продаж и партнёрского аутрича.
              Декоративные покрытия, жидкий металл, премиальные отделочные материалы
              и кастомные интерьерные решения.
            </p>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10"
          >
            {[
              { label: "Компаний", value: data.total, icon: Building2, color: "text-teal-400" },
              { label: "Городов", value: data.cities_count, icon: MapPin, color: "text-amber-400" },
              { label: "Регионов", value: data.regions_count, icon: BarChart3, color: "text-blue-400" },
              { label: "ТОП приоритет", value: data.top_count, icon: Star, color: "text-emerald-400" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-2xl sm:text-3xl font-heading font-bold text-white">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 sm:py-10">
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="companies" className="rounded-lg text-sm data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
              <Users className="w-4 h-4 mr-1.5" />
              Компании
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg text-sm data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="top" className="rounded-lg text-sm data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
              <Sparkles className="w-4 h-4 mr-1.5" />
              ТОП приоритет
            </TabsTrigger>
          </TabsList>

          {/* COMPANIES TAB */}
          <TabsContent value="companies" className="space-y-4">
            {/* Search & Filters */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Поиск по названию, городу, специализации..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`shrink-0 ${showFilters ? "bg-teal-50 border-teal-200 text-teal-700" : ""}`}
                  >
                    <Filter className="w-4 h-4 mr-1.5" />
                    Фильтры
                    {hasActiveFilters && (
                      <span className="ml-1.5 w-2 h-2 rounded-full bg-teal-500" />
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Город</label>
                            <select
                              value={selectedCity}
                              onChange={(e) => setSelectedCity(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            >
                              <option value="all">Все города</option>
                              {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Потенциал</label>
                            <select
                              value={selectedPotential}
                              onChange={(e) => setSelectedPotential(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            >
                              <option value="all">Все уровни</option>
                              <option value="high">Высокий</option>
                              <option value="medium">Средний</option>
                              <option value="low">Низкий</option>
                              <option value="min">Минимальный</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Сортировка</label>
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value as any)}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            >
                              <option value="potential">По приоритету</option>
                              <option value="name">По названию</option>
                              <option value="city">По городу</option>
                            </select>
                          </div>
                        </div>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-500">
                            <X className="w-3.5 h-3.5 mr-1" />
                            Сбросить фильтры
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Найдено: <span className="font-semibold text-slate-700">{filteredCompanies.length}</span> компаний
              </p>
            </div>

            {/* Company List */}
            <div className="space-y-3">
              {filteredCompanies.map((company, index) => (
                <CompanyCard key={company["Название"] + index} company={company} index={index} />
              ))}
              {filteredCompanies.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Компании не найдены</p>
                  <p className="text-slate-400 text-sm mt-1">Попробуйте изменить параметры поиска</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* City Distribution Chart */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-500" />
                    Компании по городам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={cityChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11, fill: "#475569" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                        formatter={(value: number, name: string) => {
                          const labels: Record<string, string> = {
                            total: "Всего",
                            high: "Высокий потенциал",
                            medium: "Средний потенциал",
                          };
                          return [value, labels[name] || name];
                        }}
                      />
                      <Bar dataKey="total" fill="#0d9488" radius={[0, 4, 4, 0]} name="total" />
                      <Bar dataKey="high" fill="#f59e0b" radius={[0, 4, 4, 0]} name="high" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Potential Distribution Pie */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Распределение по потенциалу
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={potentialDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {potentialDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Segment Distribution */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Распределение по сегментам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={segmentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {segmentDistribution.map((_, index) => (
                          <Cell key={`seg-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* City Summary Table */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    Сводка по городам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2.5 px-3 font-semibold text-slate-700">Город</th>
                          <th className="text-center py-2.5 px-2 font-semibold text-slate-700">Всего</th>
                          <th className="text-center py-2.5 px-2 font-semibold text-teal-600">Выс.</th>
                          <th className="text-center py-2.5 px-2 font-semibold text-amber-600">Ср.</th>
                          <th className="text-center py-2.5 px-2 font-semibold text-orange-600">Низ.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.city_stats.map((city, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 text-slate-700">{city.city}</td>
                            <td className="py-2 px-2 text-center font-medium">{city.total}</td>
                            <td className="py-2 px-2 text-center">
                              {city.high > 0 && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
                                  {city.high}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {city.medium > 0 && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                                  {city.medium}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {city.low > 0 && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                                  {city.low}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TOP PRIORITY TAB */}
          <TabsContent value="top" className="space-y-4">
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h3 className="font-heading font-bold text-teal-800 text-lg">
                    Компании с высоким потенциалом сотрудничества
                  </h3>
                </div>
                <p className="text-sm text-teal-700">
                  Эти компании наиболее перспективны для предложения декоративных покрытий,
                  жидкого металла и премиальных отделочных материалов. Рекомендуется начинать аутрич именно с них.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {data.companies
                .filter((c) => getPotentialLevel(c["Потенциал сотрудничества"]) === "high")
                .map((company, index) => (
                  <CompanyCard key={company["Название"] + "-top-" + index} company={company} index={index} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container text-center">
          <p className="text-sm text-slate-500">
            База мебельных компаний России для B2B-аутрича
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {data.total} компаний &middot; {data.cities_count} городов &middot; {data.regions_count} регионов
          </p>
        </div>
      </footer>
    </div>
  );
}
