const express = require("express");
const router = express.Router();
const Score = require("../models/Score");

// POST - Submit Score
router.post("/", async (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid name or score" });
  }

  try {
    const newScore = new Score({ name, score });
    await newScore.save();
    res.status(201).json({ message: "Score submitted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET - Top Scores
router.get("/", async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(10);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
