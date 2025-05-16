const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yoursecret";

// 🔐 REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, provider: "local" });
    await user.save();

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔐 LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.provider !== "local") return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🙋 GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🖼️ UPDATE AVATAR
router.post("/avatar", auth, async (req, res) => {
  const { avatar } = req.body;
  if (!avatar || typeof avatar !== "string") {
    return res.status(400).json({ error: "Invalid avatar URL" });
  }

  try {
    const user = await User.findById(req.user.id);
    user.avatar = avatar;
    await user.save();
    res.json({ message: "Avatar updated", avatar });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔗 GOOGLE AUTH
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://orangedynasty2048.vercel.app/auth.html",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, name: req.user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`https://orangedynasty2048.vercel.app/auth.html?token=${token}`);
  }
);

// 🔗 TWITTER (X) AUTH
router.get("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "https://orangedynasty2048.vercel.app/auth.html",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, name: req.user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`https://orangedynasty2048.vercel.app/auth.html?token=${token}`);
  }
);

module.exports = router;
