const express = require("express");
const router = express.Router();
const Score = require("../models/Score");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// 🔐 Submit score & save in user history
router.post("/", auth, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number") {
    return res.status(400).json({ error: "Invalid score" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Add to user's game history
    user.scores.push({ score });
    await user.save();

    // Also store in Score model (for global leaderboard)
    const newScore = new Score({ name: user.name, score });
    await newScore.save();

    res.status(201).json({ message: "Score saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📊 Public leaderboard (top 20 by highest user score)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ "scores.0": { $exists: true } });

    const topUsers = users
      .map(u => ({
        name: u.name,
        score: Math.max(...u.scores.map(s => s.score)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
