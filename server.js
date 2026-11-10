
// ============================================================
// 108IGHT — LOCAL DEVELOPMENT SERVER
// ============================================================

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const root = __dirname;
const pages = path.join(root, "pages");

// ============================================================
// HOMEPAGE
// ============================================================

app.get(["/", "/108ight", "/108ight/"], (req, res) => {
    res.sendFile(path.join(root, "index.html"));
});

// ============================================================
// GALLERY
// ============================================================

app.get([
    "/gallery",
    "/gallery/",
    "/gallery.html",
    "/108ight/gallery",
    "/108ight/gallery/",
    "/108ight/gallery.html"
], (req, res) => {
    res.sendFile(path.join(pages, "gallery.html"));
});

// ============================================================
// AUTHENTICATION PAGES
// ============================================================

const pageRoutes = [
    "login",
    "signup",
    "forgot-password",
    "reset-password",
    "account"
];

pageRoutes.forEach((page) => {
    app.get([
        `/${page}`,
        `/${page}/`,
        `/${page}.html`,
        `/108ight/${page}`,
        `/108ight/${page}/`,
        `/108ight/${page}.html`
    ], (req, res) => {
        res.sendFile(path.join(pages, `${page}.html`));
    });
});

// ============================================================
// STATIC FILES
// ============================================================

app.use("/108ight", express.static(root));
app.use(express.static(root));

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
    res.status(404).sendFile(path.join(pages, "404.html"));
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(`108IGHT is running at http://127.0.0.1:${PORT}/108ight/`);
});
