const express = require("express");
const app = express();
const router = require("./routes"); 
const PORT = process.env.PORT || 3000;
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use("/concesionaria", router);
app.use(errorHandler); 

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


module.exports = app;