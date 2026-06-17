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

function MarkerLayer() {
  const map = useMap();
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });

    facilities.forEach((f) => {
      if (!f.lat || !f.lng) return;
      const isSelected = f.id === selectedFacilityId;
      const color = f.isTenDollarDay ? "#16a34a" : "#4f46e5";
      const size = isSelected ? 16 : 12;
      const marker = L.marker([f.lat, f.lng]);
      marker.setIcon(
        L.divIcon({
          className: "",
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${isSelected ? "#fbbf24" : "white"};box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
      );
      marker.bindTooltip(f.name);
      marker.on("click", () => setSelectedFacility(f.id));
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [map, setSelectedFacility, selectedFacilityId]);

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
