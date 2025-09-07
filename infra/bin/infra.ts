#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PlatformStack } from '../lib/platform-stack';  // 👈 importa PlatformStack, no InfraStack

const app = new cdk.App();
new PlatformStack(app, 'PlatformStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});