import dotenv from "dotenv";
dotenv.config();
import { sequelize } from "./src/config/database.config.js";
import { Server } from "./src/server.js";

let databaseInit = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Database connection successful')

    await sequelize.sync({ alter: true });
    console.log('[DB] Models synchronized')
  } catch (error) {
    console.log('[DB] Error connecting to database', error)
    throw error;
  }
}

const startApp = async () => {
  try {
    await databaseInit();
    const server = new Server(); // Aquí se levanta el servidor solo si la BD está OK
  } catch (err) {
    console.error("Error crítico al iniciar la app:", err);
  }
};

startApp();
