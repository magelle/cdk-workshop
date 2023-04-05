import {aws_apigateway, aws_lambda, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {HitCounter} from "./hitcounter";
import {TableViewer} from "cdk-dynamo-table-viewer";

export class CdkWorkshopStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const hello = new aws_lambda.Function(this, 'HelloHandler', {
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            code: aws_lambda.Code.fromAsset('lambda'),
            handler: 'hello.handler'
        })

        const helloHitCounter = new HitCounter(this, 'HelloHitCounter', {
            downstream: hello
        })

        new aws_apigateway.LambdaRestApi(this, 'Endpoint', {
            handler: helloHitCounter.handler
        })

        new TableViewer(this, 'ViewHitCounter', {
            title: 'Hello Hits',
            table: helloHitCounter.table
        })
    }
}
