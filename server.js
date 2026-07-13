const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! Calorie Tracker API is running.");
});

app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "API is healthy" });
});

// Temporary in-memory storage
const meals = [];

app.post("/api/meals", (req, res) => {
  const { name, calories } = req.body;

  if (!name || !calories) {
    return res.status(400).json({ error: "name and calories are required" });
  }

  const newMeal = { id: meals.length + 1, name, calories };
  meals.push(newMeal);

  res.status(201).json(newMeal);
});

app.get("/api/meals", (req, res) => {
  res.json(meals);
});

app.post("/api/estimate-calories", async (req, res) => {
  const { foodDescription } = req.body;

  if (!foodDescription) {
    return res.status(400).json({ error: "foodDescription is required" });
  }

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: `Estimate the total calories for this meal: "${foodDescription}". Respond with ONLY a number, no words, no units, no explanation.`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    const estimatedCalories = parseInt(data.response.trim(), 10);

    if (isNaN(estimatedCalories)) {
      return res.status(502).json({ 
        error: "Could not parse calorie estimate", 
        raw: data.response 
      });
    }

    res.json({ 
      foodDescription, 
      estimatedCalories 
    });

  } catch (error) {
    console.error("Ollama error:", error.message);
    res.status(500).json({ error: "Could not reach Ollama. Is it running?" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: `You are a helpful nutrition assistant for a calorie tracking app. Answer briefly and helpfully. User: ${message}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    res.json({ reply: data.response.trim() });

  } catch (error) {
    console.error("Ollama error:", error.message);
    res.status(500).json({ error: "Could not reach Ollama. Is it running?" });
  }
});