/*
 * Professional Interactive Russia Map - Dark Canvas Edition
 * Uses Leaflet with custom Dark Matter tiles and advanced VFX
 * Features: Smooth animations, neon markers, heatmaps, and cinematic effects
 */
import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap, Pane } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
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

// Custom dark tile layer (CartoDB Dark Matter)
const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Focus on European Russia where most companies are
const INITIAL_CENTER: L.LatLngExpression = [54, 50];
const INITIAL_ZOOM = 4;

// Map controller component
function MapController({ cities, onCityClick }: { cities: CityData[]; onCityClick?: (city: string) => void }) {
  const map = useMap();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    // Set max bounds to prevent panning too far away
    map.setMaxBounds([
      [25, 10],
      [85, 190]
    ]);
  }, [map]);

  const cityMarkers = useMemo(() => {
    return cities
      .filter((c) => c.lat && c.lng)
      .map((c) => ({
        ...c,
        radius: Math.max(6, Math.min(22, Math.sqrt(c.total) * 3.5)),
        isHot: c.high > 0,
      }));
  }, [cities]);

  const handleCityClick = (city: string) => {
    setSelectedCity(city === selectedCity ? null : city);
    onCityClick?.(city);
  };

  return (
    <>
      {/* Outer glow rings for hot cities */}
      {cityMarkers
        .filter((c) => c.isHot)
        .map((city) => (
          <CircleMarker
            key={`glow-outer-${city.city}`}
            center={[city.lat, city.lng]}
            radius={city.radius + 14}
            pathOptions={{
              fillColor: "#00bcd4",
              fillOpacity: 0.06,
              color: "transparent",
              weight: 0,
            }}
            interactive={false}
          />
        ))}

      {/* Inner glow rings for hot cities */}
      {cityMarkers
        .filter((c) => c.isHot)
        .map((city) => (
          <CircleMarker
            key={`glow-inner-${city.city}`}
            center={[city.lat, city.lng]}
            radius={city.radius + 7}
            pathOptions={{
              fillColor: "#00bcd4",
              fillOpacity: 0.12,
              color: "transparent",
              weight: 0,
            }}
            interactive={false}
          />
        ))}

      {/* Main city markers */}
      {cityMarkers.map((city) => (
        <CircleMarker
          key={city.city}
          center={[city.lat, city.lng]}
          radius={city.radius}
          pathOptions={{
            fillColor: city.isHot ? "#00e5ff" : "#64748b",
            fillOpacity: city.isHot ? 0.85 : 0.5,
            color: selectedCity === city.city ? "#ff4081" : city.isHot ? "#00e5ff" : "#94a3b8",
            weight: selectedCity === city.city ? 3 : city.isHot ? 2 : 1,
          }}
          eventHandlers={{
            click: () => handleCityClick(city.city),
          }}
        >
          {/* Tooltip with city name - always visible on hover */}
          <Tooltip
            direction="top"
            offset={[0, -city.radius - 4]}
            opacity={0.95}
            className="custom-tooltip"
          >
            <span style={{
              fontWeight: 700,
              fontSize: '12px',
              color: '#0a0a14',
              letterSpacing: '0.02em',
            }}>
              {city.city} ({city.total})
            </span>
          </Tooltip>

          {/* Popup with details on click */}
          <Popup className="custom-popup">
            <div style={{
              padding: '8px 4px',
              fontFamily: 'Source Sans 3, system-ui, sans-serif',
              minWidth: '160px',
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#00e5ff',
                marginBottom: '6px',
                borderBottom: '2px solid rgba(0,229,255,0.3)',
                paddingBottom: '6px',
              }}>{city.city}</div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Всего компаний:</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{city.total}</span>
              </div>

              {city.high > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Высокий потенциал:</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#00e5ff',
                      boxShadow: '0 0 6px rgba(0,229,255,0.6)',
                    }}></span>
                    {city.high}
                  </span>
                </div>
              )}

              <div style={{
                fontSize: '10px',
                color: '#64748b',
                marginTop: '8px',
                borderTop: '1px solid rgba(100,116,139,0.3)',
                paddingTop: '6px',
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                Клик для фильтрации списка
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

export default function RussiaMap({ cities, onCityClick }: RussiaMapProps) {
  const totalCompanies = useMemo(() => cities.reduce((sum, c) => sum + c.total, 0), [cities]);
  const hotCities = useMemo(() => cities.filter((c) => c.high > 0).length, [cities]);
  const totalCities = useMemo(() => cities.filter((c) => c.lat && c.lng).length, [cities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-xl overflow-hidden border border-border dark:border-cyan-500/15 shadow-2xl"
      style={{ height: 650 }}
    >
      {/* Map Container */}
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={3}
        maxZoom={10}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", background: "#0a0a14" }}
      >
        <TileLayer
          url={DARK_TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={12}
          minZoom={2}
        />
        <MapController cities={cities} onCityClick={onCityClick} />
      </MapContainer>

      {/* Stats overlay - bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute bottom-4 left-4 z-[1000]"
      >
        <div className="flex gap-2">
          <div className="px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/20">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Городов</div>
            <div className="text-lg font-bold text-cyan-400">{totalCities}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/20">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Компаний</div>
            <div className="text-lg font-bold text-white">{totalCompanies}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-pink-500/20">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Горячих</div>
            <div className="text-lg font-bold text-pink-400">{hotCities}</div>
          </div>
        </div>
      </motion.div>

      {/* Legend - top right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="absolute top-4 right-4 p-3 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/20 z-[1000]"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.6)]"></div>
            <span className="text-[11px] text-slate-300">Высокий потенциал</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500"></div>
            <span className="text-[11px] text-slate-400">Другие города</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-pink-400"></div>
            <span className="text-[11px] text-slate-400">Выбранный</span>
          </div>
        </div>
      </motion.div>

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
        background: "radial-gradient(ellipse at center, transparent 60%, rgba(10,10,20,0.3) 100%)"
      }}></div>
    </motion.div>
  );
}
