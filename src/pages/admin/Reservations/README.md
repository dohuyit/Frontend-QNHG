# Quản lý Đơn đặt bàn

## Tổng quan
Hệ thống quản lý đơn đặt bàn cho nhà hàng với đầy đủ chức năng CRUD và giao diện thân thiện.

## Tính năng chính

### 1. Quản lý Đơn đặt bàn (`/table-bookings`)
- **Hiển thị danh sách**: Dạng bảng và dạng card
- **Tạo đơn đặt bàn mới**: Modal popup với form validation
- **Chỉnh sửa đơn đặt bàn**: Modal popup với form pre-filled
- **Xem chi tiết**: Modal hiển thị thông tin đầy đủ
- **Xóa đơn đặt bàn**: Xác nhận trước khi xóa
- **Thay đổi trạng thái**: Xác nhận, hoàn thành, hủy đơn
- **Phân trang**: Hỗ trợ phân trang dữ liệu
- **Bộ lọc**: Theo trạng thái, tìm kiếm (có thể mở rộng)

### 2. Quản lý Khu vực bàn (`/table-areas`)
- **Hiển thị danh sách**: Dạng bảng
- **Thêm khu vực mới**: Modal popup
- **Chỉnh sửa khu vực**: Modal popup
- **Xóa khu vực**: Xác nhận trước khi xóa
- **Quản lý trạng thái**: Hoạt động/Không hoạt động

## Cấu trúc API

### Endpoints chính:
- `GET /api/admin/tables/list` - Lấy danh sách đơn đặt bàn
- `GET /api/admin/table-areas/list` - Lấy danh sách khu vực bàn
- `POST /api/admin/tables/create` - Tạo đơn đặt bàn mới
- `POST /api/admin/tables/{id}/update` - Cập nhật đơn đặt bàn
- `DELETE /api/admin/tables/{id}/soft/delete` - Xóa đơn đặt bàn
- `POST /api/admin/tables/{id}/change-status` - Thay đổi trạng thái

### Cấu trúc dữ liệu đơn đặt bàn:
```json
{
  "id": 1,
  "customer_name": "Nguyễn Văn A",
  "phone_number": "0123456789",
  "email": "nguyenvana@email.com",
  "booking_date": "2024-01-15",
  "booking_time": "18:00",
  "number_of_guests": 4,
  "table_area_id": 1,
  "special_requests": "Bàn gần cửa sổ",
  "status": "pending",
  "created_at": "2024-01-10T10:00:00Z"
}
```

### Cấu trúc dữ liệu khu vực bàn:
```json
{
  "id": 1,
  "name": "Khu vực A",
  "description": "Khu vực chính",
  "capacity": 50,
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Trạng thái đơn đặt bàn
- `pending`: Chờ xác nhận
- `confirmed`: Đã xác nhận
- `completed`: Hoàn thành
- `cancelled`: Đã hủy

## Công nghệ sử dụng
- **React**: Framework chính
- **Reactstrap**: UI components
- **SweetAlert2**: Thông báo đẹp
- **Axios**: HTTP client
- **React Icons**: Icon library

## Cách sử dụng

### 1. Truy cập trang quản lý đơn đặt bàn:
```
http://localhost:3000/table-bookings
```

### 2. Truy cập trang quản lý khu vực bàn:
```
http://localhost:3000/table-areas
```

### 3. Các thao tác cơ bản:
- **Tạo mới**: Click nút "Tạo đơn đặt bàn" hoặc "Thêm khu vực bàn"
- **Chỉnh sửa**: Click icon bút chì trong hàng tương ứng
- **Xem chi tiết**: Click icon mắt trong hàng tương ứng
- **Xóa**: Click icon thùng rác và xác nhận
- **Thay đổi view**: Sử dụng nút chuyển đổi giữa dạng bảng và card

## Tùy chỉnh

### Thêm trạng thái mới:
1. Cập nhật `bookingStatusOptions` trong `TableBookingIndex`
2. Cập nhật `getStatusBadge` function
3. Thêm logic xử lý trong backend

### Thêm trường dữ liệu:
1. Cập nhật form trong modal
2. Cập nhật cấu trúc dữ liệu
3. Cập nhật API endpoints

### Tùy chỉnh giao diện:
- Chỉnh sửa CSS trong các component
- Thay đổi layout trong JSX
- Tùy chỉnh SweetAlert2 themes

## Lưu ý
- Đảm bảo backend API đang chạy trên `http://127.0.0.1:8000`
- Cần cài đặt các dependencies: `sweetalert2`, `react-icons`
- Kiểm tra CORS settings nếu có lỗi API
- Backup dữ liệu trước khi test các chức năng xóa 