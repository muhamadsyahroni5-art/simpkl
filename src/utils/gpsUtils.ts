/**
 * Utility functions for GPS coordinates, Haversine distance calculations, and Geofencing.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculates the Haversine distance in meters between two lat/lng coordinates.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Converts decimal latitude to Degrees Minutes Seconds (DMS) string format.
 */
export function toDMSLatitude(lat: number): string {
  const absolute = Math.abs(lat);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  const cardinal = lat >= 0 ? 'LU' : 'LS';
  return `${degrees}°${minutes}'${seconds}" ${cardinal}`;
}

/**
 * Converts decimal longitude to Degrees Minutes Seconds (DMS) string format.
 */
export function toDMSLongitude(lng: number): string {
  const absolute = Math.abs(lng);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
  const cardinal = lng >= 0 ? 'BT' : 'BB';
  return `${degrees}°${minutes}'${seconds}" ${cardinal}`;
}
