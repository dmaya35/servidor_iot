const { Router } = require("express");
const router = Router();
const mysql = require("mysql");
const moment = require("moment"); // Importar moment.js

// Se crea la conexión a MySQL
const connection = mysql.createPool({
  connectionLimit: 500,
  host: "localhost",
  user: "root",
  password: "",
  database: "riegodeplantas",
  port: 3306,
});

// Ruta para obtener todos los datos
router.get("/datos", (req, res) => {
  connection.getConnection(function (error, tempConn) {
    if (error) {
      console.error("Error en la conexión a MySQL:", error);
      res.status(500).send("Error en la conexión a MySQL");
    } else {
      console.log("Conexión a MySQL correcta.");

      // Consulta para obtener todos los datos
      var query = `SELECT * FROM vivero ORDER BY id;`;

      tempConn.query(query, function (error, result) {
        if (error) {
          console.error("Error al ejecutar la consulta:", error);
          res.status(500).send("Error al ejecutar la consulta");
        } else {
          console.log("Consulta ejecutada correctamente:", result);
          // Formatear la fecha y hora de cada registro
          result.forEach((item) => {
            item.fecha_hora = moment(item.fecha_hora).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          });
          res.json(result); // Enviar el resultado como respuesta JSON
        }
        tempConn.release(); // Liberar la conexión
      });
    }
  });
});

// Ruta para obtener datos por ID
router.get("/datos/:nodo", (req, res) => {
  const nodo = req.params.nodo;
  connection.getConnection(function (error, tempConn) {
    if (error) {
      console.error("Error en la conexión a MySQL:", error);
      res.status(500).send("Error en la conexión a MySQL");
    } else {
      console.log("Conexión a MySQL correcta.");

      // Consulta para obtener los datos por id
      var query = `SELECT * FROM vivero WHERE nodo = ?;`;

      tempConn.query(query, [nodo], function (error, result) {
        if (error) {
          console.error("Error al ejecutar la consulta:", error);
          res.status(500).send("Error al ejecutar la consulta");
        } else {
          console.log("Consulta ejecutada correctamente:", result);
          // Formatear la fecha y hora de cada registro
          result.forEach((item) => {
            item.fecha_hora = moment(item.fecha_hora).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          });
          res.json(result); // Enviar el resultado como respuesta JSON
        }
        tempConn.release(); // Liberar la conexión
      });
    }
  });
});

module.exports = router;
