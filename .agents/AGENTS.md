# Project Rules & Customizations

## Background Tasks & Uploads
- **NEVER use `await` on long-running background tasks** inside an Express route handler, especially for file uploads to third-party services like Telegram or Cloudinary.
- **Why?** Using `await` blocks the HTTP response from returning to the frontend. For bulk operations (like uploading 20 MP3 files), this causes massive delays (minutes instead of seconds) and can result in `502 Bad Gateway` timeouts.
- **How to implement:** Return the HTTP response (e.g. `res.status(201)`) immediately, and let the background task (e.g. `uploadToTelegramInBackground(...)`) run asynchronously in the Node.js event loop without blocking the main request.
- **Error Handling:** Background tasks should internally catch their own errors and log them, updating the database status if necessary, without crashing the server.
