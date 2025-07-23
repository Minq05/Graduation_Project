# Graduation Project - Hướng dẫn gộp dự án

## Giới thiệu
Dự án này gộp 3 repository riêng biệt vào một dự án chung:
1. Backend API (Graduation_Project-APIs)
2. Admin Dashboard (Graduation_Project-admin)
3. Client Application (Graduation_Project-client)

## Cách thực hiện

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