require("dotenv").config();
var express = require("express");
var helmet = require("helmet");
var cookieParser = require("cookie-parser");
var mongoSanitize = require("express-mongo-sanitize");
var dao = require("./mongo-dao.js");
var authRoutes = require("./auth-routes.js");
var { requireAuth } = require("./auth.js");
var app = express();

app.set("trust proxy", 1);

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

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());

// --- PUBLIC routes ---
app.use("/api/auth", authRoutes);

// --- PROTECTED routes ---
app.use("/api", requireAuth);

app.get("/api/characters", (req, res) => {
  dao.findAllCharacters((err, characters) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
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

app.use(express.static("./public", { dotfiles: "deny" }));

app.use((err, req, res, next) => {
  console.error("[Unhandled]", err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Open a browser to http://localhost:${port} to view the application`);
});