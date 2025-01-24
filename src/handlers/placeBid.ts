import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import { getAuctionById } from "./getAuction";
import validator from "@middy/validator";
import placeBidSchema from "../lib/schemas/placeBidSchema";
import { transpileSchema } from "@middy/validator/transpile";

const dynamoDB = new DynamoDB.DocumentClient();

interface PlaceBidBody {
  amount: number;
}

interface TypedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, "body"> {
  body: PlaceBidBody;
}

const placeBid = async (
  event: TypedAPIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters!;
  const { amount } = event.body;

  if (!id) {
    throw new createError.BadRequest('Missing auction ID');
  }

  const auction = await getAuctionById(id);

  if (auction.status !== "OPEN") {
    throw new createError.Forbidden(`You cannot bid on closed auctions!`);
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME!,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;

  try {
    const result = await dynamoDB.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError((error as Error).message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const handler = commonMiddleware(placeBid).use(
  validator({
    eventSchema: transpileSchema(placeBidSchema)
  })
);