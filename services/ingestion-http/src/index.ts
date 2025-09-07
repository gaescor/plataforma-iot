import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const tableName = process.env.TELEMETRY_TABLE!;

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);

    const pk = `device#${body.deviceId}`;
    const sk = body.timestamp;

    const item = {
      pk,
      sk,
      fuelLevel: body.fuelLevel,
      location: body.location,
    };

    await ddb.send(new PutCommand({
      TableName: tableName,
      Item: item,
    }));

    return {
      statusCode: 202,
      body: JSON.stringify({ message: "Accepted", item }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: err.message }),
    };
  }
};




/*import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  console.log("Payload recibido:", event.body);
  const body = JSON.parse(event.body);

  const item = {
    pk: `${body.tenantId}#${body.deviceId}`,
    sk: `${body.ts}`, // timestamp como string
    location: body.location,
    metrics: body.metrics,
    ingestSource: body.ingestSource,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: process.env.TELEMETRY_TABLE!,
        Item: item,
      })
    );
    return { statusCode: 202, body: "Accepted" };
  } catch (err) {
    console.error("Error guardando en DynamoDB", err);
    return { statusCode: 500, body: "Error" };
  }
};*/



/*import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { TimestreamWriteClient, WriteRecordsCommand } from '@aws-sdk/client-timestream-write';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const schema = require('./schemas/etu.json');
const validate = ajv.compile(schema);

const tsw = new TimestreamWriteClient({});
const s3 = new S3Client({});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) return { statusCode: 400, body: 'empty body' };
    const payload = JSON.parse(event.body);

    const ok = validate(payload);
    if (!ok) return { statusCode: 422, body: JSON.stringify(validate.errors) };

    // Guardar en S3
    await s3.send(new PutObjectCommand({
      Bucket: process.env.RAW_BUCKET!,
      Key: `raw/${payload.tenantId}/${payload.deviceId}-${payload.ts}.json`,
      Body: JSON.stringify(payload),
    }));

    // Guardar métricas en Timestream
    const dimensions = [
      { Name: 'tenantId', Value: payload.tenantId },
      { Name: 'deviceId', Value: payload.deviceId },
    ];
    const time = String(payload.ts);
    const records = Object.entries(payload.metrics)
      .map(([k, v]) => ({
        Dimensions: dimensions,
        MeasureName: k,
        MeasureValue: String(v),
        MeasureValueType: 'DOUBLE',
        Time: time,
      }));

    await tsw.send(new WriteRecordsCommand({
      DatabaseName: process.env.TS_DB!,
      TableName: process.env.TS_TABLE!,
      Records: records,
    }));

    return { statusCode: 202, body: 'accepted' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'internal error' };
  }
};*/
