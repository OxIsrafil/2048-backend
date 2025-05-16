const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../models/User");

const BACKEND_URL = "https://two048-backend-o72a.onrender.com"; // ✅ your live backend URL

// ✅ Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "",
            googleId: profile.id,
            provider: "google",
          });
          await user.save();
        }

        done(null, user);
      } catch (err) {
        console.error("❌ Google OAuth Error:", err);
        done(err, null);
      }
    }
  )
);

// ✅ Twitter OAuth Strategy
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/twitter/callback`,
      includeEmail: true,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = await User.findOne({ twitterId: profile.id });

        if (!user) {
          user = new User({
            name: profile.displayName,
            twitterId: profile.id,
            provider: "twitter",
          });
          await user.save();
        }

        done(null, user);
      } catch (err) {
        console.error("❌ Twitter OAuth Error:", err);
        done(err, null);
      }
    }
  )
);

// ✅ Required for Passport session handling (optional for JWT auth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
