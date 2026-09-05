import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { MapPin, Sliders } from "lucide-react";
import { getHotspots } from "../api";
import SeverityBadge from "../components/SeverityBadge";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Real GWMC Warangal landmark zones for reference overlay
const WARANGAL_ZONES = [
  { name: "Hanamkonda Hub", lat: 18.0003, lon: 79.5676, note: "Rythu Bazar & Nakkalagutta — Waste Hotspot Zone" },
  { name: "NIT Warangal Gate", lat: 17.9850, lon: 79.5300, note: "Kazipet Road — Road Damage Hotspot Zone" },
  { name: "Kazipet Junction", lat: 17.9644, lon: 79.5112, note: "Railway Colony — Flooding & Water Leakage Zone" },
  { name: "MGM Hospital Road", lat: 17.9746, lon: 79.5941, note: "Warangal Centre — Water Works Zone" },
  { name: "Fort Warangal", lat: 17.9693, lon: 79.5858, note: "Fort Road — Streetlight Outage Zone" },
  { name: "Balasamudram Lake", lat: 18.0080, lon: 79.5770, note: "Tree Fall & Green Zone" },
  { name: "KU Campus", lat: 17.9735, lon: 79.5522, note: "Kakatiya University — Road Damage Zone" },
];

export default function HotspotMap() {
  const [data, setData] = useState({ complaints: [], hotspots: [] });
  const [eps, setEps] = useState(1.0);
  const [minSamples, setMinSamples] = useState(2);
  const [loading, setLoading] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Warangal city centre
  const WARANGAL_CENTER = [17.9784, 79.5941];

  const loadHotspots = async () => {
    try {
      setLoading(true);
      const res = await getHotspots(eps, minSamples);
      setData(res);
    } catch (err) {
      console.error("Failed to load hotspots", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotspots();
  }, [eps, minSamples]);

  // Custom GWMC zone icon
  const zoneIcon = L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 0 2px #f59e0b40"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>GWMC Geospatial Command</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Warangal Civic Hotspot Intelligence Map</h1>
          <p className="text-xs text-slate-500 mt-1">
            Spatial DBSCAN clustering over real GWMC ward localities — Hanamkonda, Kazipet, Warangal, NIT, KU, MGM, Fort Road and Balasamudram zones.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-soft space-y-3 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cluster Radius: {eps} km</label>
              <input type="range" min="0.3" max="3.0" step="0.1" value={eps}
                onChange={(e) => setEps(parseFloat(e.target.value))} className="w-28 accent-emerald-600" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Min Reports: {minSamples}</label>
              <input type="range" min="2" max="5" step="1" value={minSamples}
                onChange={(e) => setMinSamples(parseInt(e.target.value))} className="w-24 accent-emerald-600" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} className="accent-emerald-600" />
            Show GWMC Landmark Zones
          </label>
        </div>
      </div>

      {/* GWMC Zone Legend */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
        <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">GWMC Key Locality Zones</div>
        <div className="flex flex-wrap gap-2">
          {WARANGAL_ZONES.map((z, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {z.name}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-soft overflow-hidden">
        <div className="h-[560px] w-full rounded-2xl overflow-hidden">
          <MapContainer center={WARANGAL_CENTER} zoom={13} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* GWMC Landmark Zone markers */}
            {showZones && WARANGAL_ZONES.map((z, i) => (
              <Marker key={`zone-${i}`} position={[z.lat, z.lon]} icon={zoneIcon}>
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <div className="font-bold text-amber-800">{z.name}</div>
                    <div className="text-slate-500">{z.note}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Complaint markers */}
            {data.complaints.map((c, i) => (
              c.latitude && c.longitude ? (
                <Marker key={i} position={[c.latitude, c.longitude]}>
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-slate-900">{c.issue_category}</div>
                      <div className="text-slate-600 font-medium">{c.location_text}</div>
                      <div className="pt-1"><SeverityBadge level={c.severity_level} /></div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}

            {/* DBSCAN Hotspot circles */}
            {data.hotspots?.map((h, idx) => (
              <Circle key={idx} center={[h.center_lat, h.center_lon]} radius={eps * 1000}
                pathOptions={{
                  color: h.dominant_severity === "CRITICAL" ? "#ef4444" : h.dominant_severity === "HIGH" ? "#f59e0b" : "#3b82f6",
                  fillColor: h.dominant_severity === "CRITICAL" ? "#ef4444" : h.dominant_severity === "HIGH" ? "#f59e0b" : "#3b82f6",
                  fillOpacity: 0.15, weight: 2,
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs">
                    <div className="font-bold text-rose-600 uppercase text-[10px]">GWMC Civic Hotspot</div>
                    <div className="text-sm font-black text-slate-900">{h.dominant_category}</div>
                    <div className="text-slate-600 font-semibold">{h.complaint_count} incidents in zone</div>
                    <div className="pt-1"><SeverityBadge level={h.dominant_severity} /></div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Warangal Map Overview Image */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-soft">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">GWMC Warangal Smart City Zone Overview</div>
        <img src="/warangal_map.jpg" alt="GWMC Warangal Zone Map" className="w-full rounded-2xl object-cover max-h-80 border border-slate-100" />
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          AI-generated reference illustration of GWMC civic issue zones across Hanamkonda, Kazipet, NIT Warangal, MGM Hospital, and Fort Warangal areas.
        </p>
      </div>

      {/* Hotspot Summary Cards */}
      {data.hotspots?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.hotspots.map((h, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">GWMC Hotspot #{h.cluster_id + 1}</span>
                <SeverityBadge level={h.dominant_severity} />
              </div>
              <div className="text-sm font-bold text-emerald-800">{h.dominant_category}</div>
              <p className="text-xs text-slate-500">
                <strong>{h.complaint_count} verified GWMC complaints</strong> clustered within {eps} km radius.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
