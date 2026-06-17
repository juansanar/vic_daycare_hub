import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import type { Facility } from "../types";
import { useStore } from "../store";
import facilitiesData from "../../data/facilities.json";

const facilities = facilitiesData as Facility[];

const VICTORIA_CENTER: [number, number] = [48.4284, -123.3656];

function MarkerLayer() {
  const map = useMap();
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);

  useEffect(() => {
    const cluster = L.markerClusterGroup();

    facilities.forEach((f) => {
      if (!f.lat || !f.lng) return;
      const marker = L.marker([f.lat, f.lng]);
      const color = f.isTenDollarDay ? "#16a34a" : "#4f46e5";
      marker.setIcon(
        L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
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
  }, [map, setSelectedFacility]);

  return null;
}

export default function FacilityMap() {
  return (
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
      </MapContainer>
    </div>
  );
}
