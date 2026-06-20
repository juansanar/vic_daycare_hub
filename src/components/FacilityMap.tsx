import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import type { Facility, InspectionRecord } from "../types";
import { useStore } from "../store";
import { filterFacilities, defaultFilters } from "../lib/filters";
import type { FilterState } from "../lib/filters";
import FacilityDetail from "./FacilityDetail";
import Filters from "./Filters";
import {
  BC_CHILD_CARE_MAP_URL,
  CONTACT_CENTRE_COPY,
  hasVacancyReported,
  VACANCY_SOURCE_COPY,
  vacancyDetailLines,
} from "../lib/vacancy";
import facilitiesData from "../../data/facilities.json";
import inspectionsData from "../../data/inspections.json";

const allFacilities = facilitiesData as Facility[];
const inspections = inspectionsData as unknown as InspectionRecord[];

const inspectionMap = new Map<string, InspectionRecord>();
for (const rec of inspections) {
  inspectionMap.set(rec.facilityId, rec);
}

const VICTORIA_CENTER: [number, number] = [48.4284, -123.3656];

function buildPopupHtml(f: Facility): string {
  const inspection = inspectionMap.get(f.id);
  const inspectionLink = inspection?.inspectionUrl
    ?? `https://inspections.myhealthdepartment.com/island-health/program-ccfl?facility_name=${encodeURIComponent(f.name)}`;

  const latestInspection = inspection?.inspections?.[0];
  const uncorrected = latestInspection?.contraventions?.filter((c) => !c.corrected) ?? [];

  const badge = f.isTenDollarDay
    ? `<span style="display:inline-block;background:#e0e7ff;color:#4338ca;font-size:11px;padding:2px 6px;border-radius:9999px;margin-bottom:4px;">$10/day</span><br/>`
    : "";
  const phone = f.phone
    ? `<div style="margin-top:4px;"><strong>Phone:</strong> <a href="tel:${f.phone}">${f.phone}</a></div>`
    : "";
  const email = f.email
    ? `<div><strong>Email:</strong> <a href="mailto:${f.email}">${f.email}</a></div>`
    : "";
  const website = f.website
    ? `<div><a href="${f.website}" target="_blank" rel="noopener noreferrer" style="color:#047857;">Visit website</a></div>`
    : "";
  const vacancy = hasVacancyReported(f)
    ? `<div style="margin-top:6px;padding:6px 8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;font-size:11px;color:#1e40af;line-height:1.4;">
        <strong>Vacancy reported</strong><br/>
        <span style="display:block;color:#374151;margin-top:2px;">${VACANCY_SOURCE_COPY}</span>
        ${vacancyDetailLines(f).map((line) => `<span style="display:block;color:#374151;margin-top:2px;">${line}</span>`).join("")}
        <span style="display:block;margin-top:4px;color:#374151;">Source: <a href="${BC_CHILD_CARE_MAP_URL}" target="_blank" rel="noopener noreferrer" style="color:#0369a1;">BC Child Care Map</a></span>
      </div>`
    : "";
  const contactNote = `<div style="margin-top:6px;padding:6px 8px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:6px;font-size:11px;color:#57534e;line-height:1.4;">${CONTACT_CENTRE_COPY}</div>`;

  let inspectionHtml = "";
  if (inspection && latestInspection) {
    inspectionHtml += `<div style="font-size:11px;color:#6b7280;margin-top:4px;">Last inspected: ${latestInspection.date} (${latestInspection.type})</div>`;
  }
  if (uncorrected.length > 0) {
    inspectionHtml += `<div style="margin-top:4px;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;padding:4px 6px;font-size:11px;color:#92400e;">&#9888; ${uncorrected.length} outstanding issue${uncorrected.length > 1 ? "s" : ""}</div>`;
  } else if (inspection && latestInspection) {
    inspectionHtml += `<div style="margin-top:4px;font-size:11px;color:#16a34a;">&#10003; No outstanding issues</div>`;
  }

  return `
    <div style="min-width:200px;max-width:280px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.4;">
      ${badge}
      <strong style="font-size:14px;">${f.name}</strong>
      <div style="color:#6b7280;margin-top:4px;">${f.address}, ${f.municipality} ${f.postalCode}</div>
      <div style="color:#6b7280;font-size:12px;margin-top:2px;">${f.serviceType}</div>
      ${phone}
      ${email}
      ${website}
      ${vacancy}
      ${contactNote}
      ${inspectionHtml}
      <div style="margin-top:8px;border-top:1px solid #e5e7eb;padding-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="window.dispatchEvent(new CustomEvent('open-tracker',{detail:'${f.id}'}))" style="background:#059669;color:white;border:none;padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;">
          Open in tracker
        </button>
        <a href="${inspectionLink}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" style="background:#fef3c7;color:#92400e;border:none;padding:5px 12px;border-radius:6px;font-size:12px;text-decoration:none;">
          Inspections
        </a>
      </div>
    </div>
  `;
}

