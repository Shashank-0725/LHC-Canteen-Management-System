# Render Deployment Guide

To safely deploy this application on Render as a single Web Service, follow these steps:

## 1. Create a New Web Service on Render
- Connect your GitHub repository.
- Select the `LHC_canteen_v2` project.

## 2. Service Configuration
- **Runtime**: `Node`
- **Root Directory**: `(Leave empty - use the project root)`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `node backend/server.js`

## 3. Environment Variables
Add the following keys in the Render dashboard under the **Environment** tab:
- `PORT`: `10000` (Render's default)
- `MONGODB_URI`: `(Your MongoDB Atlas connection string)`
- `JWT_SECRET`: `(Your random secret key)`
- `CLOUDINARY_CLOUD_NAME`: `(Your Cloudinary name)`
- `CLOUDINARY_API_KEY`: `(Your Cloudinary API key)`
- `CLOUDINARY_API_SECRET`: `(Your Cloudinary API secret)`

---

## Technical Details (What I Fixed)
- **Static File Serving**: Render now serves your HTML/CSS/JS files directly from the `frontend/` folder via the backend. This avoids CORS issues and simplifies deployment.
- **Organization**: I've moved all frontend assets into a dedicated `frontend/` folder to separate them from the server-side code.
- **Port Handling**: The app correctly listens on Render's dynamic port.
- **API URL Helper**: The frontend automatically detects its environment and uses the correct API URL.

## Potential Issues to Watch For
- **Case Sensitivity**: Linux (Render's OS) is case-sensitive. Ensure your file imports in code match the filename exactly (e.g., `main.css` vs `Main.css`).
- **Database IP Whitelist**: In MongoDB Atlas, ensure you have allowed connections from anywhere (`0.0.0.0/0`) since Render's outward-facing IPs can change.
- **Cold Starts**: If you are on the Render Free Tier, the backend will spin down after inactivity, causing a 30-60 second delay on the first load.
