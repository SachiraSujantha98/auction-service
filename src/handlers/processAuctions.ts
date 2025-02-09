import { DynamoDB } from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import { closeAuction } from "../lib/closeAuction";
import { getEndedAuctions } from "../lib/getEndedAuctions";

const dynamoDB = new DynamoDB.DocumentClient();

const processAuctions = async () => {
  try {
    const auctions = await getEndedAuctions() || [];

    const closePromises = auctions.map((auction) => closeAuction(auction));
    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError((error as Error).message);
  }
};

export const handler = commonMiddleware(processAuctions, false);