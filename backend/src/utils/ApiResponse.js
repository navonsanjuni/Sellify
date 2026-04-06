/**
 * Standard API response wrapper
 * Ensures consistent response shape across all endpoints
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
  }
}

/**
 * Send a success response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response payload
 * @param {string} message - Human-readable message
 */
const sendResponse = (res, statusCode, data, message = "Success") => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

module.exports = { ApiResponse, sendResponse };
