# Project Rules & Customizations

## Background Tasks & Uploads
- **NEVER use `await` on long-running background tasks** inside an Express route handler, especially for file uploads to third-party services like Telegram or Cloudinary.
- **Why?** Using `await` blocks the HTTP response from returning to the frontend. For bulk operations (like uploading 20 MP3 files), this causes massive delays (minutes instead of seconds) and can result in `502 Bad Gateway` timeouts.
- **How to implement:** Return the HTTP response (e.g. `res.status(201)`) immediately, and let the background task (e.g. `uploadToTelegramInBackground(...)`) run asynchronously in the Node.js event loop without blocking the main request.
- **Error Handling:** Background tasks should internally catch their own errors and log them, updating the database status if necessary, without crashing the server.

## Strict Mobile UI & Real-Data Enforcement
- **No "Bekar Space" (Excessive Mobile Padding):** NEVER use flat, large padding or gaps (e.g., `p-6`, `p-8`, `gap-6`) on container elements. ALWAYS use responsive tailwind utilities to keep mobile compact while preserving desktop size (e.g., `p-4 md:p-6`, `gap-4 md:gap-6`, `space-y-4 md:space-y-6`).
- **No Mobile Overlaps:** Always wrap main containers with `overflow-x-hidden` or `min-w-0` to prevent mobile viewports from scrolling horizontally or content bleeding out.
- **Mobile Navigation:** If building a mobile dashboard or separate mobile layout, ALWAYS ensure a clear, functional "Back" button (`<ArrowLeft />`) is visible on mobile screens.
- **NO FAKE DATA:** Never build or retain UI components that display hardcoded, fake, or mock statistics (e.g., "Fake Server Stats"). If an API doesn't exist for it, do not show a fake widget.
- **Functionality over Looks:** Never create buttons that "look good but do nothing" (e.g., a "Generate Report" button that just calls `window.print()` or empty console.log). If a button is added, it must be fully functional.

## Split Deployment Architecture Rules (Vercel + Render)
- **Frontend API Fetching Rule:** NEVER use raw relative paths like `fetch('/api/...')` or `axios.get('/api/...')` anywhere in the frontend code. In split deployments (Frontend on Vercel, Backend on Render), relative paths resolve to the Vercel domain, resulting in 404s or returning `index.html`. ALWAYS import `BACKEND_URL` from the central configuration (e.g., `features/api/apiSlice.js`) and use template literals: `fetch(`${BACKEND_URL}/endpoint`)`.
- **Socket.io CORS Configuration Rule:** When configuring Socket.io on a dedicated backend server (e.g., Render/Railway) that serves a frontend on a different domain (Vercel/Netlify), ensure CORS is configured to dynamically accept all valid origins (`origin: (origin, callback) => callback(null, true)`), or explicitly mirror the Express CORS configuration. Hardcoded origin arrays easily break when deployment URLs change, causing immediate and silent failure of all real-time features.
