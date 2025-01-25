# Auction Service

A serverless auction service built with AWS Lambda and the Serverless Framework.

## Features

- Create auctions
- Get auctions
- Place bids on auctions
- Close auctions automatically
- Email notifications for auction participants (TODO)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials

3. Deploy the service:
```bash
npm run deploy
```

## Available Endpoints

### Auctions

- `POST /auction` - Create a new auction
- `GET /auctions` - Get all auctions
- `GET /auction/{id}` - Get auction by ID
- `PATCH /auction/{id}/bid` - Place a bid on an auction


