import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TELEMETRY_TABLE!;

export const handler = async (event: any) => {
  console.log("Evento recibido:", JSON.stringify(event));

  // Extraemos query params de la URL
  const params = event.queryStringParameters || {};
  const deviceId = params.deviceId;
  const start = params.start; // ISO string ej: 2025-09-01T00:00:00Z
  const end = params.end;     // ISO string ej: 2025-09-02T00:00:00Z

  if (!deviceId) {
    return { statusCode: 400, body: JSON.stringify({ error: "deviceId es obligatorio" }) };
  }

  // La clave de partición es deviceId normalizado como pk
  const pk = `device#${deviceId}`;

  const queryInput: any = {
    TableName: tableName,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": pk
    },
    Limit: 100
  };

  // Si nos pasaron rango de fechas, aplicamos condición adicional
  if (start && end) {
    queryInput.KeyConditionExpression = "pk = :pk AND sk BETWEEN :start AND :end";
    queryInput.ExpressionAttributeValues[":start"] = start;
    queryInput.ExpressionAttributeValues[":end"] = end;
  }

  const result = await ddbDocClient.send(new QueryCommand(queryInput));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items ?? [])
  };
};
