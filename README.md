# HTTPS-only Health Endpoint Starter

This starter uses:
- GitHub Pages for the static PWA frontend
- Render Web Service for the live `/health` API
- Render-managed HTTPS at the public edge
- `/health` as the Render deployment health-check path

## 1. Deploy the API

1. Create a new GitHub repository, for example `new-app-health-api`.
2. Upload `package.json`, `server.js`, `render.yaml`, and `.gitignore` to the repository root.
3. Sign in to Render and choose **New + → Web Service**.
4. Connect the repository and deploy it. If prompted, use:
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path: `/health`
5. Render will assign a service URL similar to `https://your-service-name.onrender.com`.
6. In Render → Environment, set `APP_ORIGIN` to the exact GitHub Pages origin (for example `https://YOUR-USERNAME.github.io`; do not add a repository path).  
7. Open `https://your-service-name.onrender.com/health`. A successful response should contain `"status":"ok"` and `"https":true`.

Render terminates TLS at its public edge and redirects incoming public HTTP traffic to HTTPS. The Node process listens on the internal `PORT`; do not create a separate TLS certificate or commit private keys for this standard Render setup.

## 2. Connect the GitHub Pages app

1. Copy `public/health-check.js` into your frontend repository.
2. Replace `https://REPLACE-WITH-YOUR-SERVICE.onrender.com/health` with the real HTTPS URL from Render.
3. Include the script in your HTML:
   `<script src="./health-check.js"></script>`
4. In Render, set `APP_ORIGIN` to the exact origin of your GitHub Pages site, then redeploy if needed.
5. Call `checkHealth()` from your app and show its result in the UI. The starter allows CORS only for that configured origin. Do not use wildcard CORS for private or authenticated endpoints.

## 3. Enforce HTTPS for GitHub Pages

In the GitHub repository:
**Settings → Pages → Enforce HTTPS**.

GitHub Pages `github.io` sites support HTTPS. Check that all scripts, images, stylesheets, and API URLs use `https://`, not `http://`.

## 4. Test

### Browser
Open the deployed `https://...onrender.com/health` URL. Expect HTTP 200 and JSON containing:
- `status: "ok"`
- `https: true`
- an ISO timestamp

### PowerShell
```powershell
curl.exe -i https://YOUR-SERVICE.onrender.com/health
curl.exe -I http://YOUR-SERVICE.onrender.com/health
```
The HTTPS request should return `200`. The public HTTP request should redirect to HTTPS at Render's edge (commonly a `301` or `308`); verify the `Location` header starts with `https://`.

### macOS/Linux
```bash
curl -i https://YOUR-SERVICE.onrender.com/health
curl -I http://YOUR-SERVICE.onrender.com/health
```

### Render deployment health check
In the Render service settings, set **Health Check Path** to `/health`. Render considers `2xx`/`3xx` responses healthy and uses this endpoint during deployment and runtime checks.

## Important limitations

- This endpoint checks that the API process responds. It does not check a database because this starter has no database.
- A GitHub Pages site cannot run a Node server by itself; the API must be deployed separately.
- The service URL does not exist until you deploy it. Replace the placeholder URL only after Render provides the actual URL.
- Render's free service may spin down when idle, so the first request may be delayed.
- Do not put passwords, API secrets, private keys, or tokens in the public GitHub repository.
