const express = require("express");
const bodyParser = require("body-parser");

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

const Promotions = require("../models/promotions");
let authenticate = require("../authenticate");

promoRouter
  .route("/")
  .get((req, res, next) => {
    Promotions.find({})
      .then(
        (promos) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promos);
        },
        (err) => next(err)
      )
      .catch((err) => {
        next(err);
      });
  })
  .post(
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      Promotions.create(req.body)
        .then(
          (promo) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(promo);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      res.statusCode = 403;
      res.end("put not supported for /promotions");
    }
  )
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      Promotions.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

promoRouter
  .route("/:promoId")
  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        "POST operation not supported on /promotions/" + req.params.promoId
      );
    }
  )
  .put(
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      Promotions.findByIdAndUpdate(
        req.params.promoId,
        { $set: req.body },
        { new: true }
      )
        .then(
          (promo) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(promo);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      Promotions.findByIdAndRemove(req.params.promoId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = promoRouter;
