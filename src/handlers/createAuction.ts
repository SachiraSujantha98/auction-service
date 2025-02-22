import { v4 as uuid } from "uuid";
import { DynamoDB } from "aws-sdk";
import createError from "http-errors";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Auction } from "../types/auction";
import commonMiddleware from "../lib/commonMiddleware";
import validator from "@middy/validator";
import createAuctionSchema from "../lib/schemas/createAuctionSchema";
import { transpileSchema } from "@middy/validator/transpile";

const dynamoDB = new DynamoDB.DocumentClient();

interface CreateAuctionBody {
  title: string;
}

interface TypedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, "body"> {
  body: CreateAuctionBody;
  requestContext: {
    authorizer: {
      email: string;
    };
  } & APIGatewayProxyEvent['requestContext'];
}

const createAuction = async (
  event: TypedAPIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { title } = event.body;
  const { email } = event.requestContext.authorizer;
  const now = new Date();
  const endDate = new Date();
  endDate.setMinutes(now.getMinutes() + 1);

  const auction: Auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
      bidder: '',
    },
    seller: email,
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME!,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError((error as Error).message);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
};

export const handler = commonMiddleware(createAuction).use(
  validator({
    eventSchema: transpileSchema(createAuctionSchema)
  })
);