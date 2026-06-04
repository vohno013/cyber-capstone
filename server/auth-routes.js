const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const userDao = require("./user-dao.js");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

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

      const dummyHash =
        "$2a$12$CwTycUXWue0Thq9StjUM0uJ8.cKvqEXAMPLEDUMMYHASH..ABCDEF.";
      const hashToCompare = user ? user.passwordHash : dummyHash;
      const valid = await bcrypt.compare(password, hashToCompare);

      if (!user || !valid) {
        return res.status(401).json({ error: "Invalid credentials" });
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

      res.json({
        token,
        user: { username: user.username, role: user.role },
      });
    } catch (err) {
      console.error("[login]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;