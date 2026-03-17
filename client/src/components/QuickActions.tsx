/*
 * Quick Actions — call, email, open website buttons
 */
import { Phone, Mail, Globe, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickActionsProps {
  phone?: string;
  email?: string;
  site?: string;
  whatsapp?: string;
  telegram?: string;
  companyName?: string;
  scriptText?: string;
}

export default function QuickActions({ phone, email, site, whatsapp, telegram, companyName, scriptText }: QuickActionsProps) {
  const cleanPhone = phone?.replace(/[^+\d]/g, "").split(",")[0] || "";
  
  const handleWhatsApp = () => {
    const message = scriptText ? encodeURIComponent(scriptText) : "Здравствуйте! Я хотел бы обсудить возможность сотрудничества.";
    const number = (whatsapp || cleanPhone).replace(/[^+\d]/g, "").replace("+", "");
    window.open(`https://wa.me/${number}?text=${message}`, "_blank");
  };
  
  const handleTelegram = () => {
    const message = scriptText ? encodeURIComponent(scriptText) : "Здравствуйте! Я хотел бы обсудить возможность сотрудничества.";
    if (telegram) {
      // If telegram is a username (starts with @), use t.me
      const telegramHandle = telegram.startsWith("@") ? telegram.slice(1) : telegram;
      window.open(`https://t.me/${telegramHandle}?text=${message}`, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {cleanPhone && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950" asChild>
              <a href={`tel:${cleanPhone}`}><Phone className="w-4 h-4" /></a>
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Позвонить: {phone?.split(",")[0]}</p></TooltipContent>
        </Tooltip>
      )}
      {email && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950" asChild>
              <a href={`mailto:${email}`}><Mail className="w-4 h-4" /></a>
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Написать: {email}</p></TooltipContent>
        </Tooltip>
      )}
      {site && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950" asChild>
              <a href={site.startsWith("http") ? site : `https://${site}`} target="_blank" rel="noopener noreferrer"><Globe className="w-4 h-4" /></a>
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Открыть сайт</p></TooltipContent>
        </Tooltip>
      )}
      {(whatsapp || cleanPhone) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950" onClick={handleWhatsApp}>
              <MessageCircle className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>WhatsApp {scriptText ? "со скриптом" : ""}</p></TooltipContent>
        </Tooltip>
      )}
      {telegram && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950" onClick={handleTelegram}>
              <Send className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Telegram {scriptText ? "со скриптом" : ""}</p></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
