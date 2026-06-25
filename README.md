# ModsApp - Premium APK/Games Platform

A complete production-ready MERN Stack application featuring a modern glassmorphism UI, advanced admin panel, SEO optimization, TipTap rich text editor, MongoDB Atlas Search, Redis caching, and robust security.

## Tech Stack
- **Frontend**: React.js (Vite), React Router v6, Redux Toolkit, RTK Query, Tailwind CSS, Framer Motion, Recharts, TipTap
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Winston, Morgan
- **Storage/Cache**: Upstash Redis, Cloudinary
- **Testing/CI**: Jest, Supertest, Vitest, Playwright, GitHub Actions

## Installation Guide

### Prerequisites
- Node.js (v18 or v20)
- MongoDB Database (Atlas recommended)
- Upstash Redis instance
- Cloudinary account

### 1. Backend Setup
1. Navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials:
   - `MONGO_URI`
   - `REDIS_URI`
   - `JWT_SECRET`
4. Start the server: `npm run dev` (Runs on port 5000)

### 2. Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and verify API URL (`VITE_API_URL=http://localhost:5000/api`)
4. Start the dev server: `npm run dev`

## Architecture Highlights
- **Security**: Implements Helmet, Express Rate Limit, Express Slow Down, HPP protection, and Mongo Sanitize.
- **State Management**: Fully utilizes RTK Query for caching and invalidation of API data.
- **Search**: Advanced fuzzy search pipelines built for MongoDB Atlas Search.
- **CMS**: Full Admin and Super Admin dashboard with TipTap integration and Recharts analytics.

## Deployment
This project is configured with GitHub Actions. It is ready to be deployed:
- Frontend -> Vercel/Netlify
- Backend -> Railway/Render
