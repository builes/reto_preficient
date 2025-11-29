import { Router } from 'express';
import {
  getAllResourcesController,
  getResourcesByCategoryController,
  getResourceByIdController,
  updateResourceQuantityController,
  getCriticalResourcesController
} from '../controllers/resource.controller.js';

export const router = Router();

/**
 * Rutas de la API de recursos
 * Orden importante: rutas más específicas primero para evitar conflictos
 */

// Obtener todos los recursos con niveles aplicados
router.get('/', getAllResourcesController);

// Obtener recursos en estado crítico (alertas)
router.get('/alerts', getCriticalResourcesController);

// Filtrar recursos por categoría (oxygen/water/food/spare_parts)
router.get('/category/:category', getResourcesByCategoryController);

// Obtener un recurso específico por ID
router.get('/:id', getResourceByIdController);

// Actualizar la cantidad de un recurso (body: {quantity: number})
router.put('/:id/update-quantity', updateResourceQuantityController);
