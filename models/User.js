const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
  provider: { type: String, default: "local" }, // local / google / twitter
  googleId: String,
  twitterId: String,
  avatar: { type: String, default: "" },
  scores: [
    {
      score: Number,
      date: { type: Date, default: Date.now },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
