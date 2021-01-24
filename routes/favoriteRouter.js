const express = require("express");
const bodyParser = require("body-parser");

const Favorites = require("../models/favorites");
const cors = require("./cors");
const authenticate = require("../authenticate");
const ObjectId = require("mongoose").Types.ObjectId;

favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

const addDishesToFavorite = (dishes, favorite) => {
  dishes.forEach((dish) => {
    if (
      favorite.dishes.filter((el) => {
        return el.dish == dish._id;
      }).length == 0
    ) {
      favorite.dishes.push({ dish: dish._id });
    }
  });

  return favorite.save();
};

favoriteRouter
  .route("/")
  .options(cors.corsWithOption, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: ObjectId(req.user._id) })
      .populate("user")
      .populate("dishes.dish")
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: ObjectId(req.user._id) })
      .then(
        (favorite) => {
          if (favorite == null) {
            Favorites.create({ user: req.user._id })
              .then(
                (fav) => {
                  addDishesToFavorite(req.body, fav)
                    .then(
                      (fav) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(fav);
                      },
                      (err) => next(err)
                    )
                    .catch((err) => next(err));
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            addDishesToFavorite(req.body, favorite)
              .then(
                (fav) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(fav);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },

        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("put not supported for " + "/favorites");
  })
  .delete(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({ user: ObjectId(req.user._id) })
      .then(
        (fav) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(fav);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOption, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("get not supported for " + "/favorites/" + req.params.dishId);
  })
  .post(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: ObjectId(req.user._id) })
      .then(
        (favorite) => {
          if (favorite == null) {
            let err = new Error("Favorite does not exist");
            err.status = 404;
            return next(err);
          } else {
            addDishesToFavorite([{ _id: req.params.dishId }], favorite)
              .then(
                (fav) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(fav);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("put not supported for " + "/favorites");
  })
  .delete(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: ObjectId(req.user._id) })
      .then(
        (favorite) => {
          if (favorite == null) {
            let err = new Error("Favorite does not exist");
            err.status = 404;
            return next(err);
          } else {
            favorite.dishes.splice(
              favorite.dishes.filter((el) => {
                return el.dish == req.params.dishId;
              })[0],
              1
            );

            favorite
              .save()
              .then(
                (fav) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(fav);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
