const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
let jwt = require("jsonwebtoken");

let FaceBookStrategy = require("passport-facebook-token");

let config = require("./config");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, { expiresIn: 7200 });
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.facebookPassport = passport.use(
  new FaceBookStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id }).then((err, user) => {
        if (err) {
          done(err, false);
        }

        if (user == null) {
          user = new User({ username: profile.displayName });
          user.facebookId = profile.id;
          user.firstName = profile.name.givenName;
          user.lastName = profile.name.familyName;
          user.save((err, user) => {
            if (err) {
              done(err, false);
            } else {
              done(null, user);
            }
          });
        } else {
          done(null, user);
        }
      });
    }
  )
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = () => {
  return (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        console.log(user.username);
        if (user.admin) {
          next();
        } else {
          let err = new Error(
            "You are not authorized to perform this operation!"
          );
          err.status = 403;
          next(err);
        }
      })
      .catch((err) => next(err));
  };
};
