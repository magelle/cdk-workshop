import {aws_dynamodb, aws_lambda} from "aws-cdk-lib";
import {Construct} from "constructs";

export interface HitCounterProps {
    downstream: aws_lambda.IFunction
}

export class HitCounter extends Construct {

    public readonly handler: aws_lambda.Function

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new aws_dynamodb.Table(this, 'Hits', {
            partitionKey: {name: 'path', type: aws_dynamodb.AttributeType.STRING}
        })

        this.handler = new aws_lambda.Function(this, 'HitCounterHandler', {
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            handler: 'hitcounter.handler',
            code: aws_lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        })

        // grant the lambda role read/write permissions to our table
        table.grantReadWriteData(this.handler)

        // grant the lambda role invoke permissions to the downstream function
        props.downstream.grantInvoke(this.handler);
    }
}