function MarkerLayer({ facilities }: { facilities: Facility[] }) {
  const map = useMap();
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clusterRef = useRef<any>(null);

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });
    clusterRef.current = cluster;

    markersRef.current.clear();

    facilities.forEach((f) => {
      if (!f.lat || !f.lng) return;
      const inspection = inspectionMap.get(f.id);
      const latestInspection = inspection?.inspections?.[0];
      const hasWarning = latestInspection?.contraventions?.some((c) => !c.corrected) ?? false;
      const color = hasWarning ? "#d97706" : f.isTenDollarDay ? "#4f46e5" : "#059669";
      const marker = L.marker([f.lat, f.lng]);
      marker.setIcon(
        L.divIcon({
          className: "",
          html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.1)"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      );
      marker.bindTooltip(f.name);
      marker.bindPopup(buildPopupHtml(f), { maxWidth: 300 });
      
      cluster.addLayer(marker);
      markersRef.current.set(f.id, marker);
    });

    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map, facilities]);

  // Center the map and open popup on the selected facility
  useEffect(() => {
    if (!selectedFacilityId || !clusterRef.current) return;
    const marker = markersRef.current.get(selectedFacilityId);
    if (marker) {
      clusterRef.current.zoomToShowLayer(marker, () => {
        marker.openPopup();
      });
    }
  }, [selectedFacilityId, facilities]);

  return null;
}

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 14 });
    map.once("locationfound", (e) => {
      setLocating(false);
      L.circleMarker(e.latlng, {
        radius: 8,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.5,
      })
        .addTo(map)
        .bindTooltip("You are here");
    });
    map.once("locationerror", () => {
      setLocating(false);
    });
  }, [map]);

  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50 disabled:opacity-50 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:border-stone-800"
    >
      {locating ? "Locating..." : "Center on me"}
    </button>
  );
}

function getSchoolColor(schoolName: string): string {
  let hash = 0;
  for (let i = 0; i < schoolName.length; i++) {
    hash = schoolName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 65%, 55%)`;
}

function getCatchmentStyle(feature: any) {
  const schoolName = feature?.properties?.school || "";
  const isDistrictOutline = schoolName.includes("Sooke SD62");

  if (isDistrictOutline) {
    return {
      fill: false,
      color: "#ef4444",
      weight: 2.5,
      dashArray: "5, 5",
      opacity: 0.85
    };
  }

  const color = getSchoolColor(schoolName);
  return {
    fillColor: color,
    fillOpacity: 0.2,
    color: color,
    weight: 1.5,
    opacity: 0.7
  };
}

const onEachFeature = (feature: any, layer: any) => {
  const schoolName = feature.properties.school;
  const isDistrictOutline = schoolName.includes("Sooke SD62");

  if (isDistrictOutline) {
    layer.bindTooltip(`Sooke SD62 District Boundary`, { sticky: true });
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;">
        <strong style="font-size:13px;color:#ef4444;">Sooke School District (SD62)</strong>
        <div style="margin-top:4px;color:#4b5563;">School district boundary line. Elementary school catchments are not shown for this district.</div>
      </div>
    `);
  } else {
    const district = feature.properties.district || "SD61";
    layer.bindTooltip(`${schoolName} Catchment`, { sticky: true });
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;">
        <strong style="font-size:13px;color:#059669;">${schoolName}</strong>
        <div style="margin-top:4px;color:#4b5563;">${district} Elementary School Catchment area.</div>
      </div>
    `);
  }

  layer.on({
    mouseover: (e: any) => {
      const l = e.target;
      l.setStyle({
        weight: isDistrictOutline ? 4.0 : 3.0,
        fillOpacity: isDistrictOutline ? 0 : 0.4,
      });
    },
    mouseout: (e: any) => {
      const l = e.target;
      l.setStyle({
        weight: isDistrictOutline ? 2.5 : 1.5,
        fillOpacity: isDistrictOutline ? 0 : 0.2,
      });
    }
  });
};

/*
function CatchmentToggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
      <button
        onClick={() => onChange(!active)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold shadow-md transition-all backdrop-blur-md ${
          active
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:border-emerald-450 dark:bg-emerald-450/15 dark:text-emerald-400"
            : "border-stone-200 bg-white/90 text-gray-700 hover:bg-stone-50 dark:border-stone-850 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:bg-stone-800"
        }`}
      >
        <span className="text-[14px]">🎒</span>
        {active ? "Hide Elementary School Catchments" : "Show Elementary School Catchments"}
      </button>
    </div>
  );
}
*/

