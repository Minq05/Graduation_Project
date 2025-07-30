import { Response } from 'express'

interface ApiResponse<T> {
  statusCode: number
  message: string
  data?: T
  error?: {
    code?: number
    details?: string
  }
  meta?: IMeta
}

/**
 * Sends a JSON response with the specified status code and data.
 * @param res - The Express response object.
 * @param statusCode - The HTTP status code to send.
 * @param response - The response data to send.
 * @param response.statusCode - The status code of the response.
 * @param response.message - The message of the response.
 * @param response.data - The data to send in the response (optional).
 * @param response.error - The error object to send in the response (optional).
 * @param response.meta - The meta information to send in the response (optional).
 * @template T - The type of the data in the response.
 * @returns {void}
 * @throws {Error} If the response cannot be sent.
 * @description This function sends a JSON response with the specified status code and data.
 * It can be used to send success or error responses in an Express application.
 * The response object can include a status code, message, data, error details, and meta information.
 * The function uses the Express response object to send the JSON response.
 * The status code is set using the `status` method, and the response data is sent using the `json` method.
 * The function is generic and can be used with any type of data.
 * @example
 * app.get('/api/users', (req, res) => {
 *   const users = await getUsersFromDatabase()
 *   const response: ApiResponse<User[]> = {
 *     statusCode: 200,
 *     message: 'Users retrieved successfully',
 *     data: users,
 *     meta: {
 *       current: 1,
 *       pages: 10,
 *       pageSize: 20,
 *       total: 200
 *     }
 *   }
 *   sendApiResponse(res, 200, response)
 * })
 */
function sendApiResponse<T>(res: Response, statusCode: number, response: ApiResponse<T>): void {
  res.status(statusCode).json(response)
}

export default sendApiResponse
