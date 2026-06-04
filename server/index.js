require("dotenv").config();
var express = require("express");
var helmet = require("helmet");
var mongoSanitize = require("express-mongo-sanitize");
var dao = require("./mongo-dao.js");
var authRoutes = require("./auth-routes.js");
var { requireAuth } = require("./auth.js");
var app = express();

// --- Security headers (Helmet) ---
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// Parse JSON body with size limit (defends against memory-exhaustion DoS)
app.use(express.json({ limit: "10kb" }));

// Strip MongoDB operators ($, .) from incoming object keys
app.use(mongoSanitize());

// --- PUBLIC routes (no auth required) ---
app.use("/api/auth", authRoutes);

// --- PROTECTED routes — everything below /api requires a valid JWT ---
app.use("/api", requireAuth);

// (Existing SWAPI routes — now protected by the requireAuth middleware above)
app.get("/api/characters", (req, res) => {
  dao.findAllCharacters((err, characters) => {
    if (err) {
      console.error("[characters]", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!characters) return res.status(404).json({ error: "Not found" });
    res.json(characters);
  });
});

app.get("/api/planets", (req, res) => {
  dao.findAllPlanets((err, planets) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!planets) return res.status(404).json({ error: "Not found" });
    res.json(planets);
  });
});

app.get("/api/films", (req, res) => {
  dao.findAllFilms((err, films) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!films) return res.status(404).json({ error: "Not found" });
    res.json(films);
  });
});

app.get("/api/characters/:id", (req, res) => {
  dao.findCharacter(req.params.id, (err, character) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!character) return res.status(404).json({ error: "Not found" });
    res.json(character);
  });
});

app.get("/api/films/:id", (req, res) => {
  dao.findFilm(req.params.id, (err, film) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!film) return res.status(404).json({ error: "Not found" });
    res.json(film);
  });
});

app.get("/api/planets/:id", (req, res) => {
  dao.findPlanet(req.params.id, (err, planet) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!planet) return res.status(404).json({ error: "Not found" });
    res.json(planet);
  });
});

app.get("/api/films/:id/characters", (req, res) => {
  dao.findCharactersByFilm(req.params.id, (err, characters) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!characters) return res.status(404).json({ error: "Not found" });
    res.json(characters);
  });
});

app.get("/api/films/:id/planets", (req, res) => {
  dao.findPlanetsByFilm(req.params.id, (err, planets) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!planets) return res.status(404).json({ error: "Not found" });
    res.json(planets);
  });
});

app.get("/api/characters/:id/films", (req, res) => {
  dao.findFilmsByCharacter(req.params.id, (err, films) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!films) return res.status(404).json({ error: "Not found" });
    res.json(films);
  });
});

app.get("/api/planets/:id/films", (req, res) => {
  dao.findFilmsByPlanet(req.params.id, (err, films) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!films) return res.status(404).json({ error: "Not found" });
    res.json(films);
  });
});

app.get("/api/planets/:id/characters", (req, res) => {
  dao.findCharactersByPlanet(req.params.id, (err, characters) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!characters) return res.status(404).json({ error: "Not found" });
    res.json(characters);
  });
});

// Static files (no auth — needed to serve the login page itself if you ever
// build React to the public folder)
app.use(
  express.static("./public", {
    dotfiles: "deny", // block .env, .git, etc.
  })
);

// Global error handler — never leak stack traces
app.use((err, req, res, next) => {
  console.error("[Unhandled]", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(
    `Open a browser to http://localhost:${port} to view the application`
  );
});