# Hướng dẫn Deploy lên AWS EC2 qua Termius

Tài liệu này hướng dẫn cách deploy hệ thống VibeTDU (Backend, Frontend, Nginx) lên một instance AWS EC2 bằng Docker Compose.

## 1. Kết nối vào EC2 qua Termius
1. Mở **Termius**.
2. Chọn **New Host**.
3. Điền các thông tin:
   - **Address**: `[IP_PUBLIC_CUA_EC2]`
   - **Username**: `ubuntu` (hoặc `ec2-user` tùy vào hệ điều hành bạn chọn)
   - **Keys**: Chọn SSH key pair bạn đã tải về từ AWS.
4. Lưu lại và nhấn đúp để kết nối.

## 2. Cài đặt Docker và Docker Compose trên EC2 (Nếu chưa có)
Chạy các lệnh sau trên terminal của EC2:
```bash
# Cập nhật hệ thống
sudo apt-get update -y

# Cài đặt Docker
sudo apt-get install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Thêm user hiện tại vào group docker để không cần gõ sudo
sudo usermod -aG docker $USER
newgrp docker

# Cài đặt Docker Compose plugin
sudo apt-get install docker-compose-plugin -y
```

## 3. Lựa chọn phương pháp Deploy
Hiện tại có 2 cách chính để "kéo container về máy ảo":

**Cách 1: Build ảnh trực tiếp trên EC2 (Đơn giản nhất cho dự án nhỏ)**
1. Cài đặt git: `sudo apt install git -y`
2. Clone repository: `git clone [URL_REPO_CUA_BAN] vibetdu`
3. cd vào thư mục: `cd vibetdu`
4. Tạo file `.env` cho backend: `nano backend/.env` và điền các biến môi trường cần thiết.
5. Sửa `docker-compose.yml` hoặc `.env` để cập nhật biến `NEXT_PUBLIC_API_URL` thành IP Public của EC2 (VD: `http://[IP_PUBLIC]/api`).
6. Build và chạy: `docker compose up -d --build`

**Cách 2: Kéo Image từ Docker Hub / GitHub Container Registry (Khuyên dùng cho Production)**
1. Build image trên máy tính của bạn và push lên Docker Hub.
2. Trên EC2, chỉ cần tạo file `docker-compose.yml` và `.env`.
3. Chạy lệnh: `docker compose pull` sau đó `docker compose up -d`
*(Nếu chọn cách này, chúng ta cần sửa lại docker-compose.yml để trỏ tới image trên Docker Hub thay vì build từ source code).*

## 4. Kiểm tra trạng thái
```bash
docker compose ps
docker compose logs -f
```
