import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import type { Facility } from "../types";
import { useStore } from "../store";
import FacilityDetail from "./FacilityDetail";
import facilitiesData from "../../data/facilities.json";

const facilities = facilitiesData as Facility[];

const VICTORIA_CENTER: [number, number] = [48.4284, -123.3656];

function buildPopupHtml(f: Facility): string {
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
    ? `<div><a href="${f.website}" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;">Visit website</a></div>`
    : "";
  const vacancy = f.vacancyInd === "Y"
    ? `<span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:11px;padding:2px 6px;border-radius:9999px;margin-top:4px;">Vacancy reported</span>`
    : "";

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
      <div style="margin-top:8px;border-top:1px solid #e5e7eb;padding-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
        <button onclick="window.dispatchEvent(new CustomEvent('open-tracker',{detail:'${f.id}'}))" style="background:#4f46e5;color:white;border:none;padding:5px 12px;border-radius:6px;font-size:12px;cursor:pointer;">
          Open in tracker
        </button>
        <a href="https://inspections.myhealthdepartment.com/island-health/program-ccfl?facility_name=${encodeURIComponent(f.name)}" target="_blank" rel="noopener noreferrer" style="background:#fef3c7;color:#92400e;border:none;padding:5px 12px;border-radius:6px;font-size:12px;text-decoration:none;">
          Inspections
        </a>
      </div>
    </div>
  `;
}

function MarkerLayer() {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });

    facilities.forEach((f) => {
      if (!f.lat || !f.lng) return;
      const color = f.isTenDollarDay ? "#16a34a" : "#4f46e5";
      const marker = L.marker([f.lat, f.lng]);
      marker.setIcon(
        L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
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
  }, [map]);

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
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail;
      setSelectedFacility(id);
    };
    window.addEventListener("open-tracker", handler);
    return () => window.removeEventListener("open-tracker", handler);
  }, [setSelectedFacility]);

  return (
    <div className="relative flex flex-1">
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
          <MarkerLayer />
          <LocateButton />
        </MapContainer>
      </div>
      {selectedFacilityId && (
        <aside className="w-80 overflow-y-auto border-l bg-white p-4">
          <FacilityDetail facilityId={selectedFacilityId} />
        </aside>
      )}
    </div>
  );
}
