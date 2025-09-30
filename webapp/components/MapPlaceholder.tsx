'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import type { TelemetryItem } from '@/lib/api';

// Importa el componente de mapa de forma dinámica (solo en cliente)
const Map = dynamic(() => import('./MapRenderer'), { ssr: false });

export default function MapPlaceholder({ items }: { items: TelemetryItem[] }) {
  return (
    <div className="h-96 w-full border rounded">
      <Map data={items} />
    </div>
  );
}



/*'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { TelemetryItem } from '@/lib/api';

export default function MapPlaceholder({ items }: { items: TelemetryItem[] }) {
  // Última coordenada
  const last = [...items].reverse().find(it => it.location?.lat && it.location?.lng);
  const center = last?.location ? [last.location.lat, last.location.lng] : [4.6, -74.08]; // default

  const markers = useMemo(() => items
    .map(it => it.location && { lat: it.location.lat, lng: it.location.lng })
    .filter(Boolean), [items]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">Mapa (placeholder)</h3>
      <div style={{ width: '100%', height: 360 }}>
        <MapContainer center={center as [number, number]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m, i) => (
            <CircleMarker
              key={i}
              center={[m!.lat, m!.lng]}
              radius={6}
              pathOptions={{ color: 'red' }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}*/
