/**
 * Standardized response utility for consistent API responses
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} error - Error details
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const error = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
    ...(error && { error: error.message || error })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 * @param {Array} errors - Validation errors array
 */
const validationError = (res, message, errors = []) => {
  const response = {
    success: false,
    message,
    errors
  };
  
  return res.status(400).json(response);
};

/**
 * Send a not found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const notFound = (res, message = 'Resource not found') => {
  const response = {
    success: false,
    message
  };
  
  return res.status(404).json(response);
};

/**
 * Send an unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const unauthorized = (res, message = 'Unauthorized access') => {
  const response = {
    success: false,
    message
  };
  
  return res.status(401).json(response);
};

/**
 * Send a forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const forbidden = (res, message = 'Access forbidden') => {
  const response = {
    success: false,
    message
  };
  
  return res.status(403).json(response);
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden
};
