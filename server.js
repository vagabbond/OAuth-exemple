const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const helmet = require("helmet");

const app = express();

const options = {
 key: fs.readFileSync("key.pem"),
 cert: fs.readFileSync("cert.pem"),
};

app.use(helmet());

app.get("/", (req, res) => {
 res.sendFile(path.join(__dirname, "public", "index.html"));
});

https.createServer(options, app).listen(3000, () => {
 console.log("Listening on port 3000");
});
