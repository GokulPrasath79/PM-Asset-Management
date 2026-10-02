# P&M Asset Management

Static site (`index.html`) + one serverless API (`api/state.js`) backed by Upstash Redis, so P&M, Site Engineer and Operator all share the same data.

## Deploy to Vercel
1. Push this folder to a GitHub repo (or run `npm i -g vercel && vercel --prod` inside it).
2. In Vercel: **Add New → Project →** import the repo → Deploy.
3. Project → **Storage → Create / Connect Database → Upstash Redis** (Marketplace, free tier). This adds the env vars `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. *(Optional)* Project → Settings → Environment Variables → add `APP_PASSWORD` to require a shared password.
5. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect. Open the URL – done.

## Local test
`vercel link && vercel env pull && vercel dev`

## Data
Redis hashes: `pm:assets` (asset code → asset) and `pm:logs` ("assetCode|YYYY-MM-DD" → site engineer + operator entry).
