// components/TelemetryChart.tsx

'use client';
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts';
import type { TelemetryItem } from '@/lib/api';

export default function TelemetryChart({ items }: { items: TelemetryItem[] }) {
  // Transformar datos reales
  let rows = [...items]
    .filter(d => typeof d.fuelLevel === 'number')
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map(d => ({
      time: d.timestamp,
      fuel: d.fuelLevel ?? 0,
    }));

  // 👇 Fallback a mocks si DynamoDB no tiene datos
  const usingMocks = rows.length === 0;
  if (usingMocks) {
    rows = [
      { time: '2025-09-01T12:00:00Z', fuel: 80 },
      { time: '2025-09-01T13:00:00Z', fuel: 75 },
      { time: '2025-09-01T14:00:00Z', fuel: 70 },
      { time: '2025-09-01T15:00:00Z', fuel: 65 },
      { time: '2025-09-01T16:00:00Z', fuel: 60 },
    ];
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">
        Fuel Level {usingMocks && <span className="text-red-500 text-sm">(datos simulados)</span>}
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="fuel" stroke="#1f6feb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



/*'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { TelemetryItem } from '@/lib/api';

export default function TelemetryChart({ items }: { items: TelemetryItem[] }) {
  // Datos reales si vienen de la API
  let rows = [...items]
    .filter(d => typeof d.fuelLevel === 'number')
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map(d => ({ time: d.timestamp, fuel: d.fuelLevel }));

  // 👇 Si no hay datos, inyectamos datos de prueba
  if (rows.length === 0) {
    rows = [
      { time: '2025-09-01T12:00:00Z', fuel: 80 },
      { time: '2025-09-01T13:00:00Z', fuel: 75 },
      { time: '2025-09-01T14:00:00Z', fuel: 70 },
      { time: '2025-09-01T15:00:00Z', fuel: 65 },
      { time: '2025-09-01T16:00:00Z', fuel: 60 },
    ];
  }

  return (
    <div className="bg-white rounded shadow p-4">

{rows.length && items.length === 0 && (
  <div className="text-xs text-orange-600 mb-2">
    ⚠️ Mostrando datos de prueba (mock)
  </div>
)}


      <h3 className="font-semibold mb-2">Fuel Level</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="fuel" stroke="#1f6feb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}*/
