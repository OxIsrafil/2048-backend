const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    default: "" // only required for local users
  },

  provider: {
    type: String,
    enum: ["local", "google", "twitter"],
    default: "local"
  },

  googleId: {
    type: String,
    default: null
  },

  twitterId: {
    type: String,
    default: null
  },

  avatar: {
    type: String,
    default: ""
  },

  scores: [
    {
      score: {
        type: Number,
        required: true
      },
  
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  bestScore: {
  type: Number,
  default: 0
},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
