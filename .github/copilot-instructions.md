# Project Guidelines

## Code Style
- Backend uses Node.js ES modules ("type": "module"); keep imports with explicit .js extensions.
- Frontend is React 18 with Vite and Tailwind; follow existing component patterns in src/components/ and pages.

## Architecture
- Backend: Express routes in backend/routes, middleware in backend/middleware, Mongoose models in backend/models.
- Frontend: React Router app in frontend/src/App.jsx, API calls centralized in frontend/src/services/api.js.

## Build and Test
- Backend (from backend/): npm run dev | npm start | npm test | npm run lint | npm run seed
- Frontend (from frontend/): npm run dev | npm run build | npm run test | npm run lint

## Conventions
- API base URL comes from VITE_API_URL; default in frontend is http://localhost:5002/api but backend defaults to port 5000. Set VITE_API_URL to avoid mismatch.
- Backend CORS origin is FRONTEND_URL with fallback http://localhost:5173.
- MongoDB connection uses MONGODB_URI; ensure .env is set before running backend.
