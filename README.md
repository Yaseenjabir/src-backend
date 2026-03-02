# SRC Simple Record Backend (MongoDB + TypeScript)

## Quick start

1. Copy `.env.example` to `.env` and update `MONGODB_URI`.
2. Install dependencies:
   - `npm install`
3. Run development server:
   - `npm run dev`
4. Type-check build:
   - `npm run build`

Server runs on `http://localhost:5000` by default.

## Current endpoints

- `GET /api/v1/health`
- `GET /api/v1/products/categories`
- `GET /api/v1/products`
- `POST /api/v1/products`
  
## Notes

- Money fields are integer-only (for example: `300`, not `300.00`).
- Product `category` uses enum values from `src/constants/productCategories.ts`.
