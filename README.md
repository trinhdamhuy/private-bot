# Private Discord Bot

Discord Interactions bot built with TypeScript + Express.  
Primary deployment target is **Vercel**.  
`ngrok` + `docker-compose` are only for **local testing**.

## Features

- Slash command: `/message`
- Verifies Discord request signatures using `PUBLIC_KEY`
- Sends messages via Discord REST API with bot token

## Tech Stack

- Node.js 20+
- TypeScript
- Express
- `discord-interactions`

## Project Structure

```txt
.
├── app/
│   ├── app.ts         # Express app + /interactions handler
│   ├── commands.ts    # Slash command registration script
│   ├── utils.ts       # VerifyDiscordRequest, DiscordRequest helpers
│   └── types.ts
├── docker-compose.yml # Optional: run ngrok for local webhook testing
├── vercel.json        # Vercel serverless routing/runtime config
├── .env.sample
└── package.json
```

## Environment Variables

Copy `.env.sample` to `.env` and fill values:

```bash
APP_ID=<YOUR_APP_ID>
DISCORD_TOKEN=<YOUR_BOT_TOKEN>
PUBLIC_KEY=<YOUR_PUBLIC_KEY>
PORT=3000

# Optional: local testing with ngrok + docker only
NGROK_AUTHTOKEN=<NGROK_AUTHTOKEN>
NGROK_DOMAIN=<NGROK_DOMAIN>
NGROK_FORWARD=host.docker.internal:3000
```

### Required in production (Vercel)

- `APP_ID`
- `DISCORD_TOKEN`
- `PUBLIC_KEY`

### Local-only (optional)

- `PORT`
- `NGROK_AUTHTOKEN`
- `NGROK_DOMAIN`
- `NGROK_FORWARD`

## Setup

```bash
npm install
```

Register slash commands:

```bash
npm run register
```

## Run Locally

Start bot server:

```bash
npm run dev
```

Local endpoint:

- `http://localhost:3000/interactions`

## Local Public URL (Optional, for testing)

If you want Discord to call your local machine, expose local server with ngrok using Docker:

```bash
docker compose up -d
```

Then set Discord Interactions Endpoint URL to:

- `https://<your-ngrok-domain>/interactions`

> This step is only for local testing. For stable usage, deploy to Vercel.

## Deploy to Vercel (Recommended)

1. Deploy project with Vercel (`vercel` CLI or Git integration).
2. Add production environment variables on Vercel:
   - `APP_ID`
   - `DISCORD_TOKEN`
   - `PUBLIC_KEY`
3. Set Discord Interactions Endpoint URL:
   - `https://<your-vercel-domain>/interactions`
4. Save settings in Discord Developer Portal.

## NPM Scripts

- `npm run dev`: run local development server with hot reload
- `npm run register`: register global slash commands
- `npm start`: run app with `tsx`
