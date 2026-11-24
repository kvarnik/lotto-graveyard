import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * CDK Stack for Lotto Graveyard Fortune Generator Lambda Function
 * 
 * This stack creates:
 * - Lambda function with Python 3.11 runtime
 * - IAM role with Bedrock permissions
 * - Function URL with CORS configuration
 * - CloudWatch log group with 7-day retention
 */
export class LottoGraveyardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM role for Lambda function with Bedrock permissions
    const lambdaRole = new iam.Role(this, 'FortuneGeneratorRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'IAM role for Lotto Graveyard Fortune Generator Lambda',
      managedPolicies: [
        // Basic Lambda execution permissions (CloudWatch Logs)
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ]
    });

    // Add Bedrock permissions for AI model invocation
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        // Allow access to Claude models in the account
        `arn:aws:bedrock:*::foundation-model/anthropic.claude-*`,
        // Allow access to any Bedrock model (can be restricted to specific models)
        `arn:aws:bedrock:*::foundation-model/*`
      ]
    }));

    // Lambda function
    const fortuneGenerator = new lambda.Function(this, 'FortuneGeneratorFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/fortune-generator')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30), // Per requirement 9.5
      memorySize: 256, // Per design specification
      description: 'Generates AI-powered tarot fortune interpretations',
      environment: {
        // Environment variables can be set here or via AWS Console/CLI
        // AI_MODEL_ENDPOINT and AI_API_KEY would be set via Secrets Manager
        AWS_REGION: this.region,
        BEDROCK_MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0'
      },
      logRetention: logs.RetentionDays.ONE_WEEK // 7-day retention for CloudWatch logs
    });

    // Create Function URL with CORS configuration
    const functionUrl = fortuneGenerator.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // Public access (no authentication)
      cors: {
        allowedOrigins: ['*'], // TODO: Restrict to specific domain in production
        allowedMethods: [lambda.HttpMethod.POST, lambda.HttpMethod.OPTIONS],
        allowedHeaders: ['Content-Type', 'Accept'],
        maxAge: cdk.Duration.hours(24) // 24 hours cache for CORS preflight
      }
    });

    // Output the Function URL for use in static site
    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: functionUrl.url,
      description: 'Fortune Generator Lambda Function URL',
      exportName: 'LottoGraveyardFunctionUrl'
    });

    // Output the Lambda function name
    new cdk.CfnOutput(this, 'FunctionName', {
      value: fortuneGenerator.functionName,
      description: 'Lambda Function Name',
      exportName: 'LottoGraveyardFunctionName'
    });

    // Output the Lambda function ARN
    new cdk.CfnOutput(this, 'FunctionArn', {
      value: fortuneGenerator.functionArn,
      description: 'Lambda Function ARN',
      exportName: 'LottoGraveyardFunctionArn'
    });

    // Output the CloudWatch log group
    new cdk.CfnOutput(this, 'LogGroupName', {
      value: fortuneGenerator.logGroup.logGroupName,
      description: 'CloudWatch Log Group Name',
      exportName: 'LottoGraveyardLogGroupName'
    });
  }
}
