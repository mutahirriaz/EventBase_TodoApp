import {EventBridgeEvent, Context} from 'aws-lambda';
import { randomBytes } from "crypto";
import * as AWS from 'aws-sdk';
const dynamoClient = new AWS.DynamoDB.DocumentClient();

type Params = {
    TableName: string | ""
    Key : {
        id : string
    }
    UpdateExpression : string
    ExpressionAttributeValues : {
        ":todo" : string
    }
    ReturnValues : string
};

exports.handler = async (event: EventBridgeEvent<string, any>, context:Context) => {

    try{

        if(event["detail-type"] === "addTodo"){
            const params = {
                TableName: process.env.ADDTODO_EVENTS || "",
                Item: {
                    id: randomBytes(16).toString("hex"),
                    todo: event.detail.todo
                },
            };
            await dynamoClient.put(params).promise();
        }

        else if(event["detail-type"] === "deleteTodo"){
            const params = {
                TableName: process.env.ADDTODO_EVENTS || "",
                Key: {
                    id: event.detail.id
                },
            };
            await dynamoClient.delete(params).promise()
        }

        else if(event["detail-type"] === "updateTodo"){
            const params = {
                TableName: process.env.ADDTODO_EVENTS || "",
                Key: {
                    id: event.detail.id
                },
                UpdateExpression: "set todo = :todo",
                ExpressionAttributeValues: {
                    ":todo" : event.detail.todo
                },
                ReturnValues : "UPDATED_NEW",
            };
            await dynamoClient.update(params).promise()
        }

    }
    catch(err){
        console.log("Error", err)
    }

}