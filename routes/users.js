var express = require("express");
var router = express.Router();

const bodyParser = require("body-parser");
var User = require("../models/user");

router.use(bodyParser.json());
/* GET users listing. */

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.route("/signup").post((req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user != null) {
        let err = new Error("User " + req.body.username + " already exists!");
        err.status = 403;
        next(err);
      } else {
        User.create({
          username: req.body.username,
          password: req.body.password,
        }).then((user) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ status: "Registration Successful", user: user });
        });
      }
    })
    .catch((err) => next(err));
});

router.route("/login").post((req, res, next) => {
  if (!req.session.user) {
    let authHeader = req.headers.authorization;

    if (!authHeader) {
      let err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      return next(err);
    }

    let auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");

    let username = auth[0];
    let password = auth[1];

    User.findOne({ username: username })
      .then((user) => {
        if (user === null) {
          let err = new Error("User " + username + " does not exists");
          err.status = 401;
          next(err);
        } else if (user.password !== password) {
          let err = new Error("Incorrect password");
          err.status = 401;
          next(err);
        } else {
          req.session.user = "authenticated";
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("you are autenticated");
        }
      })
      .catch((err) => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You are already autenticated");
  }
});

router.route("/logout").get((req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    let err = new Error("You are not logged in!");
    err.status = 401;
    next(err);
  }
});

module.exports = router;
