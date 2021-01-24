const express = require("express");
const bodyParser = require("body-parser");

const authenticate = require("../authenticate");

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());
const cors = require("./cors");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpeg|jpg|png|gif)$/)) {
    cb(new Error("File Format Not supported"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

uploadRouter
  .route("/")
  .options(cors.corsWithOption, (req, res) => {
    res.sendStatus(200);
  })
  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      res.statusCode = 403;
      res.end("get operation not supported on /imageUpload/");
    }
  )
  .post(
    cors.corsWithOption,
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    upload.single("imageFile"),
    (req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(req.file);
    }
  )
  .put(
    cors.corsWithOption,
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      res.statusCode = 403;
      res.end("put operation not supported on /imageUpload/");
    }
  )
  .delete(
    cors.corsWithOption,
    authenticate.verifyUser,
    authenticate.verifyAdmin(),
    (req, res, next) => {
      res.statusCode = 403;
      res.end("delete operation not supported on /imageUpload/");
    }
  );

module.exports = uploadRouter;
