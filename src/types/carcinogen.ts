export interface Carcinogen {
  id: string;
  name: string;
  description?: string;
  type?: string;
  effects?: string;
}

export interface Cancer {
  id: string;
  name: string;
  description?: string;
}

export interface CarcinogenCancerLink {
  id: string;
  carcinogen_id: string;
  cancer_id: string;
  description?: string;
}

export interface EnvironmentalSiteCarcinogen {
  id: string;
  site_id: string;
  carcinogen_id: string;
  description?: string;
} 