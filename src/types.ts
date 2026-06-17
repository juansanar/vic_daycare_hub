export interface Facility {
  id: string;
  name: string;
  address: string;
  locality: string;
  postalCode: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  serviceType: string;
  vacancyInd: string;
  isTenDollarDay: boolean;
  area: "victoria" | "westshore";
}

export type TrackerStatus =
  | "none"
  | "contacted"
  | "called"
  | "waitlisted"
  | "enrolled"
  | "ruled_out";

export interface TrackerEntry {
  facilityId: string;
  status: TrackerStatus;
  waitlistDate: string;
  costNotes: string;
  foodNotes: string;
  ccfriNotes: string;
  notes: string;
}

export interface NannyEntry {
  id: string;
  name: string;
  rate: string;
  availability: string;
  references: string;
  cprCert: boolean;
  criminalCheck: boolean;
  notes: string;
}

export interface Meta {
  lastUpdated: string;
  count: number;
}
