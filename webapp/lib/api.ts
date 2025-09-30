/*export interface TelemetryItem {
  deviceId: string;           // ID del dispositivo
  timestamp: string;          // Fecha/hora ISO
  fuelLevel?: number;         // Nivel de combustible
  location?: { lat: number; lng: number }; // Ubicación opcional
  pk?: string;                // DynamoDB partition key
  sk?: string;                // DynamoDB sort key
}

export async function fetchTelemetry(params: {
  deviceId: string;
  from?: string;
  to?: string;
}): Promise<TelemetryItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;
  if (!baseUrl) {
    console.warn("⚠️ No hay API configurada, usando datos simulados");
    return getMockData();
  }

  try {
    const url = new URL("telemetry", baseUrl);
    url.searchParams.set("deviceId", params.deviceId);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error("❌ API error:", res.status, res.statusText);
      return getMockData();
    }

    const items = await res.json();
    console.log("✅ API response:", items);

    // Si no vienen datos, devolvemos mocks
    if (!items || items.length === 0) {
      console.warn("⚠️ API sin datos, usando datos simulados");
      return getMockData();
    }

    return items.map((it: any) => ({
      deviceId: it.deviceId,
      timestamp: it.timestamp,
      fuelLevel: it.fuelLevel ? Number(it.fuelLevel) : undefined,
    }));
  } catch (err) {
    console.error("❌ Error al obtener telemetría:", err);
    return getMockData();
  }
}

// 🔹 Función auxiliar para centralizar mocks
function getMockData(): TelemetryItem[] {
  return [
    { deviceId: "mock-001", timestamp: "2025-09-01T12:00:00Z", fuelLevel: 80 },
    { deviceId: "mock-001", timestamp: "2025-09-01T13:00:00Z", fuelLevel: 75 },
    { deviceId: "mock-001", timestamp: "2025-09-01T14:00:00Z", fuelLevel: 70 },
    { deviceId: "mock-001", timestamp: "2025-09-01T15:00:00Z", fuelLevel: 65 },
  ];
}*/


/*
export interface TelemetryItem {
  deviceId: string;           // ID del dispositivo
  timestamp: string;          // Fecha/hora ISO
  fuelLevel?: number;         // Nivel de combustible
  location?: { lat: number; lng: number }; // Ubicación opcional
  pk?: string;                // DynamoDB partition key
  sk?: string;                // DynamoDB sort key
}

export async function fetchTelemetry(params: {
  deviceId: string;
  from?: string;
  to?: string;
}): Promise<TelemetryItem[]> {
  // ✅ Si está activo el modo mocks
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    console.warn("⚠️ Usando datos simulados (mocks)");
    return [
      { deviceId: "mock-001", timestamp: "2025-09-01T12:00:00Z", fuelLevel: 80 },
      { deviceId: "mock-001", timestamp: "2025-09-01T13:00:00Z", fuelLevel: 75 },
      { deviceId: "mock-001", timestamp: "2025-09-01T14:00:00Z", fuelLevel: 70 },
    ];
  }

  // 🔹 Si no hay mocks, usamos la API real
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;
  if (!baseUrl) throw new Error("❌ NEXT_PUBLIC_API_BASE no está configurado");

  const url = new URL("telemetry", baseUrl);
  url.searchParams.set("deviceId", params.deviceId);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const items = await res.json();
  console.log("✅ API response:", items);

  return (items || []).map((it: any) => ({
    deviceId: it.deviceId,
    timestamp: it.timestamp,
    fuelLevel: it.fuelLevel ? Number(it.fuelLevel) : undefined,
  }));
}*/


/*
export async function fetchTelemetry(params: {
  deviceId: string;
  from?: string;
  to?: string;
}): Promise<TelemetryItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;
  if (!baseUrl) throw new Error("❌ NEXT_PUBLIC_API_BASE no está configurado");

  const url = new URL("telemetry", baseUrl);
  url.searchParams.set("deviceId", params.deviceId);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  console.log("✅ API response:", json);

  // Caso 1: la Lambda ya devuelve array plano
  if (Array.isArray(json)) {
    return json.map((item: any) => ({
      deviceId: item.deviceId,
      timestamp: item.timestamp,
      fuelLevel: item.fuelLevel,
    }));
  }

  // Caso 2: DynamoDB JSON crudo con Items
  if (json.Items) {
    return json.Items.map((item: any) => ({
      deviceId: item.deviceId.S,
      timestamp: item.timestamp.S,
      fuelLevel: item.fuelLevel ? Number(item.fuelLevel.N) : undefined,
    }));
  }

  return [];
}*/




export async function fetchTelemetry(params: {
  deviceId: string;
  from?: string;
  to?: string;
}): Promise<TelemetryItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE;

  if (!baseUrl) {
    console.warn("⚠️ NEXT_PUBLIC_API_BASE no está configurado. Usando datos mock.");
    return [];
  }

  try {
    const url = new URL("telemetry", baseUrl);
    url.searchParams.set("deviceId", params.deviceId);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      console.error(`❌ API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const json = await res.json();
    console.log("✅ API response:", json);

    // ✅ Caso 1: Lambda devuelve directamente un array
    if (Array.isArray(json)) {
      return json as TelemetryItem[];
    }

    // ✅ Caso 2: DynamoDB JSON { Items: [...] }
    if (json.Items) {
      return json.Items.map((item: any) => ({
        deviceId: item.deviceId?.S ?? item.deviceId,
        timestamp: item.timestamp?.S ?? item.timestamp,
        fuelLevel: item.fuelLevel?.N ? Number(item.fuelLevel.N) : Number(item.fuelLevel),
        pk: item.pk?.S ?? item.pk,
        sk: item.sk?.S ?? item.sk,
      }));
    }

    return [];
  } catch (err) {
    console.error("❌ Error en fetchTelemetry:", err);
    return [];
  }
}
