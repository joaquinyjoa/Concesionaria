const express = require("express");
const cors = require("cors");
const app = express();
const router = require("./routes");
const errorHandler = require('./middlewares/errorHandler');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use("/concesionaria", router);
app.use(errorHandler);

module.exports = app;