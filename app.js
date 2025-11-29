import dotenv from "dotenv";
dotenv.config();

// import { connectDB } from "./database/connect.js";
import { Server } from "./server.js";

const startApp = async () => {
  try {
    // siempre conectar a la base de datos antes de levantar el servidor
    //siempre que se hace una peticion a la BD usamos await
    // await connectDB();
    const server = new Server(); // Aquí se levanta el servidor solo si la BD está OK
  } catch (err) {
    console.error("❌ Error crítico al iniciar la app:", err);
  }
};

startApp();
