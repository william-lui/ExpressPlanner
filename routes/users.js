var express = require("express");
var router = express.Router();

const bodyParser = require("body-parser");
var User = require("../models/user");

var passport = require("passport");
var authenticate = require("../authenticate");
router.use(bodyParser.json());
/* GET users listing. */

router
  .route("/")
  .get(
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      User.find({}).then((users) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      });
    }
  );

router.route("/signup").post((req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("content-type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstName) {
          user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
          user.lastName = req.body.lastName;
        }

        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.json({ err: err });
          } else {
            passport.authenticate("local")(req, res, () => {
              res.statusCode = 200;
              res.setHeader("content-type", "application/json");
              res.json({ success: true, status: "Registration Successful" });
            });
          }
        });
      }
    }
  );
});

router.route("/login").post(passport.authenticate("local"), (req, res) => {
  let token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "applicaiton/json");
  res.json({ success: true, token: token, status: "You successfully login" });
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
