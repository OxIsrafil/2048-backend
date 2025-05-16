const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// 🔐 Submit score & update bestScore if higher
router.post("/", auth, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number" || score <= 0) {
    return res.status(400).json({ error: "Invalid score" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Save full score history
    user.scores.push({ score });

    // Update bestScore if higher
    if (score > user.bestScore) {
      user.bestScore = score;
    }

    await user.save();

    res.status(201).json({ message: "Score submitted", bestScore: user.bestScore });
  } catch (err) {
    console.error("❌ Error submitting score:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📊 GET leaderboard sorted by bestScore
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ bestScore: { $gt: 0 } });

    const leaderboard = users
      .map(user => ({
        name: user.name,
        score: user.bestScore
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
