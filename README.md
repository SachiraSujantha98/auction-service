# Auction Service

A serverless auction service built with AWS Lambda and the Serverless Framework. This service provides a complete backend for managing online auctions with features like authentication, bidding, and automatic auction closing.

## Features

- User authentication and authorization
- Create and manage auctions
- Get auctions with status filtering
- Place bids on auctions
- Upload pictures for auction items
- Automatic auction closing system
- DynamoDB for data persistence
- S3 for picture storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials with appropriate permissions for:
   - Lambda functions
   - DynamoDB
   - S3
   - CloudWatch

3. Deploy the service:
```bash
npm run deploy
```

For production deployment:
```bash
npm run deploy:prod
```

## Available Scripts

- `npm run deploy` - Deploy to development stage
- `npm run deploy:prod` - Deploy to production stage
- `npm run deploy:function` - Deploy a single function
- `npm run invoke` - Invoke the auction processing function
- `npm run build` - Build the TypeScript code
- `npm run remove` - Remove the development stage
- `npm run remove:prod` - Remove the production stage

## Available Endpoints

### Auctions

- `POST /auction` - Create a new auction
  - Requires authentication
  - Body: `{ "title": "string" }`

- `GET /auctions` - Get all auctions
  - Query Parameters:
    - `status`: Filter by auction status ("OPEN" or "CLOSED")

- `GET /auction/{id}` - Get auction by ID

- `PATCH /auction/{id}/bid` - Place a bid on an auction
  - Requires authentication
  - Body: `{ "amount": number }`
  - Validations:
    - Cannot bid on your own auctions
    - Cannot bid if you're already highest bidder
    - Cannot bid on closed auctions
    - Bid must be higher than current highest bid

- `PATCH /auction/{id}/picture` - Upload a picture for an auction
  - Requires authentication
  - Only the seller can upload pictures
  - Body: Base64 encoded image

## Authentication

The service requires authentication for certain endpoints. Users must be authenticated to:
- Create auctions
- Place bids
- Upload pictures




