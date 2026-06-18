# Victoria Childcare Hub

A free, open-source childcare hub for Victoria and surrounding areas. Find licensed childcare facilities on an interactive map, with personal tracking, $10/day flags, and inspection data.

**Live app:** (deployment URL will go here once published)

## Features

- **400+ licensed facilities** sourced from the [BC Community Care Facility Registry](https://catalogue.data.gov.bc.ca/dataset/4cc207cc-ff03-44f8-8c5f-415af5224646)
- **Interactive map** with clustered markers (Leaflet + OpenStreetMap)
- **Personal tracker** — log your status, waitlist dates, costs, and notes (saved in your browser, no account needed)
- **$10/day ChildCareBC centres** clearly flagged
- **Nanny/caregiver log** for informal care options
- **Resources** — funding explainer (CCFRI, ACCB, $10/day), questions to ask, document checklist
- **Export/import** your tracker data as JSON for backup or device transfer

## Tech Stack

- Vite + React + TypeScript + Tailwind CSS (static SPA)
- Zustand (browser-local state persistence)
- Leaflet + react-leaflet + leaflet.markercluster (maps)
- Deployed on Netlify (pure static, no backend)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Updating Facility Data

The facility list is a committed JSON snapshot. To refresh it from the BC government API:

```bash
npm run ingest
```

This fetches from the BC ArcGIS REST API, filters to Victoria + Westshore, merges $10/day flags, and writes `data/facilities.json` + `data/meta.json`. Commit the result.

## Buy Me a Coffee (Donations)

This tool is completely free. If you find it helpful, you can support the project:

Set the `VITE_BMC_USERNAME` environment variable to your Buy Me a Coffee username. The app renders a donation link button using this value.

```bash
# .env.local (not committed)
VITE_BMC_USERNAME=your_username_here
```

## Data Attribution

Facility data is sourced from the British Columbia government under the [BC Open Government Licence](https://www2.gov.bc.ca/gov/content/data/open-data/open-government-licence-bc).

**Disclaimer:** Availability, fees, and program status change frequently. Always contact facilities directly to confirm current information.

## License

[MIT](LICENSE)
