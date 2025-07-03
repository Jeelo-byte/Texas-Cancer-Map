
export interface GeoJSONFeature {
  type: string;
  properties: {
    NAME: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}
