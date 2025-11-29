// Controllers handle HTTP requests and responses for resource endpoints

import { errorHandler } from '../utils/error.handle.js';
import {
  getAllResourcesService,
  getResourcesByCategoryService,
  getResourceByIdService,
  updateResourceQuantityService,
  getCriticalResourcesService,
  createChangeHistoryService,
  getResourceHistoryService,
  getRecentHistoryService,
  getHistoryStatsService
} from '../services/resource.service.js';

// GET /api/resources/ - List all resources with dynamic levels
export const getAllResourcesController = async (req, res) => {
  try {
    const data = await getAllResourcesService();
    return res.status(200).json({ 
      message: 'Resources retrieved successfully', 
      resources: data 
    });
  } catch (e) {
    errorHandler(res, 'Error getting resources', e);
  }
};

// GET /api/resources/category/:category - Filter resources by category
export const getResourcesByCategoryController = async (req, res) => {
  try {
    const { category } = req.params;
    const data = await getResourcesByCategoryService(category);
    
    if (data === 'INVALID_CATEGORY') {
      return res.status(400).json({ 
        message: 'Invalid category. Use: food, oxygen, water, or spare_parts' 
      });
    }
    
    return res.status(200).json({ 
      message: `Resources for category ${category} retrieved successfully`, 
      resources: data 
    });
  } catch (e) {
    errorHandler(res, 'Error getting resources by category', e);
  }
};

// GET /api/resources/:id - Get resource by ID
export const getResourceByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getResourceByIdService(Number(id));
    
    if (!data) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    return res.status(200).json({ 
      message: 'Resource retrieved successfully', 
      resource: data 
    });
  } catch (e) {
    errorHandler(res, 'Error getting resource', e);
  }
};

// PUT /api/resources/:id/update-quantity - Update resource quantity and log to history
export const updateResourceQuantityController = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const result = await updateResourceQuantityService(Number(id), quantity);
    
    if (result === 'RESOURCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (result === 'INVALID_QUANTITY') {
      return res.status(400).json({ message: 'Invalid quantity. Must be a positive number' });
    }
    
    return res.status(200).json({ 
      message: 'Resource quantity updated successfully', 
      resource: result 
    });
  } catch (e) {
    errorHandler(res, 'Error updating resource quantity', e);
  }
};

// GET /api/resources/alerts - Get resources at or below critical levels
export const getCriticalResourcesController = async (req, res) => {
  try {
    const data = await getCriticalResourcesService();
    return res.status(200).json({ 
      message: 'Critical resources retrieved successfully', 
      resources: data,
      count: data.length
    });
  } catch (e) {
    errorHandler(res, 'Error getting critical resources', e);
  }
};

// POST /api/resources/change-history - Manually create history record
export const createChangeHistoryController = async (req, res) => {
  try {
    const result = await createChangeHistoryService(req.body);
    
    if (result === 'RESOURCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (result === 'INVALID_STOCK') {
      return res.status(400).json({ message: 'Invalid stock value' });
    }
    if (result === 'RESOURCE_ID_REQUIRED') {
      return res.status(400).json({ message: 'Resource ID is required' });
    }
    
    return res.status(201).json({ 
      message: 'Change history created successfully', 
      changeHistory: result 
    });
  } catch (e) {
    errorHandler(res, 'Error creating change history', e);
  }
};

// GET /api/resources/:resourceId/history - Get resource history (newest to oldest)
export const getResourceHistoryController = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    
    const result = await getResourceHistoryService(Number(resourceId), limit);
    
    if (result === 'RESOURCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    return res.status(200).json({ 
      message: 'Resource history retrieved successfully', 
      history: result,
      count: result.length
    });
  } catch (e) {
    errorHandler(res, 'Error getting resource history', e);
  }
};

// GET /api/resources/history/recent - Get recent history for all resources
export const getRecentHistoryController = async (req, res) => {
  try {
    const minutes = req.query.minutes ? parseInt(req.query.minutes) : 60;
    const result = await getRecentHistoryService(minutes);
    
    return res.status(200).json({ 
      message: `History for the last ${minutes} minutes retrieved successfully`, 
      history: result,
      count: result.length,
      timeRange: `${minutes} minutes`
    });
  } catch (e) {
    errorHandler(res, 'Error getting recent history', e);
  }
};

// GET /api/resources/:resourceId/stats - Get 24h statistics and trend analysis
export const getHistoryStatsController = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const result = await getHistoryStatsService(Number(resourceId));
    
    if (result === 'RESOURCE_NOT_FOUND') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    return res.status(200).json({ 
      message: 'Resource statistics retrieved successfully', 
      data: result
    });
  } catch (e) {
    errorHandler(res, 'Error getting resource statistics', e);
  }
};
