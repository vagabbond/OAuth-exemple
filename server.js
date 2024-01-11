const https = require("https");
const fs = require("fs");
const path = require("path");

const helmet = require("helmet");
const express = require("express");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

require("dotenv").config();

const app = express();

const options = {
 key: fs.readFileSync("key.pem"),
 cert: fs.readFileSync("cert.pem"),
};

const config = {
 CLIENT_ID: process.env.CLIENT_ID,
 CLIENT_SECRET: process.env.CLIENT_SECRET,
 COOKIE_KEY_1: process.env.COOKIE_KEY_1,
 COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
 callbackURL: "/auth/google/callback",
 clientID: config.CLIENT_ID,
 clientSecret: config.CLIENT_SECRET,
};
const checkLoggedIn = (req, res, next) => {
 console.log(req.user);
 const isLoggedIn = req.isAuthenticated() && req.user;
 isLoggedIn ? next() : res.status(401).send("Not logged in!");
};
const verifyCallback = (accessToken, refreshToken, profile, done) => {
 done(null, profile);
};

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
passport.serializeUser((user, done) => {
 done(null, user.id);
});
passport.deserializeUser((obj, done) => {
 done(null, obj);
});
app.use(helmet());
app.use(
 cookieSession({
  name: "session",
  maxAge: 24 * 60 * 60 * 1000,
  keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
 })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
 "/auth/google",
 passport.authenticate("google", {
  scope: ["email", "profile"],
 })
);
app.get(
 "/auth/google/callback",
 passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/failure",
  session: true,
 }),
 (req, res) => {
  console.log("Authenticated!");
 }
);
app.get("/auth/logout", (req, res) => {
 req.logout();
 return res.redirect("/");
});
app.get("/failure", (req, res) => {
 res.send("Failed to authenticate..");
});
app.get("/secret", checkLoggedIn, (req, res) => {
 res.send("Your secret is 45!");
});
app.get("/", (req, res) => {
 res.sendFile(path.join(__dirname, "public", "index.html"));
});

https.createServer(options, app).listen(3000, () => {
 console.log("Listening on port 3000");
});
