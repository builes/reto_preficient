import cron from 'node-cron';
import db from '../models/index.js';

const { ResourceData, Resource, ChangeHistory } = db;

/**
 * Cron job que registra el estado actual de todos los recursos cada minuto
 * Esto permite tener un historial temporal para gráficas y análisis de tendencias
 * Se ejecuta: Cada minuto (* * * * *)
 */
export const startResourceMonitoringCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // Obtener todos los recursos con su información de categoría
      const resources = await Resource.findAll({
        include: [{
          model: ResourceData,
          as: 'resourceData',
          attributes: ['id', 'name', 'category']
        }]
      });

      if (!resources || resources.length === 0) return;

      // Crear un registro en change_history por cada recurso
      const historyPromises = resources.map(resource => {
        return ChangeHistory.create({
          stock: resource.quantity,           // Cantidad actual del recurso
          resourceId: resource.resourceDataId // ID del recurso (FK)
        });
      });

      await Promise.all(historyPromises);
      console.log(`[CRON] ${resources.length} registros creados - ${new Date().toLocaleString('es-MX')}`);
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

      // Eliminar registros antiguos
      const deleted = await ChangeHistory.destroy({
        where: {
          createdAt: {
            [db.Sequelize.Op.lt]: thirtyDaysAgo
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
