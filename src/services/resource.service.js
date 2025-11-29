// Business logic for resource management with dynamic level application

import db from '../models/index.js';
import { RESOURCE_LEVELS, getLevelsByCategory, isResourceCritical } from '../constants/resource.constants.js';

const { ResourceData, Resource, ChangeHistory } = db;

// Get all resources with dynamically applied levels from constants
export const getAllResourcesService = async () => {
  const resources = await Resource.findAll({
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  // Aplicar niveles estándar basados en la categoría
  return resources.map(resource => {
    const category = resource.resourceData.category;
    const levels = getLevelsByCategory(category);
    
    return {
      ...resource.toJSON(),
      minimumLevel: levels.minimumLevel,
      criticalLevel: levels.criticalLevel,
      maximumLevel: levels.maximumLevel,
      unit: levels.unit
    };
  });
};

// Filter resources by category and apply standard levels
export const getResourcesByCategoryService = async (category) => {
  const validCategories = ['food', 'oxygen', 'water', 'spare_parts'];
  if (!validCategories.includes(category)) {
    return 'INVALID_CATEGORY';
  }

  const resources = await Resource.findAll({
    include: [{
      model: ResourceData,
      as: 'resourceData',
      where: { category },
      attributes: ['id', 'name', 'category']
    }]
  });

  // Aplicar niveles estándar basados en la categoría
  const levels = getLevelsByCategory(category);
  return resources.map(resource => ({
    ...resource.toJSON(),
    minimumLevel: levels.minimumLevel,
    criticalLevel: levels.criticalLevel,
    maximumLevel: levels.maximumLevel,
    unit: levels.unit
  }));
};

// Get single resource by ID with applied levels
export const getResourceByIdService = async (id) => {
  const resource = await Resource.findByPk(id, {
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  if (!resource) {
    return null;
  }

  // Aplicar niveles estándar basados en la categoría
  const category = resource.resourceData.category;
  const levels = getLevelsByCategory(category);
  
  return {
    ...resource.toJSON(),
    minimumLevel: levels.minimumLevel,
    criticalLevel: levels.criticalLevel,
    maximumLevel: levels.maximumLevel,
    unit: levels.unit
  };
};

// Update resource quantity and log to history (uses transaction for consistency)
export const updateResourceQuantityService = async (id, quantity) => {
  if (!quantity || quantity < 0) {
    return 'INVALID_QUANTITY';
  }

  const resource = await Resource.findByPk(id);
  if (!resource) {
    return 'RESOURCE_NOT_FOUND';
  }

  const transaction = await db.sequelize.transaction();
  
  try {
    resource.quantity = quantity;
    await resource.save({ transaction });

    await ChangeHistory.create({
      stock: quantity,
      resourceId: resource.resourceDataId
    }, { transaction });

    await transaction.commit();
    return resource;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get resources at or below critical levels (defined in constants)
export const getCriticalResourcesService = async () => {
  const allResources = await Resource.findAll({
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  // Filtrar recursos críticos basados en niveles estándar
  const criticalResources = allResources.filter(resource => {
    const category = resource.resourceData.category;
    return isResourceCritical(resource.quantity, category);
  });

  // Aplicar niveles estándar a los recursos críticos
  return criticalResources.map(resource => {
    const category = resource.resourceData.category;
    const levels = getLevelsByCategory(category);
    
    return {
      ...resource.toJSON(),
      minimumLevel: levels.minimumLevel,
      criticalLevel: levels.criticalLevel,
      maximumLevel: levels.maximumLevel,
      unit: levels.unit
    };
  });
};

// Manually create history record (cron job creates them automatically every minute)
export const createChangeHistoryService = async (data) => {
  if (!data.stock || data.stock < 0) {
    return 'INVALID_STOCK';
  }
  if (!data.resourceId) {
    return 'RESOURCE_ID_REQUIRED';
  }

  const resourceData = await ResourceData.findByPk(data.resourceId);
  if (!resourceData) {
    return 'RESOURCE_NOT_FOUND';
  }

  return await ChangeHistory.create({
    stock: data.stock,
    resourceId: data.resourceId
  });
};

// Get history for specific resource (newest to oldest)
export const getResourceHistoryService = async (resourceId, limit = 100) => {
  const resourceData = await ResourceData.findByPk(resourceId);
  if (!resourceData) {
    return 'RESOURCE_NOT_FOUND';
  }

  const history = await ChangeHistory.findAll({
    where: { resourceId },
    order: [['createdAt', 'DESC']],
    limit: limit,
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  return history;
};

// Get recent history for all resources within time window (useful for graphs)
export const getRecentHistoryService = async (minutes = 60) => {
  const timeAgo = new Date();
  timeAgo.setMinutes(timeAgo.getMinutes() - minutes);

  const history = await ChangeHistory.findAll({
    where: {
      createdAt: {
        [db.Sequelize.Op.gte]: timeAgo
      }
    },
    order: [['createdAt', 'DESC']],
    include: [{
      model: ResourceData,
      as: 'resourceData',
      attributes: ['id', 'name', 'category']
    }]
  });

  return history;
};

// Calculate statistics (avg, min, max, trend) for resource over last 24h
export const getHistoryStatsService = async (resourceId) => {
  const resourceData = await ResourceData.findByPk(resourceId);
  if (!resourceData) {
    return 'RESOURCE_NOT_FOUND';
  }

  // Obtener el historial de las últimas 24 horas
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const history = await ChangeHistory.findAll({
    where: { 
      resourceId,
      createdAt: {
        [db.Sequelize.Op.gte]: oneDayAgo
      }
    },
    order: [['createdAt', 'ASC']]
  });

  if (history.length === 0) {
    return {
      resourceData,
      stats: {
        average: 0,
        min: 0,
        max: 0,
        current: 0,
        trend: 'stable',
        totalRecords: 0
      }
    };
  }

  // Calcular estadísticas
  const values = history.map(h => h.stock);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const current = values[values.length - 1];
  const firstValue = values[0];

  // Determinar tendencia
  let trend = 'stable';
  const change = current - firstValue;
  const percentageChange = (change / firstValue) * 100;

  if (percentageChange > 5) {
    trend = 'increasing';
  } else if (percentageChange < -5) {
    trend = 'decreasing';
  }

  return {
    resourceData,
    stats: {
      average: Math.round(average),
      min,
      max,
      current,
      trend,
      percentageChange: Math.round(percentageChange * 100) / 100,
      totalRecords: history.length,
      timeRange: '24h'
    }
  };
};
