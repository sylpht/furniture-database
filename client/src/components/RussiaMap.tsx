/*
 * Professional Interactive Russia Map - Dark Canvas Edition
 * Uses Leaflet with custom Dark Matter tiles and advanced VFX
 * Features: Smooth animations, neon markers, heatmaps, and cinematic effects
 */
import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

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

// Custom dark tile layer (CartoDB Positron Dark)
const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Map controller component
function MapController({ cities, onCityClick }: { cities: CityData[]; onCityClick?: (city: string) => void }) {
  const map = useMap();
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  useEffect(() => {
    // Fit bounds to Russia
    const bounds = L.latLngBounds([
      [41.1, 19.6],  // Southwest corner
      [81.9, 169.4]  // Northeast corner
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
  }, [map]);

  const cityMarkers = useMemo(() => {
    return cities.map((c) => ({
      ...c,
      radius: Math.max(6, Math.min(16, Math.sqrt(c.total) * 2.5))
    }));
  }, [cities]);

  return (
    <>
      {cityMarkers.map((city, i) => (
        <CircleMarker
          key={city.city}
          center={[city.lat, city.lng]}
          radius={city.radius}
          fillColor={city.high > 0 ? "#00bcd4" : "#64748b"}
          fillOpacity={city.high > 0 ? 0.8 : 0.6}
          color={city.high > 0 ? "#00e5ff" : "#cbd5e1"}
          weight={city.high > 0 ? 2 : 1}
          className={`cursor-pointer transition-all ${city.high > 0 ? "hover:shadow-lg hover:shadow-cyan-400/50" : ""}`}
          eventHandlers={{
            click: () => onCityClick?.(city.city),
            mouseover: () => setHoveredCity(city.city),
            mouseout: () => setHoveredCity(null)
          }}
        >
          <Popup>
            <div className="text-sm font-semibold dark:text-slate-900">
              {city.city}
              <br />
              <span className="text-xs text-slate-600">{city.total} компаний</span>
              {city.high > 0 && <div className="text-[10px] text-cyan-500 mt-1">✨ Высокий потенциал</div>}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Animated heatmap effect for high-potential regions */}
      {cities
        .filter((c) => c.high > 0)
        .map((city) => (
          <CircleMarker
            key={`heatmap-${city.city}`}
            center={[city.lat, city.lng]}
            radius={city.radius + 8}
            fillColor="#00bcd4"
            fillOpacity={0.15}
            color="transparent"
            weight={0}
            className="animate-pulse"
          />
        ))}
    </>
  );
}

export default function RussiaMap({ cities, onCityClick }: RussiaMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0a0a14] border border-border dark:border-cyan-500/20 shadow-2xl"
      style={{ minHeight: 550 }}
    >
      {/* Map Container */}
      <MapContainer
        center={[61.5, 105.3]}
        zoom={3}
        style={{ width: "100%", height: "100%", minHeight: 550 }}
        className="dark:bg-[#0a0a14]"
      >
        <TileLayer
          url={DARK_TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={8}
          minZoom={2}
          className="dark:brightness-75 dark:contrast-125"
        />
        <MapController cities={cities} onCityClick={onCityClick} />
      </MapContainer>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-4 left-4 p-4 rounded-lg bg-black/40 backdrop-blur-md border border-cyan-500/30 shadow-xl z-[400]"
      >
        <p className="text-xs font-semibold text-cyan-300 mb-3">Легенда</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
            <span className="text-[10px] text-slate-300">Высокий потенциал</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <span className="text-[10px] text-slate-300">Другие города</span>
          </div>
        </div>
      </motion.div>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute bottom-4 right-4 p-4 rounded-lg bg-black/40 backdrop-blur-md border border-cyan-500/30 shadow-xl z-[400]"
      >
        <p className="text-xs text-slate-400 mb-2">Интерактивная карта России</p>
        <p className="text-[10px] text-cyan-400">Кликните на город для фильтрации</p>
      </motion.div>

      {/* Animated gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-black/30 rounded-xl"></div>
    </motion.div>
  );
}
