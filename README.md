# StockJar

A stock tracking web app built with Next.js 15. Search stocks, manage a personal watchlist, and receive AI-powered daily news summaries via email.

## Features

- Stock search powered by the [Finnhub API](https://finnhub.io)
- TradingView chart widgets for real-time price visualization
- Personal watchlist per user
- Authentication via [Better Auth](https://better-auth.com)
- AI-generated personalized welcome emails on sign-up
- Daily market news summary emails tailored to your watchlist (via [Inngest](https://inngest.com) + Gemini AI)
- Email delivery via Nodemailer

## Tech Stack

- **Framework:** Next.js 15 (Turbopack)
- **Database:** MongoDB / Mongoose
- **Auth:** Better Auth
- **Background jobs / AI:** Inngest + Gemini 2.5 Flash Lite
- **Email:** Nodemailer
- **UI:** Tailwind CSS v4, Radix UI, shadcn/ui, Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string
- A [Finnhub](https://finnhub.io) API key
- An [Inngest](https://inngest.com) account (for background jobs)
- An SMTP server or email provider for Nodemailer

### Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=<your_mongodb_uri>
FINNHUB_API_KEY=<your_finnhub_api_key>
NEXT_PUBLIC_FINNHUB_API_KEY=<your_finnhub_api_key>
BETTER_AUTH_SECRET=<your_better_auth_secret>
BETTER_AUTH_URL=http://localhost:3000
INNGEST_EVENT_KEY=<your_inngest_event_key>
INNGEST_SIGNING_KEY=<your_inngest_signing_key>
EMAIL_HOST=<smtp_host>
EMAIL_PORT=<smtp_port>
EMAIL_USER=<smtp_user>
EMAIL_PASS=<smtp_password>
EMAIL_FROM=<from_address>
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Scripts

```bash
npm run build      # Production build
npm run start      # Start production server
npm run db:test    # Test MongoDB connection
```
