/*
 * Interactive Russia Map - SVG-based with city dots
 * Shows company distribution across Russian cities
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

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

// Simplified Mercator projection for Russia bounds
function project(lat: number, lng: number): [number, number] {
  // Russia roughly: lat 41-72, lng 19-170
  // Map to SVG viewBox 0-1000 x 0-500
  const x = ((lng - 19) / (170 - 19)) * 960 + 20;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const minLat = (41 * Math.PI) / 180;
  const maxLat = (72 * Math.PI) / 180;
  const minMerc = Math.log(Math.tan(Math.PI / 4 + minLat / 2));
  const maxMerc = Math.log(Math.tan(Math.PI / 4 + maxLat / 2));
  const y = 480 - ((mercN - minMerc) / (maxMerc - minMerc)) * 460 + 20;
  return [x, y];
}

export default function RussiaMap({ cities, onCityClick }: RussiaMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const projectedCities = useMemo(() => {
    return cities.map((c) => {
      const [x, y] = project(c.lat, c.lng);
      const radius = Math.max(6, Math.min(22, c.total * 1.8));
      return { ...c, x, y, radius };
    });
  }, [cities]);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 1000 500" className="w-full h-auto" style={{ minHeight: 300 }}>
        {/* Background */}
        <rect width="1000" height="500" fill="none" />

        {/* Simplified Russia outline */}
        <path
          d="M60,280 L80,260 L120,250 L160,240 L200,220 L240,200 L280,180 L300,160 L340,150 L380,140 L400,130 L440,120 L480,115 L520,110 L560,105 L600,100 L640,95 L680,100 L720,110 L760,120 L800,130 L840,140 L880,150 L920,160 L950,180 L950,300 L920,320 L880,340 L840,350 L800,360 L760,370 L720,375 L680,380 L640,385 L600,390 L560,385 L520,380 L480,375 L440,370 L400,360 L360,350 L320,340 L280,330 L240,320 L200,310 L160,300 L120,290 L80,285 Z"
          className="fill-muted/30 stroke-border"
          strokeWidth="1.5"
        />

        {/* City dots */}
        {projectedCities.map((city, i) => (
          <g
            key={city.city}
            className="cursor-pointer"
            onClick={() => onCityClick?.(city.city)}
            onMouseEnter={() => setHoveredCity(city.city)}
            onMouseLeave={() => setHoveredCity(null)}
          >
            {/* Glow effect */}
            <circle
              cx={city.x}
              cy={city.y}
              r={city.radius + 4}
              className={city.high > 0 ? "fill-primary/20" : "fill-muted-foreground/10"}
            />
            {/* Main dot */}
            <motion.circle
              cx={city.x}
              cy={city.y}
              r={city.radius}
              className={city.high > 0 ? "fill-primary stroke-primary-foreground" : "fill-muted-foreground/60 stroke-background"}
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{
                scale: hoveredCity === city.city ? 1.3 : 1,
              }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
            />
            {/* Count label */}
            <text
              x={city.x}
              y={city.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-primary-foreground font-bold pointer-events-none"
              fontSize={city.radius > 10 ? 10 : 8}
            >
              {city.total}
            </text>
            {/* City name on hover */}
            {hoveredCity === city.city && (
              <g>
                <rect
                  x={city.x - 60}
                  y={city.y - city.radius - 30}
                  width={120}
                  height={24}
                  rx={6}
                  className="fill-card stroke-border"
                  strokeWidth="1"
                />
                <text
                  x={city.x}
                  y={city.y - city.radius - 18}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-card-foreground font-semibold"
                  fontSize="11"
                >
                  {city.city} ({city.total})
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
