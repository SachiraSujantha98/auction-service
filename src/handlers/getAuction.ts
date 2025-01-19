import { DynamoDB } from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
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

export async function getAuctionById(id: string) {
  let auction: Auction;
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

  return auction;
}

const getAuction = async (
  event: TypedAPIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters || {};
  if (!id) {
    throw new createError.BadRequest("ID is required");
  }
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const handler = commonMiddleware(getAuction);
