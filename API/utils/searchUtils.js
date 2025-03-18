/**
 * Utility functions for advanced search functionality
 */

/**
 * Creates a MongoDB query object based on search parameters
 * @param {Object} params - Search parameters
 * @param {Array} textFields - Fields to search for text
 * @param {Array} exactFields - Fields that require exact matching
 * @param {Array} rangeFields - Fields that support range queries
 * @param {Array} arrayFields - Fields that are arrays and support $in queries
 * @returns {Object} MongoDB query object
 */
const buildSearchQuery = (params, textFields = [], exactFields = [], rangeFields = [], arrayFields = []) => {
  const query = {};
  
  // Process text search fields (case insensitive partial match)
  textFields.forEach(field => {
    if (params[field]) {
      query[field] = { $regex: params[field], $options: 'i' };
    }
  });
  
  // Process exact match fields
  exactFields.forEach(field => {
    if (params[field]) {
      query[field] = params[field];
    }
  });
  
  // Process range fields
  rangeFields.forEach(field => {
    const minField = `min${field.charAt(0).toUpperCase() + field.slice(1)}`;
    const maxField = `max${field.charAt(0).toUpperCase() + field.slice(1)}`;
    
    if (params[minField] !== undefined || params[maxField] !== undefined) {
      query[field] = {};
      
      if (params[minField] !== undefined) {
        query[field].$gte = params[minField];
      }
      
      if (params[maxField] !== undefined) {
        query[field].$lte = params[maxField];
      }
    }
  });
  
  // Process date range fields
  if (params.startDate && params.endDate) {
    query.createdAt = {
      $gte: new Date(params.startDate),
      $lte: new Date(params.endDate)
    };
  } else if (params.startDate) {
    query.createdAt = { $gte: new Date(params.startDate) };
  } else if (params.endDate) {
    query.createdAt = { $lte: new Date(params.endDate) };
  }
  
  // Process array fields (supports multiple values)
  arrayFields.forEach(field => {
    if (params[field]) {
      const values = Array.isArray(params[field]) ? params[field] : [params[field]];
      query[field] = { $in: values };
    }
  });
  
  return query;
};

/**
 * Builds pagination options for MongoDB queries
 * @param {Object} params - Request query parameters
 * @param {Number} defaultLimit - Default items per page
 * @returns {Object} Pagination options
 */
const buildPaginationOptions = (params, defaultLimit = 10) => {
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || defaultLimit;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Builds sort options for MongoDB queries
 * @param {Object} params - Request query parameters
 * @param {String} defaultSortField - Default field to sort by
 * @param {Number} defaultSortOrder - Default sort order (1 for asc, -1 for desc)
 * @returns {Object} Sort options
 */
const buildSortOptions = (params, defaultSortField = 'createdAt', defaultSortOrder = -1) => {
  const sort = {};
  
  if (params.sortBy) {
    sort[params.sortBy] = params.sortOrder === 'asc' ? 1 : -1;
  } else {
    sort[defaultSortField] = defaultSortOrder;
  }
  
  return sort;
};

/**
 * Performs a full-text search across multiple fields
 * @param {Object} model - Mongoose model to search
 * @param {String} searchTerm - Text to search for
 * @param {Array} fields - Fields to include in the search
 * @param {Object} additionalQuery - Additional query conditions
 * @returns {Promise} Query promise
 */
const performFullTextSearch = async (model, searchTerm, fields, additionalQuery = {}) => {
  if (!searchTerm) {
    return model.find(additionalQuery);
  }
  
  const searchConditions = fields.map(field => ({
    [field]: { $regex: searchTerm, $options: 'i' }
  }));
  
  const query = {
    $and: [
      { $or: searchConditions },
      additionalQuery
    ]
  };
  
  return model.find(query);
};

module.exports = {
  buildSearchQuery,
  buildPaginationOptions,
  buildSortOptions,
  performFullTextSearch
};