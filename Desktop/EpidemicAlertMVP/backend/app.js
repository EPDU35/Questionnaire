require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes    = require("./routes/auth.routes");
const reportRoutes  = require("./routes/report.routes");
const mapRoutes     = require("./routes/map.routes");
const adminRoutes   = require("./routes/admin.routes");
const citizenRoutes = require("./routes/citizen.routes");
const iaRoutes      = require("./routes/ia.routes");
const centerRoutes  = require("./routes/center.routes");
const { router: pushRoutes } = require("./routes/push.routes");

const app = express();

app.use(cors({ origin: "*", methods: ["GET","POST","PATCH","DELETE"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use("/api/auth",          authRoutes);
app.use("/api/cases",         reportRoutes);
app.use("/api/alerts",        mapRoutes);
app.use("/api/stats",         adminRoutes);
app.use("/api/notifications",  citizenRoutes);
app.use("/api/ia",            iaRoutes);
app.use("/api/center",        centerRoutes);
app.use("/api/push",          pushRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", app: "Babi Alert", version: "1.0.0" }));

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ message: "Route introuvable." });
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erreur interne du serveur." });
});

module.exports = app;

function protegerRoute() {
    const pagesPubliques = ['/auth/login.html', '/auth/register.html', '/index.html', '/'];
    const chemin = window.location.pathname;
    const estPublique = pagesPubliques.some(p => chemin.endsWith(p));
    
    if (!estPublique && !getToken()) {
        window.location.href = '/auth/login.html';
    }
}

// Appel automatique à chaque chargement de page
protegerRoute();