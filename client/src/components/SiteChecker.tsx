/*
 * Site Checker — checks website availability via image load trick
 * (CORS prevents fetch from browser, so we use favicon/image probe)
 */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Globe, CheckCircle2, XCircle, Loader2, AlertTriangle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SiteStatus {
  url: string;
  company: string;
  status: "pending" | "checking" | "online" | "offline" | "unknown";
}

export function useSiteChecker() {
  const [results, setResults] = useState<Record<string, SiteStatus>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const checkSite = useCallback((url: string, company: string): Promise<SiteStatus> => {
    return new Promise((resolve) => {
      const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
      const status: SiteStatus = { url: cleanUrl, company, status: "checking" };

      // Use fetch with no-cors mode - we can detect network errors
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        resolve({ ...status, status: "offline" });
      }, 8000);

      fetch(cleanUrl, { mode: "no-cors", signal: controller.signal })
        .then(() => {
          clearTimeout(timeout);
          resolve({ ...status, status: "online" });
        })
        .catch((err) => {
          clearTimeout(timeout);
          if (err.name === "AbortError") {
            resolve({ ...status, status: "offline" });
          } else {
            // Network error could mean CORS block (site is actually online) or truly offline
            resolve({ ...status, status: "unknown" });
          }
        });
    });
  }, []);

  const checkAll = useCallback(async (companies: { name: string; site: string }[]) => {
    const withSites = companies.filter((c) => c.site);
    setIsRunning(true);
    setProgress({ done: 0, total: withSites.length });

    // Check in batches of 5
    const batchSize = 5;
    for (let i = 0; i < withSites.length; i += batchSize) {
      const batch = withSites.slice(i, i + batchSize);
      const promises = batch.map((c) => checkSite(c.site, c.name));
      const batchResults = await Promise.all(promises);
      setResults((prev) => {
        const next = { ...prev };
        batchResults.forEach((r) => { next[r.company] = r; });
        return next;
      });
      setProgress((p) => ({ ...p, done: Math.min(i + batchSize, withSites.length) }));
    }
    setIsRunning(false);
  }, [checkSite]);

  return { results, isRunning, progress, checkAll };
}

export function SiteStatusBadge({ status }: { status?: SiteStatus }) {
  if (!status) return null;
  if (status.status === "checking") return <Badge variant="outline" className="text-[10px] gap-1"><Loader2 className="w-3 h-3 animate-spin" />Проверка...</Badge>;
  if (status.status === "online") return <Badge variant="outline" className="text-[10px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" />Онлайн</Badge>;
  if (status.status === "offline") return <Badge variant="outline" className="text-[10px] gap-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"><XCircle className="w-3 h-3" />Недоступен</Badge>;
  if (status.status === "unknown") return <Badge variant="outline" className="text-[10px] gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"><AlertTriangle className="w-3 h-3" />Не определён</Badge>;
  return null;
}

export function SiteCheckerPanel({
  companies,
  results,
  isRunning,
  progress,
  onCheck,
}: {
  companies: { name: string; site: string }[];
  results: Record<string, any>;
  isRunning: boolean;
  progress: { done: number; total: number };
  onCheck: () => void;
}) {
  const withSites = companies.filter((c) => c.site);
  const online = Object.values(results).filter((r: any) => r.status === "online").length;
  const offline = Object.values(results).filter((r: any) => r.status === "offline").length;
  const unknown = Object.values(results).filter((r: any) => r.status === "unknown").length;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Проверка доступности сайтов
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {withSites.length} компаний с сайтами из {companies.length} в текущей выборке
          </p>
        </div>
        <Button onClick={onCheck} disabled={isRunning} size="sm">
          {isRunning ? (
            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Проверка {progress.done}/{progress.total}</>
          ) : (
            <><Play className="w-4 h-4 mr-1.5" />Проверить все</>
          )}
        </Button>
      </div>

      {isRunning && (
        <div className="mb-4">
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(progress.done / progress.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-muted-foreground">Онлайн:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{online}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-muted-foreground">Недоступны:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{offline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-muted-foreground">Не определены:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{unknown}</span>
          </div>
        </div>
      )}
    </div>
  );
}
