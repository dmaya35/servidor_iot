const { Router } = require("express");
const router = Router();
const mysql = require("mysql");
// Conexión para MySQL
const connection = mysql.createPool({
  connectionLimit: 500,
  host: "localhost",
  user: "root",
  password: "", 
  database: "usuarios",
  port: 3306,
});

connection.on("error", function (err) {
  console.log("[mysql error]", err);
});
//Metodo GET para TODOS LOS USUARIOS
router.get("/usuarios", (req, res) => {
  var json1 = {};
  var arreglo = [];
  connection.getConnection(function (error, tempConn) {
    if (error) {
      throw error;
    } else {
      console.log("Conexion correcta.");
      tempConn.query("SELECT * FROM usuarios", function (error, result) {
        var resultado = result;
        if (error) {
          throw error;
        } else {
          tempConn.release();
          for (i = 0; i < resultado.length; i++) {
            json1 = {
              username: resultado[i].username,
              password: resultado[i].password,
              nodo: resultado[i].nodo,
              rol: resultado[i].rol,
            };
            arreglo.push(json1);
          }
          res.json(arreglo);
        }
      });
    }
  });
});

module.exports = router;
