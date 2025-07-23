#!/bin/bash
echo "=== Bắt đầu quá trình gộp dự án ==="

echo
echo "=== 1. Thêm và gộp repository backend ==="
git remote add backend https://github.com/thenam2kx/Graduation_Project-APIs.git
git fetch backend
git checkout -b backend-main backend/main
mkdir -p backend
git ls-tree -r --name-only HEAD | xargs -I files mv files backend/ 2>/dev/null
git add .
git commit -m "Move Graduation_Project-APIs into backend folder"
git checkout main 2>/dev/null || git checkout master
git merge backend-main --allow-unrelated-histories

echo
echo "=== 2. Thêm và gộp repository admin ==="
git remote add admin https://github.com/thenam2kx/Graduation_Project-admin.git
git fetch admin
git checkout -b admin-main admin/main
mkdir -p admin
git ls-tree -r --name-only HEAD | xargs -I files mv files admin/ 2>/dev/null
git add .
git commit -m "Move Graduation_Project-admin into admin folder"
git checkout main 2>/dev/null || git checkout master
git merge admin-main --allow-unrelated-histories

echo
echo "=== 3. Thêm và gộp repository client ==="
git remote add client https://github.com/thenam2kx/Graduation_Project-client.git
git fetch client
git checkout -b client-main client/main
mkdir -p client
git ls-tree -r --name-only HEAD | xargs -I files mv files client/ 2>/dev/null
git add .
git commit -m "Move Graduation_Project-client into client folder"
git checkout main 2>/dev/null || git checkout master
git merge client-main --allow-unrelated-histories

echo
echo "=== Hoàn thành quá trình gộp dự án ==="