const express = require("express");
const app = express();
const router = require("./routes"); // ✅ apunta al index
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/concesionaria", router);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;