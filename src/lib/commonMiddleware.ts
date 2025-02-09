import { Handler } from 'aws-lambda';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';

export default function commonMiddleware<T extends Handler>(handler: T, isHttpEvent: boolean = true) {
  const middleware = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());

  if (isHttpEvent) {
    middleware.use(httpEventNormalizer());
  }

  return middleware;
}