'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface LiveTrackingMapProps {
  customerLat?: number | null;
  customerLng?: number | null;
  customerAddress?: string;
  customerLocationName?: string | null;
  technicianLat?: number | null;
  technicianLng?: number | null;
  technicianHeading?: number | null;
  technicianName?: string;
  rideStarted?: boolean;
  rideStartedAt?: string | Date | null;
  onRefreshLocation?: () => void;
  height?: string;
  showAdminControls?: boolean;
}

export default function LiveTrackingMap({
  customerLat,
  customerLng,
  customerAddress,
  customerLocationName,
  technicianLat,
  technicianLng,
  technicianHeading,
  technicianName = 'Sanjit Mishra (Lead Electrician)',
  rideStarted = false,
  rideStartedAt,
  height = '460px',
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const technicianMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDurationMin, setRouteDurationMin] = useState<number | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // If ride is started and no technician location is provided yet, fallback to near customer location
  const effectiveTechLat =
    technicianLat != null
      ? technicianLat
      : rideStarted && customerLat != null
      ? customerLat + 0.003
      : null;
  const effectiveTechLng =
    technicianLng != null
      ? technicianLng
      : rideStarted && customerLng != null
      ? customerLng + 0.003
      : null;

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const container = mapContainerRef.current;
      // Clear _leaflet_id from container DOM element to prevent "Map container is already initialized"
      if ((container as any)._leaflet_id != null) {
        (container as any)._leaflet_id = null;
      }

      const L = (await import('leaflet')).default;

      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Default center: Kathmandu Valley
      const initialLat = customerLat || 27.700769;
      const initialLng = customerLng || 85.312329;

      let map: any = null;
      try {
        map = L.map(container, {
          center: [initialLat, initialLng],
          zoom: 15,
          zoomControl: true,
        });
      } catch (mapErr) {
        console.warn('L.map init retry, clearing _leaflet_id:', mapErr);
        (container as any)._leaflet_id = null;
        map = L.map(container, {
          center: [initialLat, initialLng],
          zoom: 15,
          zoomControl: true,
        });
      }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Voltix Nepal Live Dispatch',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      if (isMounted) {
        setLeafletLoaded(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      // Reset layer references on unmount so React StrictMode remount starts fresh
      customerMarkerRef.current = null;
      technicianMarkerRef.current = null;
      routePolylineRef.current = null;
      setLeafletLoaded(false);
    };
  }, []);

  // 2. Update Markers and Route when coordinates change
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;

    let isMounted = true;

    async function updateLayers() {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;
      if (!map) return;

      // --- 1. Customer Marker (Red Destination House Pin) ---
      // --- 1. Customer Marker (Clean Red Destination Pin) ---
      if (customerLat && customerLng) {
        const customerIconHtml = `
          <div style="position: relative; width: 44px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; background: transparent;">
            <div style="position: relative; z-index: 10; width: 36px; height: 36px; border-radius: 50%; background: #dc2626; border: 2.5px solid #ffffff; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style="position: relative; z-index: 9; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid #dc2626; margin-top: -2px;"></div>
          </div>
        `;

        const customerDivIcon = L.divIcon({
          html: customerIconHtml,
          className: 'voltix-customer-marker',
          iconSize: [44, 50],
          iconAnchor: [22, 50],
          popupAnchor: [0, -50],
        });

        // Ensure marker is attached to the current active map instance
        if (!customerMarkerRef.current || !map.hasLayer(customerMarkerRef.current)) {
          if (customerMarkerRef.current) {
            try {
              map.removeLayer(customerMarkerRef.current);
            } catch {}
          }
          customerMarkerRef.current = L.marker([customerLat, customerLng], {
            icon: customerDivIcon,
          }).addTo(map);
        } else {
          customerMarkerRef.current.setLatLng([customerLat, customerLng]);
          customerMarkerRef.current.setIcon(customerDivIcon);
        }

        const label = customerLocationName || customerAddress || 'Service Destination';
        customerMarkerRef.current.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;">
            <div style="font-weight: 800; color: #dc2626; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <span>📍 Customer Location</span>
            </div>
            <div style="font-weight: 600; color: #0f172a;">${label}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">GPS: ${customerLat.toFixed(5)}, ${customerLng.toFixed(5)}</div>
          </div>
        `);
      }

      // --- 2. Technician Bike Marker (Clean Motorbike with Name Badge) ---
      if (rideStarted && effectiveTechLat && effectiveTechLng) {
        const rotationStyle = technicianHeading ? `transform: rotate(${technicianHeading}deg);` : '';
        const bikeIconHtml = `
          <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: transparent;">
            <!-- Technician Name Badge Tag -->
            <div style="position: absolute; top: -12px; background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px; z-index: 20;">
              <span>Sanjit on Bike</span>
            </div>

            <!-- Motorcycle Icon Container -->
            <div style="position: relative; z-index: 15; width: 46px; height: 46px; border-radius: 50%; background: #ffffff; border: 2px solid #0f172a; box-shadow: 0 3px 10px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; ${rotationStyle} transition: transform 0.4s ease;">
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Rear Wheel -->
                <circle cx="11" cy="35" r="7" stroke="#1e293b" stroke-width="3" fill="#f8fafc" />
                <circle cx="11" cy="35" r="3" fill="#dc2626" />
                <circle cx="11" cy="35" r="1.5" fill="#ffffff" />
                
                <!-- Front Wheel -->
                <circle cx="37" cy="35" r="7" stroke="#1e293b" stroke-width="3" fill="#f8fafc" />
                <circle cx="37" cy="35" r="3" fill="#dc2626" />
                <circle cx="37" cy="35" r="1.5" fill="#ffffff" />

                <!-- Motorcycle Chassis -->
                <path d="M11 35 L21 34 L27 28 L37 35" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M21 34 L25 22 L33 22" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
                <path d="M27 28 L37 35" stroke="#334155" stroke-width="3" />
                
                <!-- Headlight & Front Beam -->
                <polygon points="36,22 46,18 46,26" fill="rgba(250, 204, 21, 0.45)" />
                <circle cx="36" cy="22" r="2.5" fill="#facc15" />

                <!-- Exhaust Pipe -->
                <path d="M18 36 L10 38" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />

                <!-- Technician Body -->
                <path d="M20 25 C18 20 22 17 26 18 C28 20 28 23 27 27 Z" fill="#0f172a" />
                <!-- Arm reaching handlebar -->
                <path d="M24 20 L31 22" stroke="#dc2626" stroke-width="2.8" stroke-linecap="round" />

                <!-- Safety Helmet (Voltix Red) -->
                <circle cx="26" cy="12" r="5.5" fill="#dc2626" stroke="#ffffff" stroke-width="1.2" />
                <!-- Visor -->
                <path d="M28 11 Q32 12 29 14" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" />
              </svg>
            </div>
          </div>
        `;

        const bikeDivIcon = L.divIcon({
          html: bikeIconHtml,
          className: 'voltix-technician-marker',
          iconSize: [72, 72],
          iconAnchor: [36, 36],
          popupAnchor: [0, -36],
        });

        // Ensure marker is attached to the current active map instance
        if (!technicianMarkerRef.current || !map.hasLayer(technicianMarkerRef.current)) {
          if (technicianMarkerRef.current) {
            try {
              map.removeLayer(technicianMarkerRef.current);
            } catch {}
          }
          technicianMarkerRef.current = L.marker([effectiveTechLat, effectiveTechLng], {
            icon: bikeDivIcon,
          }).addTo(map);
        } else {
          technicianMarkerRef.current.setLatLng([effectiveTechLat, effectiveTechLng]);
          technicianMarkerRef.current.setIcon(bikeDivIcon);
        }

        technicianMarkerRef.current.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;">
            <div style="font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 4px;">
              <span>🏍️ Technician En Route</span>
            </div>
            <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${technicianName}</div>
            <div style="font-size: 11px; color: #475569;">Live GPS Connected (Bike)</div>
          </div>
        `);
      } else {
        // Clean up technician marker if ride is not active
        if (technicianMarkerRef.current) {
          try {
            if (map.hasLayer(technicianMarkerRef.current)) {
              map.removeLayer(technicianMarkerRef.current);
            }
          } catch {}
          technicianMarkerRef.current = null;
        }
      }

      // --- 3. Road Route Driving Polyline & ETA calculation ---
      if (rideStarted && effectiveTechLat && effectiveTechLng && customerLat && customerLng) {
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${effectiveTechLng},${effectiveTechLat};${customerLng},${customerLat}?overview=full&geometries=geojson`;
          const res = await fetch(osrmUrl);
          const data = await res.json();

          if (isMounted && data.routes && data.routes.length > 0) {
            const primaryRoute = data.routes[0];
            const coordinates = primaryRoute.geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]]
            );

            // Distance in kilometers and Duration in minutes
            const distKm = Number((primaryRoute.distance / 1000).toFixed(1));
            const durationMin = Math.max(1, Math.round(primaryRoute.duration / 60));

            setRouteDistanceKm(distKm);
            setRouteDurationMin(durationMin);

            if (routePolylineRef.current) {
              try {
                if (map.hasLayer(routePolylineRef.current)) {
                  map.removeLayer(routePolylineRef.current);
                }
              } catch {}
            }

            // Draw road polyline
            routePolylineRef.current = L.polyline(coordinates, {
              color: '#dc2626',
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8',
              lineJoin: 'round',
            }).addTo(map);

            // Fit bounds smoothly with safety check for identical coordinates
            const latDiff = Math.abs(effectiveTechLat - customerLat);
            const lngDiff = Math.abs(effectiveTechLng - customerLng);
            if (latDiff < 0.0001 && lngDiff < 0.0001) {
              map.setView([customerLat, customerLng], 16);
            } else {
              const bounds = L.latLngBounds([
                [effectiveTechLat, effectiveTechLng],
                [customerLat, customerLng],
              ]);
              map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
            }
          } else {
            throw new Error('No OSRM routes found');
          }
        } catch (routeErr) {
          // Graceful fallback to straight-line distance, time, and dashed line
          if (isMounted) {
            const R = 6371; // Earth's radius in km
            const dLat = ((customerLat - effectiveTechLat) * Math.PI) / 180;
            const dLon = ((customerLng - effectiveTechLng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((effectiveTechLat * Math.PI) / 180) *
                Math.cos((customerLat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const straightKm = Number((R * c).toFixed(1));
            const estMin = Math.max(1, Math.round((straightKm / 25) * 60));

            setRouteDistanceKm(straightKm);
            setRouteDurationMin(estMin);

            if (routePolylineRef.current) {
              try {
                if (map.hasLayer(routePolylineRef.current)) {
                  map.removeLayer(routePolylineRef.current);
                }
              } catch {}
            }

            routePolylineRef.current = L.polyline(
              [
                [effectiveTechLat, effectiveTechLng],
                [customerLat, customerLng],
              ],
              { color: '#dc2626', weight: 4, dashArray: '6, 6' }
            ).addTo(map);

            const bounds = L.latLngBounds([
              [effectiveTechLat, effectiveTechLng],
              [customerLat, customerLng],
            ]);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
          }
        }
      } else {
        // Ride is stopped: clear polyline and ETA
        if (routePolylineRef.current) {
          try {
            if (map.hasLayer(routePolylineRef.current)) {
              map.removeLayer(routePolylineRef.current);
            }
          } catch {}
          routePolylineRef.current = null;
        }
        setRouteDistanceKm(null);
        setRouteDurationMin(null);

        if (customerLat && customerLng) {
          map.setView([customerLat, customerLng], 15);
        }
      }
    }

    updateLayers();

    return () => {
      isMounted = false;
    };
  }, [
    customerLat,
    customerLng,
    effectiveTechLat,
    effectiveTechLng,
    technicianHeading,
    rideStarted,
    leafletLoaded,
  ]);

  const handleCenterCustomer = () => {
    if (mapInstanceRef.current && customerLat && customerLng) {
      mapInstanceRef.current.flyTo([customerLat, customerLng], 16, { duration: 1 });
    }
  };

  const handleCenterTechnician = () => {
    if (mapInstanceRef.current && effectiveTechLat && effectiveTechLng) {
      mapInstanceRef.current.flyTo([effectiveTechLat, effectiveTechLng], 16, { duration: 1 });
    }
  };

  const handleFitBounds = async () => {
    if (
      mapInstanceRef.current &&
      customerLat &&
      customerLng &&
      effectiveTechLat &&
      effectiveTechLng
    ) {
      const L = (await import('leaflet')).default;
      const bounds = L.latLngBounds([
        [effectiveTechLat, effectiveTechLng],
        [customerLat, customerLng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Top Overlay - ETA Pill only */}
      {rideStarted && routeDistanceKm !== null && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 shadow-lg flex items-center gap-4 text-xs font-extrabold animate-in fade-in">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Remaining</span>
              <span className="text-red-600 font-mono text-sm">{routeDistanceKm} km</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Est. Arrival</span>
              <span className="text-emerald-700 font-mono text-sm">~{routeDurationMin} mins</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Control Buttons */}
      <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-2 pointer-events-auto">
        {rideStarted && effectiveTechLat && (
          <button
            type="button"
            onClick={handleCenterTechnician}
            title="Track Technician on Bike"
            className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold active:scale-95"
          >
            <span>🏍️ Focus Bike</span>
          </button>
        )}
        {customerLat && (
          <button
            type="button"
            onClick={handleCenterCustomer}
            title="Focus Customer Destination"
            className="p-2.5 bg-white text-slate-800 rounded-xl shadow-md hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold active:scale-95"
          >
            <span>📍 Focus Destination</span>
          </button>
        )}
        {rideStarted && customerLat && effectiveTechLat && (
          <button
            type="button"
            onClick={handleFitBounds}
            title="Show Full Route"
            className="p-2.5 bg-white text-slate-800 rounded-xl shadow-md hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold active:scale-95"
          >
            <span>🗺️ Show Full Route</span>
          </button>
        )}
      </div>
    </div>
  );
}
