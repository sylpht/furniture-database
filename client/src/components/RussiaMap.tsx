/*
 * Professional Interactive Russia Map
 * Uses react-simple-maps with accurate GeoJSON data
 * Features: Accurate projections, region highlighting, and city markers
 */
import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { geoAlbers } from "d3-geo";

// Accurate Albers projection for Russia
const projection = geoAlbers()
  .rotate([-105, 0])
  .center([0, 65])
  .parallels([50, 70])
  .scale(700)
  .translate([480, 250]);

interface CityData {
  city: string;
  total: number;
  high: number;
  lat: number;
  lng: number;
}

interface RussiaMapProps {
  cities: CityData[];
  onCityClick?: (city: string) => void;
}

const GEO_URL = "/data/russia.json";

export default function RussiaMap({ cities, onCityClick }: RussiaMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const cityMarkers = useMemo(() => {
    return cities.map((c) => ({
      ...c,
      radius: Math.max(4, Math.min(12, Math.sqrt(c.total) * 2.5))
    }));
  }, [cities]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0f0f1e] border border-border dark:border-cyan-500/20 shadow-inner">
      <ComposableMap
        projection={projection}
        width={960}
        height={550}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup center={[0, 0]} zoom={1} minZoom={1} maxZoom={8}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isHovered = hoveredRegion === geo.rsmKey;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredRegion(geo.rsmKey)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    style={{
                      default: {
                        fill: "var(--muted)",
                        fillOpacity: 0.3,
                        stroke: "var(--border)",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 0.3s ease"
                      },
                      hover: {
                        fill: "var(--primary)",
                        fillOpacity: 0.2,
                        stroke: "var(--primary)",
                        strokeWidth: 1,
                        outline: "none"
                      },
                      pressed: {
                        fill: "var(--primary)",
                        fillOpacity: 0.4,
                        outline: "none"
                      }
                    }}
                    className="dark:fill-slate-800/40 dark:stroke-cyan-500/20"
                  />
                );
              })
            }
          </Geographies>

          {cityMarkers.map((city, i) => (
            <Marker key={city.city} coordinates={[city.lng, city.lat]}>
              <g
                className="cursor-pointer"
                onClick={() => onCityClick?.(city.city)}
                onMouseEnter={() => setHoveredCity(city.city)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Glow effect for high potential */}
                {city.high > 0 && (
                  <circle
                    r={city.radius + 6}
                    className="fill-cyan-400/20 animate-pulse"
                    style={{ filter: "blur(4px)" }}
                  />
                )}
                
                {/* Main marker dot */}
                <motion.circle
                  r={city.radius}
                  className={
                    city.high > 0 
                      ? "fill-cyan-400 stroke-cyan-200 dark:stroke-cyan-100" 
                      : "fill-slate-400 stroke-white dark:fill-slate-500 dark:stroke-slate-800"
                  }
                  strokeWidth={1.5}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: hoveredCity === city.city ? 1.4 : 1,
                    filter: city.high > 0 ? "drop-shadow(0 0 8px rgba(0, 188, 212, 0.6))" : "none"
                  }}
                  transition={{ delay: i * 0.01, type: "spring", stiffness: 300 }}
                />

                {/* Count label inside dot if large enough */}
                {city.radius > 8 && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-slate-900 dark:fill-slate-900 font-bold pointer-events-none"
                    fontSize={city.radius > 10 ? 10 : 8}
                  >
                    {city.total}
                  </text>
                )}
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      <AnimatePresence>
        {hoveredCity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 p-3 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border dark:border-cyan-500/40 shadow-xl pointer-events-none"
          >
            <p className="text-sm font-bold dark:text-cyan-300">{hoveredCity}</p>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              {cities.find(c => c.city === hoveredCity)?.total} компаний
            </p>
            {cities.find(c => c.city === hoveredCity)?.high! > 0 && (
              <p className="text-[10px] text-cyan-500 font-medium mt-1">✨ Высокий потенциал</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls Hint */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="px-2 py-1 rounded bg-black/20 backdrop-blur-sm text-[10px] text-white/70">
          Используйте колесико для зума
        </div>
      </div>
    </div>
  );
}
