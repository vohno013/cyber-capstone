const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const userDao = require("./user-dao.js");
const { requireAuth } = require("./auth.js");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Cookie options used for both setting and clearing the auth cookie.
// Secure = only sent over HTTPS (turn on in production)
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  secure: false, // set true in production with HTTPS
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/",
};

// --- POST /api/auth/register ---
router.post(
  "/register",
  authLimiter,
  body("username")
    .isString()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must be 3-30 chars, alphanumeric + underscore only"),
  body("password")
    .isString()
    .isLength({ min: 12, max: 128 })
    .withMessage("Password must be 12-128 characters"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    const { username, password } = req.body;
    try {
      const existing = await userDao.findUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Registration failed" });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await userDao.createUser(username, passwordHash);
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error("[register]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// --- POST /api/auth/login ---
router.post(
  "/login",
  authLimiter,
  body("username").isString().trim().isLength({ min: 1, max: 30 }),
  body("password").isString().isLength({ min: 1, max: 128 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { username, password } = req.body;
    try {
      const user = await userDao.findUserByUsername(username);
      const dummyHash = await bcrypt.hash("dummypassword", 12);
      const hashToCompare = user ? user.passwordHash : dummyHash;
      const valid = await bcrypt.compare(password, hashToCompare);

      if (!user || !valid) {
        return res.status(401).json({ error: "Incorrect username & password" });
      }

      const token = jwt.sign(
        {
          sub: user._id.toString(),
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      console.log(`[login] ${user.username} from ${req.ip}`);

      // Set the HttpOnly cookie — browser will auto-send on future requests
      res.cookie("authToken", token, COOKIE_OPTIONS);

      // Return only user info (token is in the cookie, not the body)
      res.json({
        user: { username: user.username, role: user.role },
      });
    } catch (err) {
      console.error("[login]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// --- POST /api/auth/logout ---
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  res.json({ message: "Logged out" });
});

// --- GET /api/auth/me ---
// Lets the client check "am I still logged in?" on page load
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { username: req.user.username, role: req.user.role } });
});

module.exports = router;