function MapLegend({ showCatchments }: { showCatchments: boolean }) {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-stone-200 bg-white p-3 shadow-md space-y-2 text-[11px] pointer-events-auto dark:border-stone-800 dark:bg-stone-900">
      <p className="font-bold text-gray-500 uppercase tracking-wider text-[9px] mb-1 dark:text-stone-400">
        Map Legend
      </p>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full border border-white bg-[#059669] shadow-sm ring-1 ring-stone-900/10"></span>
        <span className="text-gray-600 font-medium dark:text-stone-300">Licensed Facility</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full border border-white bg-[#4f46e5] shadow-sm ring-1 ring-stone-900/10"></span>
        <span className="text-gray-600 font-medium dark:text-stone-300">$10/day ChildCareBC</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full border border-white bg-[#d97706] shadow-sm ring-1 ring-stone-900/10"></span>
        <span className="text-gray-600 font-medium dark:text-stone-300">Outstanding Issues</span>
      </div>
      {showCatchments && (
        <>
          <div className="h-px bg-stone-200 dark:bg-stone-800 my-1.5"></div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-5 rounded border border-emerald-500 bg-emerald-500/20 shadow-sm"></span>
            <span className="text-gray-600 font-medium dark:text-stone-300">SD61 / SD63 Elem. Catchment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0 w-5 border-t border-dashed border-red-500"></span>
            <span className="text-gray-600 font-medium dark:text-stone-300">SD62 district boundary</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function FacilityMap() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showCatchments] = useState(false);
  const [catchmentData, setCatchmentData] = useState<any>(null);
  const trackerEntries = useStore((s) => s.trackerEntries);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);

  const filtered = filterFacilities(allFacilities, filters, trackerEntries);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail;
      setSelectedFacility(id);
    };
    window.addEventListener("open-tracker", handler);
    return () => window.removeEventListener("open-tracker", handler);
  }, [setSelectedFacility]);

  useEffect(() => {
    if (showCatchments && !catchmentData) {
      fetch("/school_catchments.geojson")
        .then((res) => res.json())
        .then((data) => setCatchmentData(data))
        .catch((err) => console.error("Error loading catchments:", err));
    }
  }, [showCatchments, catchmentData]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Filters onChange={setFilters} />
      <p className="border-b border-stone-200 bg-white px-4 py-1.5 text-xs text-gray-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-500">
        {filtered.length} facilities on map
      </p>
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1">
          <MapContainer
            center={VICTORIA_CENTER}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {showCatchments && catchmentData && (
              <GeoJSON
                data={catchmentData}
                style={getCatchmentStyle}
                onEachFeature={onEachFeature}
              />
            )}
            <MarkerLayer facilities={filtered} />
            <LocateButton />
            {/* <CatchmentToggle active={showCatchments} onChange={setShowCatchments} /> */}
            <MapLegend showCatchments={showCatchments} />
          </MapContainer>
        </div>
        {selectedFacilityId && (
          <aside className="w-80 overflow-y-auto border-l border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <FacilityDetail facilityId={selectedFacilityId} />
          </aside>
        )}
      </div>
    </div>
  );
}
