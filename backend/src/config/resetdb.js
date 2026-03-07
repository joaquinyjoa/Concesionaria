// src/config/resetDb.js
const pool = require('./database');

(async () => {
    const client = await pool.connect();
    try {
        await client.query('DROP TABLE IF EXISTS vehiculos CASCADE');
        console.log('Tabla borrada ✅');
    } catch (error) {
        console.error(error);
    } finally {
        client.release();
        process.exit();
    }
})();