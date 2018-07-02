const express = require("express");
const bodyParser = require("body-parser");

const index = require("./routes/index");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/", index);

module.exports = app;
