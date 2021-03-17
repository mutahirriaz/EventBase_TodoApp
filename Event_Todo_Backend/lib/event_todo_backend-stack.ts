import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import * as targets from "@aws-cdk/aws-events-targets";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as cognito from "@aws-cdk/aws-cognito"; 
import { requestTemplate, responseTemplate } from '../utils/appsync-request-response';
import { UserPoolClient } from '@aws-cdk/aws-cognito';

export class EventTodoBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const userPool = new cognito.UserPool(this, "CrudApp_UserPool", {
    userPoolName: "CrudApp_Event_Userpool",
    selfSignUpEnabled: true,
    accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    userVerification: {
      emailStyle: cognito.VerificationEmailStyle.CODE,
      smsMessage: "Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}"
    },
    autoVerify: {
      email: true
    },
    standardAttributes: {
      email: {
        mutable: true,
        required: true
      },
      phoneNumber: {
        required: true,
        mutable: true
      },
    } ,
    });

    // we Need userClient to connect userPool with our frontEnd
    const userPoolClient = new cognito.UserPoolClient(this, "userPoolClient", {
      userPool: userPool
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClient", {
      value: userPoolClient.userPoolClientId,
    });

    const api = new appsync.GraphqlApi(this, "TodoApi", {
      name: "TodoEventApi",
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
         
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // Http Datasource
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsWithEventBridge",
        description: "From Appsync To Event Bridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );

    events.EventBus.grantAllPutEvents(httpDs);

    const todoLambda = new lambda.Function(this, "todosLambda", {
      code: lambda.Code.fromAsset("function"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler"
    });

    const mutations = ["addTodo", "deleteTodo", "updateTodo"]

    mutations.forEach((mut) => {
      if(mut === "addTodo"){
        let details = `\\\"todo\\\": \\\"$ctx.arguments.todo\\\"`

        const addTodoResolver = httpDs.createResolver({
          typeName: "Mutation",
          fieldName: mut,
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate())
        });

      }

      else if (mut === "deleteTodo") {
        let details = `\\\"id\\\": \\\"$ctx.arguments.id\\\"`

        const deleteEventResolver = httpDs.createResolver({
          typeName: "Mutation",
          fieldName: mut,
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
      }

      else if (mut === "updateTodo") {
        let details = `\\\"id\\\": \\\"$ctx.arguments.id\\\",\\\"todo\\\": \\\"$ctx.arguments.todo\\\"`

        const updateEventResolver = httpDs.createResolver({
          typeName: "Mutation",
          fieldName: mut,
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
      }


    });

    // DynamoDb Table
    const dynamodbTable = new dynamodb.Table(this, "EventTodoTable", {
      tableName: "addTodoEvent",
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
    });

    dynamodbTable.grantFullAccess(todoLambda);
    todoLambda.addEnvironment('ADDTODO_EVENTS', dynamodbTable.tableName);

    const datasource = api.addDynamoDbDataSource('appsyncDatasource', dynamodbTable)

    datasource.createResolver({
      typeName: "Query",
      fieldName: "getTodos",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList()
    });

     // RULE ON DEFAULT EVENT BUS TO TARGET todoLambda LAMBDA
    const rule = new events.Rule(this, "AppSyncEventRule", {
      eventPattern: {
        source: ["eru-appsync-events"],
        detailType: [...mutations]
      },
    });

    rule.addTarget(new targets.LambdaFunction(todoLambda))


  }
}
