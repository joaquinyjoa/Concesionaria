//punto de entrada
const fs = require('fs')
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});