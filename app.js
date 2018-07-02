const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const index = require("./routes/index");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/", index);

module.exports = app;
