/*
 * Professional Interactive Russia Map
 * Uses D3.js with accurate GeoJSON data
 * Features: Accurate projections, region highlighting, and city markers
 */
import { useEffect, useRef, useState, useMemo } from "react";
import { geoAlbers, geoPath } from "d3-geo";
import { motion, AnimatePresence } from "framer-motion";

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

interface GeoFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties?: {
    name?: string;
  };
}

interface GeoJSON {
  type: string;
  features: GeoFeature[];
}

export default function RussiaMap({ cities, onCityClick }: RussiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<GeoJSON | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Load GeoJSON data
  useEffect(() => {
    fetch("/data/russia.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  const cityMarkers = useMemo(() => {
    return cities.map((c) => ({
      ...c,
      radius: Math.max(3, Math.min(10, Math.sqrt(c.total) * 2))
    }));
  }, [cities]);

  // Render map
  useEffect(() => {
    if (!svgRef.current || !geoData) return;

    const width = 960;
    const height = 550;

    // Set up projection
    const projection = geoAlbers()
      .rotate([-105, 0])
      .center([0, 65])
      .parallels([50, 70])
      .scale(700)
      .translate([width / 2, height / 2]);

    const pathGenerator = geoPath().projection(projection);

    // Clear previous content
    const svg = svgRef.current;
    svg.innerHTML = "";

    // Create SVG groups
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filterGlow = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filterGlow.setAttribute("id", "glow");
    filterGlow.innerHTML = `
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    `;
    defs.appendChild(filterGlow);
    svg.appendChild(defs);

    // Draw regions
    geoData.features.forEach((feature) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = pathGenerator(feature as any);
      if (d) {
        path.setAttribute("d", d);
        path.setAttribute("class", "dark:fill-slate-800/40 dark:stroke-cyan-500/20 fill-muted/30 stroke-border hover:fill-cyan-400/20 dark:hover:fill-cyan-400/20 transition-all cursor-pointer");
        path.setAttribute("stroke-width", "0.5");
        path.setAttribute("vector-effect", "non-scaling-stroke");

        path.addEventListener("mouseenter", () => {
          setHoveredRegion(feature.properties?.name || null);
          path.setAttribute("stroke-width", "1");
          path.setAttribute("class", "dark:fill-cyan-400/20 dark:stroke-cyan-400 fill-primary/20 stroke-primary");
        });

        path.addEventListener("mouseleave", () => {
          setHoveredRegion(null);
          path.setAttribute("stroke-width", "0.5");
          path.setAttribute("class", "dark:fill-slate-800/40 dark:stroke-cyan-500/20 fill-muted/30 stroke-border hover:fill-cyan-400/20 dark:hover:fill-cyan-400/20 transition-all cursor-pointer");
        });

        svg.appendChild(path);
      }
    });

    // Draw city markers
    cityMarkers.forEach((city, i) => {
      const [x, y] = projection([city.lng, city.lat]) || [0, 0];

      // Glow effect for high potential
      if (city.high > 0) {
        const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        glow.setAttribute("cx", String(x));
        glow.setAttribute("cy", String(y));
        glow.setAttribute("r", String(city.radius + 4));
        glow.setAttribute("class", "fill-cyan-400/20 animate-pulse");
        glow.setAttribute("filter", "url(#glow)");
        glow.style.opacity = "0.6";
        svg.appendChild(glow);
      }

      // Main marker
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      marker.setAttribute("cx", String(x));
      marker.setAttribute("cy", String(y));
      marker.setAttribute("r", String(city.radius));
      marker.setAttribute(
        "class",
        city.high > 0
          ? "fill-cyan-400 stroke-cyan-200 dark:stroke-cyan-100 cursor-pointer hover:opacity-80 transition-opacity"
          : "fill-slate-400 stroke-white dark:fill-slate-500 dark:stroke-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
      );
      marker.setAttribute("stroke-width", "1.5");

      marker.addEventListener("mouseenter", () => {
        setHoveredCity(city.city);
        marker.setAttribute("r", String(city.radius * 1.4));
        if (city.high > 0) {
          marker.setAttribute("filter", "url(#glow)");
        }
      });

      marker.addEventListener("mouseleave", () => {
        setHoveredCity(null);
        marker.setAttribute("r", String(city.radius));
        marker.removeAttribute("filter");
      });

      marker.addEventListener("click", () => {
        onCityClick?.(city.city);
      });

      svg.appendChild(marker);

      // Count label inside dot if large enough
      if (city.radius > 6) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", String(x));
        text.setAttribute("y", String(y));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("class", "fill-slate-900 dark:fill-slate-900 font-bold pointer-events-none text-xs");
        text.setAttribute("font-size", city.radius > 8 ? "10" : "8");
        text.setAttribute("font-weight", "bold");
        text.textContent = String(city.total);
        svg.appendChild(text);
      }
    });
  }, [geoData, cityMarkers, onCityClick]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0f0f1e] border border-border dark:border-cyan-500/20 shadow-inner">
      <svg
        ref={svgRef}
        viewBox="0 0 960 550"
        className="w-full h-auto"
        style={{ minHeight: 400 }}
      />

      {/* Custom Tooltip */}
      <AnimatePresence>
        {hoveredCity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 p-3 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-border dark:border-cyan-500/40 shadow-xl pointer-events-none z-10"
          >
            <p className="text-sm font-bold dark:text-cyan-300">{hoveredCity}</p>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              {cities.find((c) => c.city === hoveredCity)?.total} компаний
            </p>
            {cities.find((c) => c.city === hoveredCity)?.high! > 0 && (
              <p className="text-[10px] text-cyan-500 font-medium mt-1">✨ Высокий потенциал</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls Hint */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="px-2 py-1 rounded bg-black/20 backdrop-blur-sm text-[10px] text-white/70">
          Нажмите на город для фильтрации
        </div>
      </div>
    </div>
  );
}
