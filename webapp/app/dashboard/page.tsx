'use client';
import React, { useEffect, useState } from 'react';
import { fetchTelemetry, TelemetryItem } from '@/lib/api';
import TelemetryTable from '@/components/TelemetryTable';
import TelemetryChart from '@/components/TelemetryChart';
import MapPlaceholder from '@/components/MapPlaceholder';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const [deviceId, setDeviceId] = useState('truck-001');
  const [items, setItems] = useState<TelemetryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true); setError(null);
      const from = dayjs().subtract(3, 'day').toISOString();
      const to = dayjs().toISOString();
      const data = await fetchTelemetry({ deviceId, from, to });

      console.log("API URL desde env:", process.env.NEXT_PUBLIC_API_BASE);
      // 👇 Aquí revisamos qué devuelve la API
      console.log("Telemetry data from API:", data);


      setItems(data);
    } catch (e: any) {
      setError(e.message || 'Error al consultar');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex gap-2 items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="ml-auto flex gap-2">
          <input value={deviceId} onChange={e=>setDeviceId(e.target.value)} className="border rounded px-2 py-1" />
          <button onClick={load} className="bg-blue-600 text-white px-3 py-1 rounded">{loading ? 'Cargando...' : 'Consultar'}</button>
        </div>
      </header>

      {error && <div className="text-red-600">{error}</div>}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TelemetryChart items={items} />
        <div>
          <TelemetryTable items={items} />
        </div>
      </section>

      <MapPlaceholder items={items} />
    </div>
  );
}
