import {aws_apigateway, aws_lambda, CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {HitCounter} from "./hitcounter";
import {TableViewer} from "cdk-dynamo-table-viewer";

export class CdkWorkshopStack extends Stack {
    public readonly hcViewerUrl: CfnOutput;
    public readonly hcEndpoint: CfnOutput;

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

        // defines an API Gateway REST API resource backed by our "hello" function.
        const gateway = new aws_apigateway.LambdaRestApi(this, 'Endpoint', {
            handler: helloHitCounter.handler
        })

        const tv = new TableViewer(this, 'ViewHitCounter', {
            title: 'Hello Hits',
            table: helloHitCounter.table
        })

        this.hcEndpoint = new CfnOutput(this, 'GatewayUrl', {
            value: gateway.url
        });

        this.hcViewerUrl = new CfnOutput(this, 'TableViewerUrl', {
            value: tv.endpoint
        });
    }
}
