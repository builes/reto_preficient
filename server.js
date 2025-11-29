import express from "express";
import cors from "cors";

// Importar rutas
import resourcesRoutes from "./routes/resources.routes.js";

export class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    //Nombres de las rutas
    this.paths = {
      resources: "/api/resources",
    };

    // Middleware, son funciones que se ejecutan antes de llegar a un endpoint
    this.middlewares();

    // Rutas de la aplicación
    this.routes();

    // Iniciar el servidor
    this.listen();
  }

  routes() {
    this.app.use(this.paths.resources, resourcesRoutes);
  }

  middlewares() {
    // CORS sirve para permitir el acceso a la API desde otros dominios
    this.app.use(cors());

    //Asi decimos que vamos a recibir datos en formato JSON cuando envian datos al servidor por el body
    this.app.use(express.json());
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}
