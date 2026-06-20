import fs from 'fs';
import path from 'path';

const dataPath = '/Users/juansanar/.gemini/antigravity-ide/brain/48d3cac5-0de0-4d19-a4bd-3ad26ccb343f/.system_generated/steps/29/content.md';
const content = fs.readFileSync(dataPath, 'utf8');

const jsonStart = content.indexOf('{');
if (jsonStart === -1) {
  console.error("Could not find JSON object");
  process.exit(1);
}

const data = JSON.parse(content.substring(jsonStart));
const features = data.layers[0].featureSet.features;

function project(x: number, y: number): [number, number] {
  const lon = (x / 20037508.34) * 180;
  const lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((y / 20037508.34) * Math.PI)) - Math.PI / 2);
  return [lon, lat];
}

const geojsonFeatures = features.map((f: any) => {
  const rings = f.geometry.rings;
  
  // Convert rings from EPSG:3857 to EPSG:4326 (lon, lat)
  const projectedRings = rings.map((ring: any) => 
    ring.map((coord: [number, number]) => project(coord[0], coord[1]))
  );

  // In ArcGIS, multiple rings can be multiple polygons (MultiPolygon) or holes.
  // For standard school catchments, they are usually single Polygons.
  // If there's only 1 ring, it's a simple Polygon.
  // If there are multiple rings, we can represent it as a MultiPolygon where each ring is its own polygon,
  // or a single Polygon where subsequent rings are holes.
  // To be safe and simple: if multiple rings exist, check if we should map as MultiPolygon.
  // A robust way to check: school boundaries are mostly MultiPolygons if they have islands, 
  // or a single Polygon if it has holes.
  // Let's create a MultiPolygon if there are multiple rings, or a Polygon if there is only 1.
  // Wait! In GeoJSON MultiPolygon coordinates format is: [[[[lon, lat], ...]], [[[lon, lat], ...]]]
  // Whereas Polygon coordinates format is: [[[lon, lat], ...], [[lon, lat], ...]] (exterior, holes)
  // Let's check how many rings each feature has.
  let geometry: any;
  if (projectedRings.length === 1) {
    geometry = {
      type: "Polygon",
      coordinates: projectedRings
    };
  } else {
    // If a feature has multiple rings, let's treat it as a MultiPolygon (each ring is a separate polygon)
    // or as a Polygon with holes. Let's see if we can do a standard MultiPolygon.
    // Actually, in Victoria, some school catchments might include islands (e.g. Oak Bay, James Bay, etc.),
    // so they are MultiPolygons. Treating each ring as a separate polygon in a MultiPolygon is generally safer
    // unless one ring is inside another (a hole). 
    // Let's output it as a MultiPolygon where each ring is a polygon with no holes:
    geometry = {
      type: "MultiPolygon",
      coordinates: projectedRings.map((ring: any) => [ring])
    };
  }

  return {
    type: "Feature",
    geometry: geometry,
    properties: {
      school: f.attributes.School || f.attributes.Label || 'Unknown',
      label: f.attributes.Label || '',
      objectId: f.attributes.ObjectId
    }
  };
});

const geojson = {
  type: "FeatureCollection",
  features: geojsonFeatures
};

const outputPath = path.join('/Users/juansanar/Developer/vic_daycare_hub', 'public', 'school_catchments.geojson');
fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
console.log(`Successfully converted ${features.length} features to GeoJSON and saved to ${outputPath}`);
