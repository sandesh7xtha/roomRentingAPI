const mysql = require("mysql");
const dbConfig = require("../config/db.config");
//MySql database connection
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  multipleStatements: true,
});
// open the MySQL connection
connection.connect((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database." + dbConfig.DB);
});
module.exports = connection;
