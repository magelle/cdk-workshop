import {aws_apigateway, aws_lambda, Duration, lambda_layer_awscli, Stack, StackProps} from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new aws_lambda.Function(this, 'HelloHandler', {
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      code: aws_lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler'
    })

    new aws_apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: hello
    })
  }
}
