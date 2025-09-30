import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export class PlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 📦 DynamoDB Table
    const telemetryTable = new dynamodb.Table(this, "TelemetryTable", {
      partitionKey: { name: "deviceId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "timestamp", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // ⚠️ destruir en teardown
    });

    // 🌐 API Gateway con CORS habilitado
    const api = new apigateway.RestApi(this, "PlatformApi", {
      restApiName: "Platform Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Lambda para /telemetry (opcional para lógica más avanzada)
    const telemetryLambda = new lambda.Function(this, "TelemetryLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "telemetry.handler",
      code: lambda.Code.fromAsset("lambda"), // carpeta donde está telemetry.ts compilado
    });

    // 📡 Recurso /telemetry
    const telemetryResource = api.root.addResource("telemetry");

    // ✅ Role para que API Gateway acceda a DynamoDB
    const apiDynamoRole = new iam.Role(this, "ApiDynamoRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    // ✅ Dar permisos explícitos
apiDynamoRole.addToPolicy(new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:Scan"],
  resources: [telemetryTable.tableArn],
}));

    telemetryTable.grantReadData(telemetryLambda); // 👈 permisos de lectura   apiDynamoRole

    // GET /telemetry → DynamoDB
    telemetryResource.addMethod(
      "GET",
      new apigateway.AwsIntegration({
        service: "dynamodb",
        action: "Query",
        options: {
          credentialsRole: apiDynamoRole, // 👈 ahora sí lo usamos
          integrationResponses: [
            {
              statusCode: "200",
              responseParameters: {
                "method.response.header.Access-Control-Allow-Origin": "'*'",
              },
            },
          ],
          requestTemplates: {
            "application/json": JSON.stringify({
              TableName: telemetryTable.tableName,
              KeyConditionExpression: "deviceId = :deviceId",
              ExpressionAttributeValues: {
                ":deviceId": { S: "$input.params('deviceId')" },
              },
            }),
          },
        },
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Origin": true,
            },
          },
        ],
      }
    );

    // 👉 Output para usar en el frontend
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
    });
  }
}








/*import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// ... cuando creas el API
const api = new apigateway.RestApi(this, 'TelemetryApi', {
  restApiName: 'Telemetry Service',
  description: 'API para consultar telemetría',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ['*'],
  },
});

// recurso /telemetry
const telemetryResource = api.root.addResource('telemetry');

telemetryResource.addMethod(
  'GET',
  new apigateway.LambdaIntegration(queryFn),
  {
    authorizationType: apigateway.AuthorizationType.NONE,
    apiKeyRequired: true,
    methodResponses: [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
        },
      },
    ],
  }
);

// respuestas por defecto con CORS
api.addGatewayResponse('Default4xx', {
  type: apigateway.ResponseType.DEFAULT_4XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
    'Access-Control-Allow-Headers': "'*'",
  },
});
api.addGatewayResponse('Default5xx', {
  type: apigateway.ResponseType.DEFAULT_5XX,
  responseHeaders: {
    'Access-Control-Allow-Origin': "'*'",
    'Access-Control-Allow-Headers': "'*'",
  },
});*/



// import * as timestream from 'aws-cdk-lib/aws-timestream'; // ❌ desactivado por ahora
/*import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib';

import * as path from 'path';

export class PlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 📦 Bucket para datos crudos
    const rawBucket = new s3.Bucket(this, 'RawBucket', {
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY // ⚠️ en prod cambiar a RETAIN
    });

    // 🗄️ Tabla DynamoDB para telemetría
    const telemetryTable = new dynamodb.Table(this, 'TelemetryTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // ⚠️ solo dev
    });

    // 🗄️ Tabla DynamoDB para dispositivos
    const devicesTable = new dynamodb.Table(this, 'DevicesTable', {
      partitionKey: { name: 'tenantId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'deviceId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // 🗄️ Tabla DynamoDB para alertas
    const alertsTable = new dynamodb.Table(this, 'AlertsTable', {
      partitionKey: { name: 'tenantId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'alertId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true
    });

    // 👤 Cognito (usuarios del frontend)
    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      mfa: cognito.Mfa.OPTIONAL,
      passwordPolicy: { minLength: 8 }
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: { userPassword: true, userSrp: true }
    });

    // ⚡ Lambda - ingestion (POST /ingest)
    const ingestionFn = new lambda.Function(this, 'IngestionHttpFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../services/ingestion-http/dist')),
      environment: {
        TELEMETRY_TABLE: telemetryTable.tableName,
        RAW_BUCKET: rawBucket.bucketName,
        DEVICES_TABLE: devicesTable.tableName,
        ALERTS_TABLE: alertsTable.tableName
      },
      timeout: cdk.Duration.seconds(15)
    });

    // ⚡ Lambda - consulta (GET /telemetry)
    const queryFn = new lambda.Function(this, 'QueryTelemetryFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../services/query-telemetry/dist')),
      environment: {
        TELEMETRY_TABLE: telemetryTable.tableName
      },
      timeout: cdk.Duration.seconds(15)
    });

    // 🔑 Permisos
    rawBucket.grantWrite(ingestionFn);             
    telemetryTable.grantWriteData(ingestionFn);    
    devicesTable.grantReadData(ingestionFn);       
    alertsTable.grantWriteData(ingestionFn);       
    telemetryTable.grantReadData(queryFn);

    // 🌐 API Gateway
    const api = new apigateway.RestApi(this, 'IngestionApi', {
      restApiName: 'FuelMegaIngestApi',
      deployOptions: { stageName: 'prod' }
    });

    // POST /ingest
    const ingestResource = api.root.addResource('ingest');
    ingestResource.addMethod('POST', new apigateway.LambdaIntegration(ingestionFn));

    // GET /telemetry
    const telemetryResource = api.root.addResource('telemetry');
    telemetryResource.addMethod('GET', new apigateway.LambdaIntegration(queryFn));

    // 🔐 API Key (opcional, para devices)
    const apiKey = api.addApiKey('IngestApiKey');
    const plan = api.addUsagePlan('IngestUsagePlan', { name: 'IngestPlan' });
    plan.addApiKey(apiKey);
    plan.addApiStage({ stage: api.deploymentStage, api });

    // 📤 Outputs
    new cdk.CfnOutput(this, 'IngestUrl', { value: `${api.url}ingest` });
    new cdk.CfnOutput(this, 'TelemetryUrl', { value: `${api.url}telemetry` });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ApiKey', { value: apiKey.keyId });
  }
}
*/