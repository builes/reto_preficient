import express from "express";
import cors from "cors";
import { sequelize } from './config/database.config.js';

import { router as resourceRoutes } from "./routes/resource.routes.js";
import { startResourceMonitoringCron, startHistoryCleanupCron } from './cron/resource.cron.js';

/**
 * Clase principal del servidor
 * Configura Express, base de datos, middlewares, rutas y cron jobs
 */
export class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;

    // Definición de rutas base de la API
    this.paths = {
      resources: "/api/resources",
    };

    // Inicializar componentes en orden
    this.databaseInit();
    this.middlewares();
    this.routes();
    this.listen();
  }

  /**
   * Inicializa la conexión a la base de datos
   * y arranca los cron jobs una vez conectado
   */
  async databaseInit() {
    try {
      await sequelize.authenticate();
      console.log('[DB] Database connection successful');
      
      this.startCronJobs();
    } catch (error) {
      console.error('[DB] Error connecting to database', error);
      throw error;
    }
  }

  /**
   * Inicia las tareas programadas (cron jobs)
   * - Monitoreo cada minuto: registra estado de recursos
   * - Limpieza diaria: elimina registros antiguos
   */
  startCronJobs() {
    console.log('[CRON] Iniciando cron jobs...');
    
    startResourceMonitoringCron();
    startHistoryCleanupCron();
    
    console.log('[CRON] Todos los cron jobs iniciados correctamente');
  }

  /**
   * Registra las rutas de la aplicación
   */
  routes() {
    this.app.use(this.paths.resources, resourceRoutes);
  }

  /**
   * Configura middlewares de Express
   * - CORS: permite peticiones desde cualquier origen
   * - express.json(): parsea el body de las peticiones JSON
   */
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  /**
   * Inicia el servidor HTTP en el puerto configurado
   */
  listen() {
    try {
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error(`[Server] Error starting server`, error);
      throw error;
    }
  }
}


