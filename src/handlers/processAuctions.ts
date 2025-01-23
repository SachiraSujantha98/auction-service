import { DynamoDB } from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import { Auction } from "../types/auction";

const dynamoDB = new DynamoDB.DocumentClient();

const processAuctions = async () => {
  try {
    const now = new Date();
    const params = {
      TableName: process.env.AUCTIONS_TABLE_NAME!,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status AND endingAt <= :now",
      ExpressionAttributeValues: {
        ":status": "OPEN",
        ":now": now.toISOString(),
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    const result = await dynamoDB.query(params).promise();
    const auctions = result.Items as Auction[];

    const closePromises = auctions.map((auction) => closeAuction(auction));
    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError((error as Error).message);
  }
};

async function closeAuction(auction: Auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME!,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamoDB.update(params).promise();
  return result;
}

export const handler = commonMiddleware(processAuctions);