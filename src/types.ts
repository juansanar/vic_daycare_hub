export type CRDRegion = "core" | "westshore" | "peninsula" | "other";

export interface Facility {
  id: string;
  name: string;
  address: string;
  locality: string;
  postalCode: string;
  municipality: string;
  region: CRDRegion;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  serviceType: string;
  ageGroups: string[];
  vacancyInd: string;
  vacancyForLicense?: string;
  vacancyLastUpdated?: string;
  isTenDollarDay: boolean;
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

export interface Meta {
  lastUpdated: string;
  count: number;
}

export interface Contravention {
  code: string;
  description: string;
  observations: string;
  correctByDate: string;
  corrected: boolean;
}

export interface InspectionRecord {
  facilityId: string;
  permitID: string;
  inspectionUrl: string;
  lastInspectionDate: string;
  lastInspectionType: string;
  serviceType?: string;
  contraventions: Contravention[];
}
