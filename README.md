<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/28b46e72-912b-43a6-a368-55578df87989

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy

1. Set `GEMINI_API_KEY` in your deployment environment.
2. Build the app:
   `npm run build`
3. Start the production server:
   `npm start`

The server reads `PORT` and `HOST` from the environment and defaults to `3000` and `0.0.0.0`.
