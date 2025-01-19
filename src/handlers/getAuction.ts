import { DynamoDB } from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Auction } from "../types/auction";

const dynamoDB = new DynamoDB.DocumentClient();

// request body
interface CreateAuctionBody {
  title: string;
}

// Extend the API Gateway event type to include our typed body
interface TypedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, "body"> {
  body: CreateAuctionBody;
}

const getAuction = async (
  event: TypedAPIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let auction: Auction;
  const { id } = event.pathParameters || {};

  try {
    const result = await dynamoDB
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME as string,
        Key: { id },
      })
      .promise();

    auction = result.Item as Auction;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with ID "${id}" not found.`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const handler = middy(getAuction)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
