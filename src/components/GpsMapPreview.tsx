import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { toDMSLatitude, toDMSLongitude } from '../utils/gpsUtils';

interface GpsMapPreviewProps {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  officeName?: string;
  userLat?: number | null;
  userLng?: number | null;
  distanceMeters?: number | null;
  heightClass?: string;
  onSelectCoordinates?: (lat: number, lng: number) => void;
}

export const GpsMapPreview: React.FC<GpsMapPreviewProps> = ({
  centerLat,
  centerLng,
  radiusMeters,
  officeName = 'Kantor Kemenag Kab. Lebak',
  userLat,
  userLng,
  distanceMeters,
  heightClass = 'h-72',
  onSelectCoordinates,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const officePos = { lat: centerLat, lng: centerLng };
  const hasUserPos = userLat != null && userLng != null;
  const isInside = distanceMeters != null ? distanceMeters <= radiusMeters : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span>Peta Peta Titik Koordinat Kantor &amp; Radius Absensi</span>
        </div>
        <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {toDMSLatitude(centerLat)} &bull; {toDMSLongitude(centerLng)}
        </div>
      </div>

      <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100`}>
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={officePos}
              defaultZoom={17}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
              gestureHandling="greedy"
              disableDefaultUI={false}
              onClick={(e) => {
                if (onSelectCoordinates && e.detail.latLng) {
                  onSelectCoordinates(e.detail.latLng.lat, e.detail.latLng.lng);
                }
              }}
            >
              {/* Office Marker */}
              <AdvancedMarker position={officePos} title={officeName}>
                <Pin background="#047857" glyphColor="#ffffff" borderColor="#065f46" />
              </AdvancedMarker>

              {/* User Location Marker if available */}
              {hasUserPos && (
                <AdvancedMarker position={{ lat: userLat!, lng: userLng! }} title="Lokasi Anda Saat Ini">
                  <Pin
                    background={isInside ? '#10b981' : '#f43f5e'}
                    glyphColor="#ffffff"
                    borderColor={isInside ? '#047857' : '#be123c'}
                  />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Fallback Google Maps Interactive Embed iframe if API key is not supplied directly */
          <iframe
            title="Google Maps Office Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${centerLat},${centerLng}&z=17&output=embed`}
            className="w-full h-full border-0"
          />
        )}

        {/* Floating Info Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md max-w-xs text-xs space-y-1 z-10 pointer-events-none">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span className="truncate">{officeName}</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">
            Lat: {centerLat.toFixed(5)} | Lng: {centerLng.toFixed(5)}
          </p>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded border border-emerald-200">
            <span>Radius Izin Absen: {radiusMeters} Meter</span>
          </div>
        </div>

        {/* User GPS Distance Overlay Badge */}
        {distanceMeters != null && (
          <div
            className={`absolute bottom-3 right-3 p-3 rounded-xl border shadow-lg max-w-xs text-xs space-y-0.5 z-10 ${
              isInside
                ? 'bg-emerald-950/90 text-white border-emerald-500'
                : 'bg-rose-950/90 text-white border-rose-500'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Navigation className="w-3.5 h-3.5" />
              <span>Jarak Dari Kantor: {distanceMeters} Meter</span>
            </div>
            <p className="text-[10px] opacity-90">
              {isInside
                ? `Di dalam radius jangkauan (${radiusMeters} m) - Absensi DI-IZINKAN.`
                : `Di luar radius jangkauan (${radiusMeters} m) - Absensi DITOLAK.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
