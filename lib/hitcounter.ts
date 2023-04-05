import {aws_dynamodb, aws_lambda, RemovalPolicy} from "aws-cdk-lib";
import {Construct} from "constructs";

export interface HitCounterProps {
    /** the function for which we want to count url hits **/
    downstream: aws_lambda.IFunction;

    /**
     * The read capacity units for the table
     *
     * Must be greater than 5 and lower than 20
     *
     * @default 5
     */
    readCapacity?: number;
}

export class HitCounter extends Construct {
    /** allows accessing the counter function */
    public readonly handler: aws_lambda.Function

    /** the hit counter table */
    public readonly table: aws_dynamodb.Table;
    constructor(scope: Construct, id: string, props: HitCounterProps) {
        if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
            throw new Error('readCapacity must be greater than 5 and less than 20');
        }

        super(scope, id);

        const table = new aws_dynamodb.Table(this, 'Hits', {
            partitionKey: {name: 'path', type: aws_dynamodb.AttributeType.STRING},
//            removalPolicy: RemovalPolicy.DESTROY,
            encryption: aws_dynamodb.TableEncryption.AWS_MANAGED,
            readCapacity: props.readCapacity ?? 5
        })
        this.table = table

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
