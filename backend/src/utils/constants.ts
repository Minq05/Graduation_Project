export const WHITELIST_DOMAINS = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080']

export const ERROR_MESSAGES = {
  INVALID: {
    ID: 'ID không hợp lệ',
    EMAIL: 'Email không hợp lệ',
    PASSWORD: 'Mật khẩu không hợp lệ',
    CODE: 'Mã xác thực không hợp lệ'
  },
  USER: {
    CREATED: 'Người dùng đã được tạo',
    UPDATED: 'Người dùng đã được cập nhật',
    DELETED: 'Người dùng đã bị xóa',
    FETCH_ALL: 'Lấy tất cả người dùng thành công',
    FETCH_ONE: 'Lấy thông tin người dùng thành công'
  }
}

export const SUCCESS_MESSAGES = {
  CODE: {
    SENT: 'Mã xác thực đã được gửi',
    VERIFIED: 'Mã xác thực đã được xác minh',
    EXPIRED: 'Mã xác thực đã hết hạn',
    NOT_FOUND: 'Mã xác thực không tồn tại',
    ALREADY_VERIFIED: 'Mã xác thực đã được xác minh trước đó',
    NOT_VERIFIED: 'Mã xác thực chưa được xác minh',
    NOT_MATCH: 'Mã xác thực không khớp',
    NOT_EXPIRED: 'Mã xác thực chưa hết hạn',
    ALREADY_USED: 'Mã xác thực đã được sử dụng',
    NOT_USED: 'Mã xác thực chưa được sử dụng',
    NOT_DELETED: 'Mã xác thực chưa bị xóa',
    DELETED: 'Mã xác thực đã bị xóa',
    NOT_FOUND_OR_DELETED: 'Mã xác thực không tồn tại hoặc đã bị xóa',
    NOT_FOUND_OR_EXPIRED: 'Mã xác thực không tồn tại hoặc đã hết hạn',
    NOT_FOUND_OR_USED: 'Mã xác thực không tồn tại hoặc đã được sử dụng',
    NOT_FOUND_OR_NOT_USED: 'Mã xác thực không tồn tại hoặc chưa được sử dụng',
    NOT_FOUND_OR_NOT_DELETED: 'Mã xác thực không tồn tại hoặc chưa bị xóa',
    NOT_FOUND_OR_NOT_EXPIRED: 'Mã xác thực không tồn tại hoặc chưa hết hạn',
    NOT_FOUND_OR_VERIFIED: 'Mã xác thực không tồn tại hoặc đã được xác minh',
  },
  USER: {
    NOT_FOUND: 'Người dùng không tồn tại',
    ALREADY_EXISTS: 'Người dùng đã tồn tại',
    NOT_VERIFIED: 'Người dùng chưa được xác minh',
    NOT_ACTIVE: 'Người dùng chưa hoạt động',
    NOT_DELETED: 'Người dùng chưa bị xóa',
    DELETED: 'Người dùng đã bị xóa',
    NOT_FOUND_OR_DELETED: 'Người dùng không tồn tại hoặc đã bị xóa',
    NOT_FOUND_OR_NOT_DELETED: 'Người dùng không tồn tại hoặc chưa bị xóa'
  }
}
