# Graduation Project - Dự án tốt nghiệp

## Giới thiệu
Dự án này gộp 3 repository riêng biệt vào một dự án chung:
1. Backend API (Graduation_Project-APIs)
2. Admin Dashboard (Graduation_Project-admin)
3. Client Application (Graduation_Project-client)

## Cách thực hiện gộp dự án

### Trên Windows
1. Mở Command Prompt hoặc PowerShell
2. Di chuyển đến thư mục dự án: `cd "e:\DỰ ÁN\Graduation_Project"`
3. Chạy script: `merge_repos.bat`

### Trên Linux/Mac
1. Mở Terminal
2. Di chuyển đến thư mục dự án
3. Cấp quyền thực thi cho script: `chmod +x merge_repos.sh`
4. Chạy script: `./merge_repos.sh`

## Lưu ý
- Đảm bảo đã khởi tạo git repository trong thư mục dự án trước khi chạy script
- Nếu chưa khởi tạo, hãy chạy: `git init`
- Nếu chưa có branch main, hãy tạo commit đầu tiên: `git commit --allow-empty -m "Initial commit"`
- Quá trình merge có thể gặp conflict, hãy giải quyết conflict nếu có

## Cấu trúc thư mục sau khi gộp
```
Graduation_Project/
├── backend/     # Chứa code từ Graduation_Project-APIs
├── admin/       # Chứa code từ Graduation_Project-admin
└── client/      # Chứa code từ Graduation_Project-client
```

## Thông tin về Backend API

### 📦 Phụ thuộc của dự án

#### 🏗️ **Dependencies** (Thư viện chính)

- **@babel/runtime**: Trợ lý runtime và polyfill cho Babel.
- **async-exit-hook**: Cho phép đăng ký các hook thoát bất đồng bộ trong Node.js.
- **bcryptjs**: Thư viện băm mật khẩu.
- **body-parser**: Middleware phân tích các yêu cầu HTTP đến và gán vào `req.body`.
- **cookie-parser**: Middleware phân tích header `Cookie` và gán vào `req.cookies`.
- **cors**: Middleware kích hoạt CORS (Cross-Origin Resource Sharing).
- **dayjs**: Thư viện nhẹ để xử lý ngày tháng.
- **dotenv**: Tải các biến môi trường từ tệp `.env` vào `process.env`.
- **ejs**: Công cụ tạo giao diện HTML bằng cách nhúng JavaScript.
- **express**: Framework xây dựng ứng dụng web cho Node.js.
- **express-rate-limit**: Middleware giới hạn các yêu cầu lặp lại tới API công khai.
- **helmet**: Middleware bảo mật cho Express bằng cách thiết lập các header HTTP.
- **http-status-codes**: Bộ mã trạng thái HTTP.
- **joi**: Thư viện mô tả schema và xác thực dữ liệu.
- **jsonwebtoken**: Thư viện triển khai JSON Web Token (JWT).
- **lodash**: Thư viện tiện ích cho JavaScript hỗ trợ modularity và hiệu năng.
- **mongodb**: Trình điều khiển MongoDB cho Node.js.
- **mongoose**: Công cụ mô hình hóa đối tượng cho MongoDB.
- **mongoose-delete**: Plugin thêm chức năng xóa mềm (soft delete) cho Mongoose.
- **morgan**: Middleware ghi log các yêu cầu HTTP.
- **ms**: Công cụ chuyển đổi đơn vị mili giây.
- **multer**: Middleware xử lý `multipart/form-data` (chủ yếu dùng để tải tệp lên).
- **nodemailer**: Thư viện gửi email trong Node.js.
- **passport**: Middleware xác thực người dùng.
- **passport-google-oauth20**: Chiến lược xác thực Google OAuth 2.0 cho Passport.
- **passport-jwt**: Chiến lược xác thực bằng JSON Web Token cho Passport.
- **passport-local**: Chiến lược xác thực bằng tên người dùng và mật khẩu cho Passport.
- **qs**: Công cụ phân tích và tạo chuỗi truy vấn (query string).
- **query-string**: Phân tích và tạo chuỗi truy vấn URL.
- **slugify**: Chuyển đổi chuỗi thành slug (URL-friendly).
- **socket.io**: Cho phép giao tiếp hai chiều theo thời gian thực.
- **swagger-ui-express**: Middleware phục vụ tài liệu API sử dụng Swagger.
- **uuid**: Tạo mã nhận dạng duy nhất toàn cầu (UUID) đơn giản và nhanh chóng.
- **validator**: Thư viện kiểm tra và làm sạch chuỗi.
- **winston**: Trình ghi log cho Node.js.

[Sơ đồ hoạt động Backend](https://www.canva.com/design/DAGiy-k1iaw/7kxCkPGsfWPqTNOZ7hWoww/edit?utm_content=DAGiy-k1iaw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## Thông tin về Admin Dashboard

### Installed Libraries

#### Frontend Libraries
- **React Router**: For handling routing in the application.
- **Axios**: For making HTTP requests to the backend.
- **Redux**: For state management across the application.
- **Material-UI**: For pre-designed React components and styling.
- **React-hook-form**: For building and managing forms.
- **Joi**: For form validation schema.
- **Framer-motion**: For animation

### Project Directory Structure

```
admin/
├── public/               # Static files like index.html, images, etc.
├── src/                  # Source code for the client-side application
│   ├── apis/             # Write apis here
│   ├── components/       # Reusable React components
│   ├── pages/            # Page-level components
│   ├── redux/            # Redux store, actions, and reducers
│   ├── services/         # API service files (e.g., Axios configurations)
│   ├── utils/            # Utility functions and helpers
│   ├── styles/           # Global and component-specific styles
│   ├── App.js            # Main application component
│   ├── index.js          # Entry point of the React application
├── package.json          # Project dependencies and scripts
```

## Hướng dẫn làm việc với Git

### 🚀 1. Kiểm tra các branch đang có trên github
```
  - git fetch
  - git branch -r
```

### 🚀 2. Kéo branch cụ thể về máy (thay thế branch-name bằng tên branch)
```
  - git checkout -b branch-name origin/branch-name
```