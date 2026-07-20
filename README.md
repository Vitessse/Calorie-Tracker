# Calorie Tracker

A full-stack calorie tracking app with a local AI assistant for calorie estimation and nutrition Q&A — built as a hands-on learning project covering Node.js, Express, MongoDB, and local LLM integration via Ollama.

## Features

- **Log meals** — add a meal name and calorie count
- **AI calorie estimation** — describe a meal in plain language and get an estimated calorie count from a locally-running LLM (Ollama, `llama3.2`)
- **AI nutrition assistant** — ask questions about meals, swaps, or nutrition and get answers from the same local model
- **Full CRUD** — create, read, update, and delete logged meals
- **Persistent storage** — meals are saved to MongoDB Atlas and survive server restarts

## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB Atlas + Mongoose
- **AI:** Ollama (local LLM, `llama3.2`)
- **Frontend:** HTML, CSS, vanilla JavaScript (served statically by Express)
- **Environment config:** dotenv

## Getting Started

### Prerequisites
- Node.js installed
- A MongoDB Atlas cluster (or local MongoDB instance)
- [Ollama](https://ollama.com) installed and running locally, with a model pulled:
  ```bash
  ollama pull llama3.2
  ```

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/YOUR-USERNAME/Calorie-Tracker.git
   cd Calorie-Tracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   MONGODB_URI=your-mongodb-connection-string
   ```

4. Start the server
   ```bash
   npx nodemon server.js
   ```

5. Open your browser to `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/status` | Health check |
| GET | `/api/meals` | Get all logged meals |
| POST | `/api/meals` | Log a new meal (`{ name, calories }`) |
| PUT | `/api/meals/:id` | Update a meal |
| DELETE | `/api/meals/:id` | Delete a meal |
| POST | `/api/estimate-calories` | Get an AI calorie estimate from a food description |
| POST | `/api/chat` | Ask the AI nutrition assistant a question |

## Project Structure

```
├── public/
│   └── index.html       # Frontend UI
├── src/
│   ├── config/
│   │   └── db.js         # MongoDB connection
│   └── models/
│       └── meal.model.js # Mongoose schema
├── server.js              # Express app + routes
└── .env                   # Environment variables (not committed)
```

## Notes

- The AI features (calorie estimation, chat) depend on Ollama running locally on `http://localhost:11434` — they won't work if Ollama isn't installed and running.
- This project was built as a guided learning exercise, progressing from basic Node.js/Express fundamentals through database integration, CRUD APIs, and local AI integration.