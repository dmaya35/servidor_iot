var mqtt = require("mqtt");
const mysql = require("mysql");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

//settings
app.set("port", 3030); 

//utilities
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

//routes
app.use(require("./rutas/datos.js"));
app.use(require("./rutas/usuarios.js"));

var client = mqtt.connect("mqtt://broker.mqtt-dashboard.com");

// se crea la conexión a mysql

const connection = mysql.createPool({
  connectionLimit: 500,
  host: "localhost",
  user: "root",
  password: "",
  database: "riegodeplantas",
  port: 3306,
});

client.on("connect", function () {
  client.subscribe("topico/parcial3/diego", function (err) {
    if (err) {
      console.log("Error en la subscripcion");
    } else {
      console.log("Subscrito exitosamente");
    }
  });
});

client.on("message", function (topic, message) {
  json1 = JSON.parse(message.toString());
  console.log(json1);
  let temperatura = json1.temperatura;
  let humedad_suelo = json1.valHumSuelo;
  let humedad = json1.humedad;
  let json2;
  let json3;

  if (temperatura > 34 && humedad_suelo < 50) {
    json2 = { estado_suelo: "Suelo seco, activar riego" };
  } else if (temperatura > 34 && humedad_suelo >= 50 && humedad_suelo < 85) {
    json2 = {
      estado_suelo: "Suelo con buena humedad, mantener riego bajo",
    };
  } else if (temperatura > 34 && humedad_suelo >= 85) {
    json2 = { estado_suelo: "Suelo demasiado humedo, desactivar riego" };
  }

  if (humedad >= 68) {
    json3 = { estado_humedad: "Humedad alta, activar ventilacion" };
  } else if (humedad < 68) {
    json3 = { estado_humedad: "Humedad moderada, no se necesita ventilacion" };
  }

  client.publish("topico/parcial3/diego/tempYsuelo", JSON.stringify(json2));
  client.publish("topico/parcial3/diego/humedad", JSON.stringify(json3));

  connection.getConnection(function (error, tempConn) {
    if (error) {
      console.log("Error en la conexión", error);
    } else {
      console.log("Conexión correcta.");
      tempConn.query(
        "INSERT INTO vivero (nodo, temperatura, humedad_suelo, humedad, estado_suelo, estado_humedad, fecha_hora) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [json1.nodo, temperatura, humedad_suelo, humedad, json2.estado_suelo, json3.estado_humedad],
        function (error, result) {
          if (error) {
            console.log("Error al ejecutar el query:", error);
          } else {
            console.log("Datos almacenados correctamente.");
          }
        }
      );
    }
  });
});

//start server
app.listen(app.get("port"), () => {
  console.log("Servidor funcionando");
});
