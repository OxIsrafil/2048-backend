const express = require("express");
const router = express.Router();
const Score = require("../models/Score");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// 🔐 Submit score & save to user history and global leaderboard
router.post("/", auth, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number") {
    return res.status(400).json({ error: "Invalid score format" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Push to user's score history
    user.scores.push({ score });
    await user.save();

    // Also save to global leaderboard
    const entry = new Score({ name: user.name, score });
    await entry.save();

    res.status(201).json({ message: "Score submitted successfully" });
  } catch (err) {
    console.error("❌ Error submitting score:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📊 GET top 20 leaderboard entries by best score per user
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ "scores.0": { $exists: true } });

    const leaderboard = users
      .map(u => ({
        name: u.name,
        score: Math.max(...u.scores.map(s => s.score)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json(leaderboard);
  } catch (err) {
    console.error("❌ Error loading leaderboard:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
