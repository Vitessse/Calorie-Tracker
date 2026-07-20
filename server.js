require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const connectDB = require("./src/config/db");
const requireAuth = require("./src/middleware/auth.middleware");
const User = require("./src/models/user.model");
const Meal = require("./src/models/meal.model");

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World! Calorie Tracker API is running.");
});

app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "API is healthy" });
});

// ---------- AUTH ROUTES ----------

app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const newUser = await User.create({ email, password });

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ error: "Failed to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// ---------- MEAL ROUTES (protected) ----------

app.post("/api/meals", requireAuth, async (req, res) => {
  const { name, calories } = req.body;

  if (!name || !calories) {
    return res.status(400).json({ error: "name and calories are required" });
  }

  try {
    const newMeal = await Meal.create({ name, calories, user: req.userId });
    res.status(201).json(newMeal);
  } catch (error) {
    console.error("Error saving meal:", error.message);
    res.status(500).json({ error: "Failed to save meal" });
  }
});

app.get("/api/meals", requireAuth, async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error.message);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

app.delete("/api/meals/:id", requireAuth, async (req, res) => {
  try {
    const deletedMeal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!deletedMeal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    res.json({ message: "Meal deleted", deletedMeal });
  } catch (error) {
    console.error("Error deleting meal:", error.message);
    res.status(500).json({ error: "Failed to delete meal" });
  }
});

app.put("/api/meals/:id", requireAuth, async (req, res) => {
  const { name, calories } = req.body;

  if (!name || !calories) {
    return res.status(400).json({ error: "name and calories are required" });
  }

  try {
    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, calories },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedMeal) {
      return res.status(404).json({ error: "Meal not found" });
    }

    res.json(updatedMeal);
  } catch (error) {
    console.error("Error updating meal:", error.message);
    res.status(500).json({ error: "Failed to update meal" });
  }
});

// ---------- AI ROUTES (Ollama) ----------

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
        raw: data.response,
      });
    }

    res.json({
      foodDescription,
      estimatedCalories,
    });
  } catch (error) {
    console.error("Ollama error:", error.message);
    res.status(500).json({ error: "Could not reach Ollama. Is it running?" });
  }
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});