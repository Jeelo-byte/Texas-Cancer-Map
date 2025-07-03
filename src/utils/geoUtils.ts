
import { GeoJSONFeature } from "@/types/geoTypes";

export const renderCountyPath = (feature: GeoJSONFeature): string | null => {
  if (!feature.geometry || (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')) {
    return null;
  }

  let pathData = '';
  
  if (feature.geometry.type === 'Polygon') {
    const coords = feature.geometry.coordinates as number[][][];
    pathData = coordsToPath(coords[0]);
  } else if (feature.geometry.type === 'MultiPolygon') {
    const coords = feature.geometry.coordinates as number[][][][];
    pathData = coords
      .map(polygon => coordsToPath(polygon[0]))
      .join(' ');
  }

  return pathData;
};

export const coordsToPath = (coordinates: number[][]): string => {
  return coordinates
    .map((coord, index) => {
      const [lng, lat] = coord;
      // Flip Y coordinate for SVG (SVG Y axis is inverted)
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${lng} ${-lat}`;
    })
    .join(' ') + ' Z';
};

export const getCountyCentroid = (feature: GeoJSONFeature): [number, number] => {
  if (!feature.geometry) return [0, 0];
  
  let coords: number[][];
  if (feature.geometry.type === 'Polygon') {
    const polygonCoords = feature.geometry.coordinates as number[][][];
    coords = polygonCoords[0];
  } else if (feature.geometry.type === 'MultiPolygon') {
    const multiPolygonCoords = feature.geometry.coordinates as number[][][][];
    coords = multiPolygonCoords[0][0];
  } else {
    return [0, 0];
  }
  
  const sumX = coords.reduce((sum, coord) => sum + coord[0], 0);
  const sumY = coords.reduce((sum, coord) => sum + coord[1], 0);
  
  return [sumX / coords.length, -sumY / coords.length]; // Flip Y for SVG
};
