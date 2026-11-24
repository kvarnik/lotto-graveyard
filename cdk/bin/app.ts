#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LottoGraveyardStack } from '../lib/lotto-graveyard-stack';

const app = new cdk.App();

new LottoGraveyardStack(app, 'LottoGraveyardStack', {
  /* 
   * Uncomment the next line to specify the AWS account and region
   * If not specified, CDK will use the default AWS profile credentials
   */
  // env: { account: '123456789012', region: 'us-east-1' },
  
  description: 'AWS Lambda infrastructure for Lotto Graveyard Fortune Generator',
  
  tags: {
    Application: 'LottoGraveyard',
    Environment: 'Production',
    ManagedBy: 'CDK'
  }
});

app.synth();
