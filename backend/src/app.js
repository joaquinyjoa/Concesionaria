//configuracion express y middleware global

const express = require("express");
const app = express;
const routes = require("./routes");

app.use(express.json());
app.use("/concecionaria",routes);

module.exports = app;
