import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createHttpError from "http-errors";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import { getAuctionById } from "./getAuction";
import { setAuctionPictureUrl } from "../lib/setAuctionPictureUrl";
import validator from "@middy/validator";
import uploadAuctionPictureSchema from "../lib/schemas/uploadAuctionPictureSchema";
import cors from '@middy/http-cors';

const uploadAuctionPicture = async (event) => {
    const { id } = event.pathParameters;
    const { email } = event.requestContext.authorizer;
    const auction = await getAuctionById(id);

    // Validate auction ownership
    if (auction.seller !== email) {
        throw new createHttpError.Forbidden(
            "You are not the seller of this auction!"
        );
    }

    const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    let updatedAuction;

    try {
        const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);
        updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
    } catch (error) {
        console.error(error);
        throw new createHttpError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
};

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(validator({ eventSchema: uploadAuctionPictureSchema }))
    .use(cors());
