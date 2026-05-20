# Smart Nutrition Tracker

A MERN stack nutrition tracker that lets users scan barcodes or search foods manually, then log calories, protein, fats, and carbs into MongoDB.

## Features
- JWT authentication
- Barcode lookup with Open Food Facts
- Meal search with USDA FoodData Central
- Meal logging, history, and daily totals
- React dashboard and barcode scanner UI

## Project Structure
- `backend/` - Express API, MongoDB models, auth, food search, and meal logging
- `frontend/` - React app with dashboard, scanner, search, history, and profile pages

## Environment Variables
Create these files before running the app:

### `backend/.env`
- `PORT=5000`
- `MONGODB_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
- `CLIENT_URL=http://localhost:5173`
- `FOODDATA_CENTRAL_API_KEY=your_usda_api_key`

### `frontend/.env`
- `VITE_API_URL=http://localhost:5000`

## Install and Run
From the `BITE` folder:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

Run the API:

```bash
cd backend && npm run dev
```

Run the frontend:

```bash
cd frontend && npm run dev
```

## API Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/food/search?query=chicken`
- `GET /api/food/barcode/:barcode`
- `POST /api/meals`
- `GET /api/meals/today`
- `GET /api/meals/history`
- `DELETE /api/meals/:id`

Smart Nutrition Tracker is a MERN stack health application that helps users automatically track their daily food intake. Users can scan a barcode or search for a meal manually. The app fetches nutrition data from external food databases and logs calories, protein, fats, and carbohydrates. MongoDB stores user profiles and meal history, while React provides an interactive dashboard for daily nutrition tracking.
