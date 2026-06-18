import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
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
import facilitiesData from "../../data/facilities.json";
import inspectionsData from "../../data/inspections.json";

const allFacilities = facilitiesData as Facility[];
const inspections = inspectionsData as InspectionRecord[];

const inspectionMap = new Map<string, InspectionRecord>();
for (const rec of inspections) {
  inspectionMap.set(rec.facilityId, rec);
}

const VICTORIA_CENTER: [number, number] = [48.4284, -123.3656];

function buildPopupHtml(f: Facility): string {
  const inspection = inspectionMap.get(f.id);
  const inspectionLink = inspection?.inspectionUrl
    ?? `https://inspections.myhealthdepartment.com/island-health/program-ccfl?facility_name=${encodeURIComponent(f.name)}`;

  const uncorrected = inspection?.contraventions.filter((c) => !c.corrected) ?? [];

  const badge = f.isTenDollarDay
    ? `<span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:11px;padding:2px 6px;border-radius:9999px;margin-bottom:4px;">$10/day</span><br/>`
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
  const vacancy = f.vacancyInd === "Y"
    ? `<span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:11px;padding:2px 6px;border-radius:9999px;margin-top:4px;">Vacancy reported</span>`
    : "";

  let inspectionHtml = "";
  if (inspection && inspection.lastInspectionDate) {
    inspectionHtml += `<div style="font-size:11px;color:#6b7280;margin-top:4px;">Last inspected: ${inspection.lastInspectionDate} (${inspection.lastInspectionType})</div>`;
  }
  if (uncorrected.length > 0) {
    inspectionHtml += `<div style="margin-top:4px;background:#fef3c7;border:1px solid #fcd34d;border-radius:4px;padding:4px 6px;font-size:11px;color:#92400e;">&#9888; ${uncorrected.length} outstanding issue${uncorrected.length > 1 ? "s" : ""}</div>`;
  } else if (inspection && inspection.lastInspectionDate) {
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
      ${inspectionHtml}
      <div style="margin-top:8px;border-top:1px solid #e5e7eb;padding-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="window.dispatchEvent(new CustomEvent('open-tracker',{detail:'${f.id}'}))" style="background:#059669;color:white;border:none;padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;">
          Open in tracker
        </button>
        <a href="${inspectionLink}" target="_blank" rel="noopener noreferrer" style="background:#fef3c7;color:#92400e;border:none;padding:5px 12px;border-radius:6px;font-size:12px;text-decoration:none;">
          Inspections
        </a>
      </div>
    </div>
  `;
}

function MarkerLayer({ facilities }: { facilities: Facility[] }) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });

    facilities.forEach((f) => {
      if (!f.lat || !f.lng) return;
      const inspection = inspectionMap.get(f.id);
      const hasWarning = inspection?.contraventions.some((c) => !c.corrected) ?? false;
      const color = hasWarning ? "#d97706" : f.isTenDollarDay ? "#16a34a" : "#059669";
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
    });

    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [map, facilities]);

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
      className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50 disabled:opacity-50"
    >
      {locating ? "Locating..." : "Center on me"}
    </button>
  );
}

export default function FacilityMap() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Filters onChange={setFilters} />
      <p className="border-b border-stone-200 bg-white px-4 py-1.5 text-xs text-gray-400">
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
            <MarkerLayer facilities={filtered} />
            <LocateButton />
          </MapContainer>
        </div>
        {selectedFacilityId && (
          <aside className="w-80 overflow-y-auto border-l border-stone-200 bg-white p-4">
            <FacilityDetail facilityId={selectedFacilityId} />
          </aside>
        )}
      </div>
    </div>
  );
}
