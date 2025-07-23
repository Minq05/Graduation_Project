/**
 * Định nghĩa một lớp ApiError kế thừa từ lớp Error sẵn có.
 * Điều này cần thiết và là Best Practice vì lớp Error là lớp built-in.
 */
class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    // Gọi hàm khởi tạo của lớp cha (Error)
    super(message)

    // Đặt tên cho lỗi này
    this.name = 'ApiError'

    // Gán statusCode
    this.statusCode = statusCode

    // Ghi lại Stack Trace để thuận tiện cho việc debug
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
