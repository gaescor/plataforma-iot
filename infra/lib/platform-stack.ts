// import * as timestream from 'aws-cdk-lib/aws-timestream'; // ❌ desactivado por ahora
import * as cdk from 'aws-cdk-lib';
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
