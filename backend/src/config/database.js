const sqlite3 = require('sqlite3').verbose();
const {open} = require('sqlite');

//crea la base de datos si no esxiste o se conecta a ella si ya existe, devuelve 
// una promesa con la conexión a la base de datos
async function openDb() {
    return open({
        filename: './database.db',
        driver: sqlite3.Database
    });
}


module.exports = openDb;