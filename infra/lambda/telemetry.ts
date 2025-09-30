import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

export interface TelemetryItem {
  deviceId: string;
  timestamp: string;
  fuelLevel: number;
  pk?: string;
  sk?: string;
}

export const getTelemetry: APIGatewayProxyHandler = async (event) => {
  try {
    const deviceId = event.queryStringParameters?.deviceId;
    if (!deviceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing deviceId" }),
        headers: { "Access-Control-Allow-Origin": "*" },
      };
    }

    const params = {
      TableName: process.env.TELEMETRY_TABLE,
      KeyConditionExpression: "deviceId = :d",
      ExpressionAttributeValues: { ":d": deviceId },
      Limit: 20,
      ScanIndexForward: false,
    };

    const res = await docClient.send(new QueryCommand(params));

    // ✅ DynamoDBDocumentClient ya devuelve JSON normal
    return {
      statusCode: 200,
      body: JSON.stringify(res.Items ?? []),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    console.error("Error in telemetry lambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
};




/*import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

export const getTelemetry: APIGatewayProxyHandler = async (event) => {
  try {
    const deviceId = event.queryStringParameters?.deviceId ?? "truck-001";

    const params = {
      TableName: process.env.TELEMETRY_TABLE,
      KeyConditionExpression: "deviceId = :d",
      ExpressionAttributeValues: { ":d": deviceId },
      Limit: 20,
      ScanIndexForward: false,
    };

    const res = await docClient.send(new QueryCommand(params));

    // ✅ Convertir DynamoDB a JSON plano
    const items = (res.Items ?? []).map((it) => ({
      deviceId: it.deviceId,
      timestamp: it.timestamp,
      fuelLevel: it.fuelLevel ? Number(it.fuelLevel) : null,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(items),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (err) {
    console.error("Error in telemetry lambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
}; */
