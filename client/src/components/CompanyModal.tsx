import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Phone, Globe, Mail, MessageSquare, 
  ExternalLink, Star, Building2, Target, 
  Briefcase, Info, Navigation, Share2
} from "lucide-react";
import { motion } from "framer-motion";

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

interface CompanyModalProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyModal({ company, open, onOpenChange }: CompanyModalProps) {
  if (!company) return null;

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, "");
  };

  const getGoogleMapsUrl = (company: Company) => {
    const query = encodeURIComponent(`${company.Название} ${company.Город} ${company.Адрес}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getYandexMapsUrl = (company: Company) => {
    const query = encodeURIComponent(`${company.Название} ${company.Город} ${company.Адрес}`);
    return `https://yandex.ru/maps/?text=${query}`;
  };

  const level = company["Потенциал сотрудничества"].includes("ВЫСОКИЙ") ? "high" : 
                company["Потенциал сотрудничества"].includes("СРЕДНИЙ") ? "medium" : "low";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-card">
        <div className={`h-2 w-full ${
          level === "high" ? "bg-teal-500" : level === "medium" ? "bg-amber-500" : "bg-orange-400"
        }`} />
        
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {company["Название"]}
              </DialogTitle>
              {level === "high" && <Star className="w-5 h-5 text-teal-500 fill-teal-500" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-muted/50">
                <MapPin className="w-3 h-3 mr-1" /> {company["Город"]}
              </Badge>
              <Badge variant="secondary">
                {company["Тип"] || "Мебельная компания"}
              </Badge>
              <Badge className={
                level === "high" ? "bg-teal-100 text-teal-700 hover:bg-teal-100" :
                level === "medium" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                "bg-orange-100 text-orange-700 hover:bg-orange-100"
              }>
                {company["Потенциал сотрудничества"]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" /> О компании
                </h4>
                <p className="text-foreground leading-relaxed">
                  {company["Краткое описание"] || "Информация уточняется..."}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Target className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Специализация:</span>
                    <span className="font-medium">{company["Специализация"]}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Сегмент:</span>
                    <span className="font-medium">{company["Сегмент"]}</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Navigation className="w-4 h-4" /> Контакты
                </h4>
                <div className="space-y-3">
                  {company["Телефон"] && (
                    <Button variant="outline" className="w-full justify-start gap-3 h-11" asChild>
                      <a href={`tel:${formatPhone(company["Телефон"].split(',')[0])}`}>
                        <Phone className="w-4 h-4 text-teal-600" />
                        <span className="truncate">{company["Телефон"]}</span>
                      </a>
                    </Button>
                  )}
                  {company["Сайт"] && (
                    <Button variant="outline" className="w-full justify-start gap-3 h-11" asChild>
                      <a href={company["Сайт"].startsWith('http') ? company["Сайт"] : `https://${company["Сайт"]}`} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="truncate">{company["Сайт"]}</span>
                      </a>
                    </Button>
                  )}
                  {company["Email"] && (
                    <Button variant="outline" className="w-full justify-start gap-3 h-11" asChild>
                      <a href={`mailto:${company["Email"]}`}>
                        <Mail className="w-4 h-4 text-red-500" />
                        <span className="truncate">{company["Email"]}</span>
                      </a>
                    </Button>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Соцсети и Мессенджеры
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {company["WhatsApp"] && (
                    <Button variant="secondary" className="justify-start gap-2" asChild>
                      <a href={`https://wa.me/${formatPhone(company["WhatsApp"])}`} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp
                      </a>
                    </Button>
                  )}
                  {company["Telegram"] && (
                    <Button variant="secondary" className="justify-start gap-2" asChild>
                      <a href={`https://t.me/${company["Telegram"].replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="w-4 h-4 text-sky-500" /> Telegram
                      </a>
                    </Button>
                  )}
                </div>
                {company["Соцсети"] && (
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Другие: {company["Соцсети"]}
                  </p>
                )}
              </section>

              <section className="bg-muted/30 p-4 rounded-xl border border-border">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Построить маршрут</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-2" asChild>
                    <a href={getYandexMapsUrl(company)} target="_blank" rel="noopener noreferrer">
                      Яндекс.Карты
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-2" asChild>
                    <a href={getGoogleMapsUrl(company)} target="_blank" rel="noopener noreferrer">
                      Google Maps
                    </a>
                  </Button>
                </div>
              </section>

              <div className="pt-4">
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900">
                  <h5 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase mb-1">Первый шаг контакта</h5>
                  <p className="text-sm text-teal-800 dark:text-teal-300">{company["Первый шаг контакта"]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
