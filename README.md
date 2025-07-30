# 📦 Phụ thuộc của dự án

## 🏗️ **Dependencies** (Thư viện chính)

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

---

## 🔧 **DevDependencies** (Thư viện phát triển)

- **@eslint/js**: Quy tắc JavaScript cốt lõi của ESLint.
- **@faker-js/faker**: Tạo dữ liệu giả lập cho các tình huống kiểm thử.
- **@types/\***: Định nghĩa kiểu TypeScript cho các thư viện tương ứng.
- **cross-env**: Thiết lập biến môi trường đa nền tảng.
- **eslint**: Công cụ phân tích mã nguồn và tìm lỗi tiềm ẩn.
- **eslint-config-prettier**: Tắt các quy tắc xung đột giữa ESLint và Prettier.
- **eslint-plugin-import**: Kiểm tra các import trong mã nguồn.
- **eslint-plugin-prettier**: Chạy Prettier như một quy tắc của ESLint.
- **globals**: Tập hợp các biến toàn cục cho nhiều môi trường khác nhau.
- **jest**: Framework kiểm thử cho JavaScript.
- **nodemon**: Tự động khởi động lại máy chủ khi mã nguồn thay đổi.
- **prettier**: Công cụ định dạng mã nguồn tự động.
- **rimraf**: Công cụ xóa tệp hoặc thư mục (giống `rm -rf` trong Unix).
- **ts-jest**: Công cụ tích hợp Jest cho TypeScript.
- **ts-node**: Môi trường thực thi TypeScript trực tiếp trong Node.js.
- **tsc-alias**: Thay thế các đường dẫn alias trong các tệp JavaScript đã biên dịch.
- **tsx**: Môi trường thực thi TypeScript nhanh hơn.
- **typescript**: Ngôn ngữ mở rộng của JavaScript thêm hệ thống kiểu tĩnh.
- **typescript-eslint**: Hỗ trợ ESLint cho TypeScript.

---

# 📁 Mô tả các tệp tin

## 🌐 Thư mục gốc (Root Directory)

- `.editorconfig`: Cấu hình cho EditorConfig.
- `.env.development`: Biến môi trường cho phát triển.
- `.env.example`: Ví dụ biến môi trường.
- `.env.production`: Biến môi trường cho sản xuất.
- `.gitignore`: Xác định các tệp sẽ bị Git bỏ qua.
- `.prettierignore`: Xác định các tệp sẽ bị Prettier bỏ qua.
- `.prettierrc`: Cấu hình cho Prettier.
- `eslint.config.mjs`: Cấu hình cho ESLint.
- `jest.config.js`: Cấu hình cho Jest.
- `nodemon.json`: Cấu hình cho Nodemon.
- `package.json`: Thông tin và các thư viện phụ thuộc của dự án.
- `README.md`: Tài liệu mô tả dự án.
- `tsconfig.json`: Cấu hình cho TypeScript.

---

## 📊 Thư mục Coverage

- `clover.xml`: Báo cáo độ bao phủ ở định dạng Clover.
- `coverage-final.json`: Báo cáo cuối cùng ở JSON.
- `lcov.info`: Báo cáo LCOV.
- `lcov-report/`: Thư mục chứa báo cáo HTML.

---

## 📝 Thư mục Logs

- `combined.log`: Nhật ký tổng hợp.
- `error.log`: Nhật ký lỗi.

---

## 🌐 Thư mục Public

- `css/`: Thư mục chứa tệp CSS.
- `images/`: Thư mục chứa tệp hình ảnh.
- `js/`: Thư mục chứa tệp JavaScript.

---

## 📦 Thư mục Src (Mã nguồn)

- `server.ts`: Điểm khởi chạy chính của máy chủ.

### 🌟 Thư mục con trong `src`:

- `__tests__/`: Chứa các tệp kiểm thử.
- `config/`: Chứa các tệp cấu hình.
- `controllers/`: Chứa các tệp điều khiển (controller).
- `middlewares/`: Chứa các tệp middleware.
- `models/`: Chứa các tệp mô hình (model).
- `routes/`: Chứa các tệp định tuyến (route).
- `services/`: Chứa các tệp dịch vụ (service).
- `types/`: Chứa các tệp định nghĩa kiểu dữ liệu.
- `utils/`: Chứa các tệp tiện ích.
- `validations/`: Chứa các tệp xác thực.
- `views/`: Chứa các tệp mẫu giao diện (template).

---

## ⚙️ Thư mục Config

- `env.ts`: Cấu hình biến môi trường.
- `connection.ts`: Cấu hình kết nối cơ sở dữ liệu.
- `logger.ts`: Cấu hình trình ghi log.
- `cors.ts`: Cấu hình CORS.
- `viewEngine.ts`: Cấu hình công cụ hiển thị giao diện.

---

## 🧩 Thư mục Controllers

- `user.controller.ts`: Điều khiển các thao tác liên quan đến người dùng.

---

## 🛠️ Thư mục Middlewares

- `limiter.ts`: Middleware giới hạn lượt call api trong 1 phút.
- `errorHandlingMiddleware.ts`: Middleware xử lý lỗi.

---

## 📌 Thư mục Models

- `user.model.ts`: Định nghĩa mô hình người dùng.

---

## 🚦 Thư mục Routes

- `v1/index.ts`: Định nghĩa các tuyến API cho phiên bản 1.
- `auth.route.ts`: Định nghĩa APIs cho auth.
- `user.route.ts`: Định nghĩa APIs cho user.

---

## 📡 Thư mục Services

- `user.service.ts`: Dịch vụ cho các thao tác liên quan đến người dùng.

---

## 🔍 Thư mục Types

- `type.d.ts`: Định nghĩa kiểu dữ liệu.

---

## ⚡ Thư mục Utils

- `ApiError.ts`: Lớp xử lý lỗi API tùy chỉnh.
- `constants.ts`: Các hằng số được sử dụng trong dự án.
- `uploadFile.ts`: Tiện ích để tải tệp lên.
- `ApiError.ts`: Cấu hình lỗi
- `convertSlugUrl.ts`: Hàm convert string sang dạng slug (ví dụ => vi-du)
- `jwt.ts`: Các hàm sign token và verify token
- `password.ts`: Các hàm hash pasword và compare password
- `sendEmail.ts`: Hàm gửi email
- `utils.ts`: Các hàm tiện ích chung.

---

## ✅ Thư mục Validations

- `user.validation.ts`: Xác thực cho các thao tác liên quan đến người dùng.

---

## 🎨 Thư mục Views

- `home.ejs`: Mẫu giao diện trang chủ.
- `mailer.ejs`: Mẫu email kích hoạt tài khoản.

---

## 🧪 Thư mục Tests

---

[Sơ đồ hoạt động](https://www.canva.com/design/DAGiy-k1iaw/7kxCkPGsfWPqTNOZ7hWoww/edit?utm_content=DAGiy-k1iaw&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---

## 📖 Hướng Dẫn Clone & Chạy Dự Án
### 🚀 1. Clone dự án từ GitHub
```
 - git clone https://github.com/thenam2kx/Graduation_Project-APIs.git
```

### 🚀 2. Tải các dependencies
```
 - npm install
```

### 🚀 3. Chạy dự án
```
 - npm run dev
```

---

## 📖 Kéo branch từ github về máy
### 🚀 1. Kiểm tra các branch đang có trên github
```
  - git fetch
  - git branch -r
```

### 🚀 2. Kéo branch cụ thể về máy (thay thế branch-name bằng tên branch)
```
  - git checkout -b branch-name origin/branch-name
```
