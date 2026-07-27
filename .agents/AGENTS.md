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
