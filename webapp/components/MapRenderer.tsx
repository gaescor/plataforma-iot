'use client';
import React from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { TelemetryItem } from '@/lib/api';
import type { LatLngExpression } from 'leaflet';

interface Props {
  data?: TelemetryItem[];
}

export default function MapRenderer({ data = [] }: Props) {
  const defaultCenter: LatLngExpression = [8.4516, -25.532]; // usa el tipo oficial

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution={'© OpenStreetMap contributors' as any} // 🔧 fix de tipos
      />
      {data
        .filter(
          (item): item is TelemetryItem & { location: { lat: number; lng: number } } =>
            !!item.location
        )
        .map((item, idx) => (
          <CircleMarker
            key={idx}
            center={[item.location.lat, item.location.lng] as LatLngExpression}
            radius={6 as any} // 🔧 fix de tipos
            pathOptions={{ color: 'red' }}
          />
        ))}
    </MapContainer>
  );
}
