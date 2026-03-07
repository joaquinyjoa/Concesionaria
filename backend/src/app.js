//configuracion express y middleware global

const express = require("express");
const app = express();
const router = require("./routes/vehiculoRoute");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/concesionaria", router);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
