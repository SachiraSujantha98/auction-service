import { DynamoDB } from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Auction } from "../types/auction";
import { getAuctionById } from "./getAuction";

const dynamoDB = new DynamoDB.DocumentClient();

// request body
interface CreateAuctionBody {
  title: string;
  amount: number;
}

// Extend the API Gateway event type to include our typed body
interface TypedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, "body"> {
  body: CreateAuctionBody;
}

const placeBid = async (
  event: TypedAPIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters || {};
  const { amount } = event.body;

  if (!id) {
    throw new createError.BadRequest("ID is required");
  }

  const auction = await getAuctionById(id);

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME as string,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction: Auction;

  try {
    const result = await dynamoDB.update(params).promise();
    updatedAuction = result.Attributes as Auction;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const handler = commonMiddleware(placeBid);
