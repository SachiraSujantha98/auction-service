import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import validator from "@middy/validator";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";
import { transpileSchema } from "@middy/validator/transpile";

const dynamoDB = new DynamoDB.DocumentClient();

const getAuctions = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let auctions;
  const { status } = event.queryStringParameters ?? {};

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME!,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError((error as Error).message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
};

export const handler = commonMiddleware(getAuctions).use(
  validator({
    eventSchema: transpileSchema(getAuctionsSchema)
  })
);