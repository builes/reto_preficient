import cron from 'node-cron';
import { sequelize } from '../config/database.config.js';
import ResourceData from '../models/resources.model.js';
import Resource from '../models/resource.js';
import ChangeHistory from '../models/changeHistory.js';

/**
 * Cron job que registra el estado actual de todos los recursos cada minuto
 * Esto permite tener un historial temporal para gráficas y análisis de tendencias
 * Se ejecuta: Cada minuto (* * * * *)
 * @param {Object} io - Instancia de Socket.IO para emitir eventos en tiempo real
 */
export const startResourceMonitoringCron = (io) => {
  cron.schedule('* * * * *', async () => {
    try {
      // Obtener todos los recursos sin includes
      const resources = await Resource.findAll();

      if (!resources || resources.length === 0) return;

      // Crear un registro en change_history por cada recurso
      const historyPromises = resources.map(resource => {
        return ChangeHistory.create({
          stock: resource.quantity,           // Cantidad actual del recurso
          resourceId: resource.resourceDataId // ID del recurso (FK)
        });
      });

      await Promise.all(historyPromises);
      
      const timestamp = new Date();
      console.log(`[CRON] ${resources.length} registros creados - ${timestamp.toLocaleString('es-MX')}`);
      
      // Emitir evento WebSocket a todos los clientes conectados
      if (io) {
        // Obtener ResourceData para cada recurso
        const enrichedData = await Promise.all(resources.map(async (resource) => {
          const resourceData = await ResourceData.findByPk(resource.resourceDataId);
          return {
            id: resource.id,
            name: resourceData.name,
            category: resourceData.category,
            quantity: resource.quantity,
            timestamp: timestamp.toISOString()
          };
        }));
        
        io.emit('connection', {
          resources: enrichedData,
          count: enrichedData.length,
          timestamp: timestamp.toISOString()
        });
        
        console.log('[WebSocket] Datos enviados a clientes conectados');
      }
    } catch (error) {
      console.error('[CRON] Error:', error.message);
    }
  });

  console.log('[CRON] Monitoreo iniciado (cada 1 minuto)');
};

/**
 * Cron job que limpia registros antiguos del historial
 * Elimina registros mayores a 30 días para mantener la base de datos optimizada
 * Se ejecuta: Todos los días a las 3:00 AM (0 3 * * *)
 */
export const startHistoryCleanupCron = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      // Calcular fecha hace 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Eliminar registros antiguos usando Op de Sequelize
      const { Op } = await import('sequelize');
      const deleted = await ChangeHistory.destroy({
        where: {
          createdAt: {
            [Op.lt]: thirtyDaysAgo
          }
        }
      });

      console.log(`[CRON] ${deleted} registros antiguos eliminados`);
    } catch (error) {
      console.error('[CRON] Error en limpieza:', error.message);
    }
  });

  console.log('[CRON] Limpieza automática iniciada (diario 3:00 AM)');
};

/**
 * Detiene todos los cron jobs activos
 * Útil para testing o shutdown controlado
 */
export const stopAllCronJobs = () => {
  cron.getTasks().forEach(task => task.stop());
  console.log('[CRON] Todos los cron jobs detenidos');
};
