import { DynamoDB } from "aws-sdk";
import createError from "http-errors";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Auction } from "../types/auction";
import commonMiddleware from "../lib/commonMiddleware";

const dynamoDB = new DynamoDB.DocumentClient();

// request body
interface CreateAuctionBody {
  title: string;
}

// Extend the API Gateway event type to include our typed body
interface TypedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, "body"> {
  body: CreateAuctionBody;
}

const getAuctions = async (
  event: TypedAPIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let auctions: Auction[];

  try {
    const result = await dynamoDB
      .scan({
        TableName: process.env.AUCTIONS_TABLE_NAME!,
      })
      .promise();

    auctions = result.Items as Auction[];
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError((error as Error).message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
};

export const handler = commonMiddleware(getAuctions);
