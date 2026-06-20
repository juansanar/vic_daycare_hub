import fs from 'fs';
import path from 'path';

const currentGeojsonPath = '/Users/juansanar/Developer/vic_daycare_hub/public/school_catchments.geojson';
const sd63RawPath = '/Users/juansanar/.gemini/antigravity-ide/brain/48d3cac5-0de0-4d19-a4bd-3ad26ccb343f/.system_generated/steps/105/content.md';

function unObs(coordArray: [string, string]): [number, number] {
  if (!coordArray || coordArray.length < 2) return [0, 0];
  
  const decodeStr = (str: string): string => {
    const cleaned = str.replace(/(.{4})./g, "$1");
    const matched = cleaned.match(/.{1,4}/g);
    if (!matched) return "";
    return String.fromCharCode(...matched.map(code => parseInt(code, 10)));
  };

  const lon = Number(decodeStr(coordArray[0]));
  const lat = Number(decodeStr(coordArray[1]));
  return [lon, lat];
}

// 1. Read current GeoJSON
const currentGeojson = JSON.parse(fs.readFileSync(currentGeojsonPath, 'utf8'));

// Filter out old general SD63 district outlines
const filteredFeatures = currentGeojson.features.filter((f: any) => {
  const schoolName = f.properties.school;
  return schoolName !== 'Saanich SD63' && schoolName !== 'Saanich SD63_lbl';
});

// Mark SD61 features with district property
filteredFeatures.forEach((f: any) => {
  f.properties.district = 'SD61';
});

// 2. Read and parse SD63 data
const sd63RawContent = fs.readFileSync(sd63RawPath, 'utf8');
const jsonStart = sd63RawContent.indexOf('var sbc = [');
if (jsonStart === -1) {
  console.error("Could not find sbc variable in SD63 raw content");
  process.exit(1);
}

// Extract the JS array string
// The file is: var sbc = [ {...} ];
// Let's get the string from index of '[' to last index of ']'
const arrayStart = sd63RawContent.indexOf('[', jsonStart);
const arrayEnd = sd63RawContent.lastIndexOf(']');
const sd63JsonString = sd63RawContent.substring(arrayStart, arrayEnd + 1);

// Parse the JS array
// Since the keys are quoted, we can convert single quotes to double quotes to make it valid JSON
const sd63Data = JSON.parse(sd63JsonString.replace(/'/g, '"'));
const sd63Features = sd63Data[0].features;

console.log(`Parsed ${sd63Features.length} features from SD63 source.`);

// Decode SD63 geometries
const sd63GeojsonFeatures = sd63Features.map((f: any) => {
  const geomType = f.geometry.type;
  let coords: any;

  if (geomType === 'Polygon') {
    coords = f.geometry.coordinates.map((ring: any) => {
      return ring.map((pair: [string, string]) => unObs(pair));
    });
  } else if (geomType === 'MultiPolygon') {
    coords = f.geometry.coordinates.map((polygon: any) => {
      return polygon.map((ring: any) => {
        return ring.map((pair: [string, string]) => unObs(pair));
      });
    });
  } else {
    // Fallback if Point or other
    coords = f.geometry.coordinates;
  }

  return {
    type: "Feature",
    geometry: {
      type: geomType,
      coordinates: coords
    },
    properties: {
      school: `${f.properties.Name} (SD63)`,
      label: f.properties.Name,
      district: 'SD63',
      objectId: f.id
    }
  };
});

// 3. Merge features
const mergedFeatures = [...filteredFeatures, ...sd63GeojsonFeatures];

const mergedGeojson = {
  type: "FeatureCollection",
  features: mergedFeatures
};

fs.writeFileSync(currentGeojsonPath, JSON.stringify(mergedGeojson, null, 2));
console.log(`Successfully merged features! Total features now: ${mergedFeatures.length}`);
