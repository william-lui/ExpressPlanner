const express = require("express");
const cors = require("cors");
const app = express();

const whiteList = ["http://localhost:3000", "https://localhost:3443"];
let corsOptionsDelegate = (req, callback) => {
  let options;
  if (whiteList.indexOf(req.header("Origin")) !== -1) {
    options = { origin: true };
  } else {
    options = { origin: false };
  }
  callback(null, options);
};

exports.cors = cors();
exports.corsWithOption = cors(corsOptionsDelegate);
