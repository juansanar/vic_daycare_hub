import json
import os

GEOJSON_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../public/school_catchments.geojson"
    )
)

def main():
    print(f"Reading GeoJSON from: {GEOJSON_PATH}")
    with open(GEOJSON_PATH, "r") as f:
        data = json.load(f)

    # Detailed coordinates mapping actual road paths and shoreline curves
    sd62_catchments = [
        {
            "school": "Willway Elementary (SD62)",
            "coordinates": [
                [
                    [-123.5186, 48.4370],  # Sooke & Happy Valley
                    [-123.5480, 48.4370],  # West edge along Sooke Rd
                    [-123.5480, 48.4650],  # Northwest corner (TCH/Goldstream Park)
                    [-123.5150, 48.4620],  # Langford Lake North
                    [-123.5015, 48.4560],  # Station Ave area
                    [-123.5005, 48.4485],  # Jacklin & Goldstream
                    [-123.5042, 48.4410],  # Jacklin & Sooke
                    [-123.5186, 48.4370]   # Close loop
                ]
            ]
        },
        {
            "school": "Savory Elementary (SD62)",
            "coordinates": [
                [
                    [-123.5005, 48.4485],  # Jacklin & Goldstream
                    [-123.4855, 48.4502],  # Goldstream & Veterans
                    [-123.4800, 48.4580],  # Northeast boundary
                    [-123.5015, 48.4560],  # Station & Jacklin
                    [-123.5005, 48.4485]   # Close loop
                ]
            ]
        },
        {
            "school": "Ruth King Elementary (SD62)",
            "coordinates": [
                [
                    [-123.5005, 48.4485],  # Jacklin & Goldstream
                    [-123.4950, 48.4496],  # Goldstream Ave
                    [-123.4960, 48.4540],  # Station Ave area
                    [-123.5015, 48.4560],  # Station & Jacklin
                    [-123.5005, 48.4485]   # Close loop
                ]
            ]
        },
        {
            "school": "David Cameron Elementary (SD62)",
            "coordinates": [
                [
                    [-123.5042, 48.4410],  # Sooke & Jacklin
                    [-123.5005, 48.4485],  # Jacklin & Goldstream
                    [-123.4855, 48.4502],  # Goldstream & Veterans
                    [-123.4912, 48.4342],  # Sooke & Veterans
                    [-123.5042, 48.4410]   # Close loop
                ]
            ]
        },
        {
            "school": "Colwood Elementary (SD62)",
            "coordinates": [
                [
                    [-123.4912, 48.4342],  # Sooke & Veterans
                    [-123.4862, 48.4325],  # Sooke Rd
                    [-123.4780, 48.4320],
                    [-123.4712, 48.4332],  # Sooke & Metchosin
                    [-123.4750, 48.4280],  # South on Metchosin
                    [-123.4800, 48.4210],
                    [-123.4820, 48.4140],  # Metchosin & Wishart
                    [-123.4880, 48.4150],  # West on Wishart
                    [-123.4920, 48.4110],
                    [-123.4912, 48.4342]   # Close loop
                ]
            ]
        },
        {
            "school": "Crystal View Elementary (SD62)",
            "coordinates": [
                [
                    [-123.4765, 48.4345],  # Sooke & Aldeane
                    [-123.4680, 48.4485],  # Sooke Rd North
                    [-123.4500, 48.4400],  # Lagoon East Boundary
                    [-123.4616, 48.4326],  # Lagoon Outlet
                    [-123.4712, 48.4332],  # Sooke & Metchosin
                    [-123.4765, 48.4345]   # Close loop
                ]
            ]
        },
        {
            "school": "Happy Valley Elementary (SD62)",
            "coordinates": [
                [
                    [-123.5350, 48.4110],  # Happy Valley & Latoria
                    [-123.5480, 48.4020],  # Southwest district edge
                    [-123.5480, 48.4370],  # West boundary along hills
                    [-123.5186, 48.4370],  # Sooke & Happy Valley
                    [-123.5220, 48.4300],  # South on Happy Valley Rd
                    [-123.5255, 48.4240],
                    [-123.5290, 48.4190],
                    [-123.5350, 48.4110]   # Close loop
                ]
            ]
        },
        {
            "school": "Wishart Elementary (SD62)",
            "coordinates": [
                [
                    [-123.4835, 48.4120],  # Metchosin & Wishart
                    [-123.4942, 48.4068],  # Wishart & Latoria
                    [-123.4975, 48.4075],  # Latoria Rd
                    [-123.5290, 48.4190],  # Happy Valley Rd corner
                    [-123.5180, 48.4260],
                    [-123.4912, 48.4342],  # Sooke & Veterans
                    [-123.4835, 48.4120]   # Close loop
                ]
            ]
        },
        {
            "school": "Sangster Elementary (SD62)",
            "coordinates": [
                [
                    [-123.4835, 48.4120],  # Metchosin & Wishart
                    [-123.4942, 48.4068],  # Metchosin & Latoria area
                    [-123.4792, 48.3980],  # Coastline south
                    [-123.4735, 48.4116],  # Coastline middle
                    [-123.4688, 48.4230],  # Coastline north
                    [-123.4835, 48.4120]   # Close loop
                ]
            ]
        }
    ]

    # Filter out previous runs
    original_features = [
        f for f in data["features"]
        if not (f["properties"].get("school", "").endswith("(SD62)") and f["properties"].get("district") == "SD62")
    ]

    new_features = list(original_features)
    start_id = 5000

    for index, c in enumerate(sd62_catchments):
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": c["coordinates"]
            },
            "properties": {
                "school": c["school"],
                "label": "",
                "objectId": start_id + index,
                "district": "SD62"
            }
        }
        new_features.append(feature)

    data["features"] = new_features

    print(f"Adding {len(sd62_catchments)} SD62 school catchment polygons. Total features: {len(data['features'])}")

    with open(GEOJSON_PATH, "w") as f:
        json.dump(data, f, indent=2)

    print("GeoJSON file updated successfully!")

if __name__ == "__main__":
    main()
