export type CRDRegion = "core" | "westshore" | "peninsula" | "other";

export type VacancyReporterRole = "provider" | "parent" | "facebook";

export type AgeVacancyStatus = "available" | "waitlist" | "unreported";

export interface VacancyAgeStatuses {
  under36: AgeVacancyStatus;
  preschool30to5: AgeVacancyStatus;
  licPre: AgeVacancyStatus;
  schoolAge: AgeVacancyStatus;
}

export interface VacancyOverride {
  id?: string;
  facilityId: string;
  facilityName: string;
  vacancyInd: "Y" | "N";
  vacancyUnder36: boolean;
  vacancy30mos5yrs: boolean;
  vacancyLicpre: boolean;
  vacancyOosGr1Age12: boolean;
  ageStatuses?: VacancyAgeStatuses;
  reporterRole: VacancyReporterRole;
  verifiedProvider: boolean;
  note?: string;
  updatedAt: string;
  expiresAt: string;
}

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
  isCcfri: boolean;
  vacancyUnder36: boolean;
  vacancy30mos5yrs: boolean;
  vacancyLicpre: boolean;
  vacancyOosGr1Age12: boolean;
  communityVacancy?: VacancyOverride;
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
  correctiveActions?: string;
}

export interface InspectionDetail {
  id: string;
  date: string;
  type: string;
  contraventions: Contravention[];
}

export interface InspectionRecord {
  facilityId: string;
  permitID: string;
  inspectionUrl: string;
  serviceType?: string;
  inspections: InspectionDetail[];
  allFetched?: boolean;
}
