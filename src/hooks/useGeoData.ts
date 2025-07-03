
import { useState, useEffect } from "react";
import { GeoJSONData } from "@/types/geoTypes";

export const useGeoData = () => {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [viewBox, setViewBox] = useState<string>("0 0 1000 800");

  useEffect(() => {
    // Load the GeoJSON data
    fetch('/src/data/Texas_County_Boundaries.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: GeoJSONData) => {
        console.log('GeoJSON data loaded:', data);
        setGeoData(data);
        
        // Calculate bounding box for the map
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        data.features.forEach(feature => {
          if (feature.geometry && feature.geometry.coordinates) {
            if (feature.geometry.type === 'Polygon') {
              const coords = feature.geometry.coordinates as number[][][];
              coords[0].forEach((coord: number[]) => {
                const [lng, lat] = coord;
                minX = Math.min(minX, lng);
                maxX = Math.max(maxX, lng);
                minY = Math.min(minY, lat);
                maxY = Math.max(maxY, lat);
              });
            } else if (feature.geometry.type === 'MultiPolygon') {
              const coords = feature.geometry.coordinates as number[][][][];
              coords.forEach(polygon => {
                polygon[0].forEach((coord: number[]) => {
                  const [lng, lat] = coord;
                  minX = Math.min(minX, lng);
                  maxX = Math.max(maxX, lng);
                  minY = Math.min(minY, lat);
                  maxY = Math.max(maxY, lat);
                });
              });
            }
          }
        });
        
        // Convert to SVG coordinates (flip Y axis for SVG)
        const width = maxX - minX;
        const height = maxY - minY;
        const padding = width * 0.05; // 5% padding
        
        setViewBox(`${minX - padding} ${-maxY - padding} ${width + 2 * padding} ${height + 2 * padding}`);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  return { geoData, viewBox };
};
