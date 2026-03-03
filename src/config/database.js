const mysql = require("mysql2/promise");
const config = require("./app");

//Creacion de Pool de conexiones centralizadas
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const executeQuery = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error(" Error en DB:", error.message);
    throw error;
  }
};

module.exports = {
  pool,
  executeQuery,
};
