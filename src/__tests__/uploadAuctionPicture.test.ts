import { handler as uploadAuctionPictureHandler } from '../handlers/uploadAuctionPicture';

jest.mock('@middy/validator', () => () => ({
  before: (handler) => handler,
}));

describe('uploadAuctionPicture', () => {
  it('should upload an auction picture successfully', async () => {
    // Arrange: Set up any necessary data or state
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        auctionId: 'auction-id',
        base64Image: 'base64-encoded-image',
      }),
      headers: {},
      multiValueHeaders: {},
      pathParameters: null,
      stageVariables: null,
      requestContext: {
        identity: {
          sourceIp: '127.0.0.1',
        },
      },
    };
    const context = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'testFunction',
      functionVersion: '1',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:testFunction',
      memoryLimitInMB: '128',
      awsRequestId: 'testRequestId',
      logGroupName: '/aws/lambda/testFunction',
      logStreamName: 'testLogStream',
      getRemainingTimeInMillis: () => 1000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    };

    // Act: Call the function under test
    const result = await uploadAuctionPictureHandler(event, context);

    // Assert: Verify the result
    expect(result).toBeDefined();
  });
}); 