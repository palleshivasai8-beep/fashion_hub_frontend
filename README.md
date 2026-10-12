# Fashion Hub Frontend

Fashion Hub's React and Vite storefront, including the product catalogue, registration/login, shopping cart, checkout, order history, and delivery status.

## Local development

Install dependencies and copy `.env.example` to `.env.local`. Set `VITE_API_URL` to the backend origin (for example, `http://localhost:8081`); the frontend appends `/api` automatically. Then run:

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; Vite writes the static site to `dist`.

## Vercel deployment

Import `palleshivasai8-beep/fashion_hub_frontend` as a Vercel project and deploy the `main` branch with:

- Framework preset: **Vite**
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-render-service>.onrender.com`

Set the environment variable for every Vercel environment you deploy (Production, Preview, and Development as needed), then redeploy. Use the actual Render service origin without `/api`; the app adds `/api` to product, authentication, and order requests. `.env.example` is only a placeholder; never commit `.env.local` or credentials.

The existing `vercel.json` rewrite sends browser routes to `index.html`, so page refreshes continue to load the React app.

In Render, allow the deployed Vercel origin in `CORS_ALLOWED_ORIGINS`; local development at `http://localhost:5173` is already allowed.
