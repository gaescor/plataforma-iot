// components/TelemetryTable.tsx
'use client';
import React from 'react';
import  {type TelemetryItem } from '@/lib/api';

export default function TelemetryTable({ items }: { items: TelemetryItem[] }) {
  // Transformar datos reales
  let rows = [...items]
    .filter(d => typeof d.fuelLevel === 'number')
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // 👇 Fallback a mocks si DynamoDB no tiene datos
  const usingMocks = rows.length === 0;
  if (usingMocks) {
    rows = [
      { deviceId: 'mock-001', timestamp: '2025-09-01T12:00:00Z', fuelLevel: 80 },
      { deviceId: 'mock-001', timestamp: '2025-09-01T13:00:00Z', fuelLevel: 75 },
      { deviceId: 'mock-001', timestamp: '2025-09-01T14:00:00Z', fuelLevel: 70 },
      { deviceId: 'mock-001', timestamp: '2025-09-01T15:00:00Z', fuelLevel: 65 },
      { deviceId: 'mock-001', timestamp: '2025-09-01T16:00:00Z', fuelLevel: 60 },
    ];
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">
        Telemetry Data {usingMocks && <span className="text-red-500 text-sm">(datos simulados)</span>}
      </h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Device</th>
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-left">Fuel Level</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{row.deviceId}</td>
              <td className="border px-2 py-1">{row.timestamp}</td>
              <td className="border px-2 py-1">{row.fuelLevel ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


/*
'use client';
import { TelemetryItem } from '@/lib/api';

export default function TelemetryTable({ items }: { items: TelemetryItem[] }) {
  // Datos reales
  let rows = [...items].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // 👇 Si no hay datos, inyectamos datos de prueba
  if (rows.length === 0) {
    rows = [
      { deviceId: 'truck-001', timestamp: '2025-09-01T12:00:00Z', fuelLevel: 80 },
      { deviceId: 'truck-001', timestamp: '2025-09-01T13:00:00Z', fuelLevel: 75 },
      { deviceId: 'truck-001', timestamp: '2025-09-01T14:00:00Z', fuelLevel: 70 },
      { deviceId: 'truck-001', timestamp: '2025-09-01T15:00:00Z', fuelLevel: 65 },
      { deviceId: 'truck-001', timestamp: '2025-09-01T16:00:00Z', fuelLevel: 60 },
    ];
  }

  return (
    <div className="p-4 border rounded shadow bg-white overflow-x-auto">

{rows.length && items.length === 0 && (
  <div className="text-xs text-orange-600 mb-2">
    ⚠️ Mostrando datos de prueba (mock)
  </div>
)}

      <h2 className="text-lg font-semibold mb-2">Últimos registros</h2>
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 text-left">Timestamp</th>
            <th className="border px-2 py-1 text-left">Device</th>
            <th className="border px-2 py-1 text-left">Fuel Level</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{d.timestamp}</td>
              <td className="border px-2 py-1">{d.deviceId}</td>
              <td className="border px-2 py-1">{d.fuelLevel ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}*/
