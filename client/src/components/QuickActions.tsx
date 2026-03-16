/*
 * Quick Actions — call, email, open website buttons
 */
import { Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickActionsProps {
  phone?: string;
  email?: string;
  site?: string;
  whatsapp?: string;
  telegram?: string;
}

export default function QuickActions({ phone, email, site, whatsapp, telegram }: QuickActionsProps) {
  const cleanPhone = phone?.replace(/[^+\d]/g, "").split(",")[0] || "";

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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950" asChild>
              <a href={`https://wa.me/${(whatsapp || cleanPhone).replace(/[^+\d]/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4" /></a>
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>WhatsApp</p></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
