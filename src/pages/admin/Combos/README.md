# Quản lý Combo món ăn

## Tổng quan
Hệ thống quản lý combo món ăn cho nhà hàng với đầy đủ chức năng CRUD và giao diện thân thiện.

## Tính năng chính

### 1. Quản lý Combo món ăn (`/combos`)
- **Hiển thị danh sách**: Dạng bảng và dạng card
- **Tạo combo mới**: Modal popup với form validation
- **Chỉnh sửa combo**: Modal popup với form pre-filled
- **Xem chi tiết**: Modal hiển thị thông tin đầy đủ
- **Xóa combo**: Xác nhận trước khi xóa
- **Khôi phục combo đã xóa**
- **Phân trang**: Hỗ trợ phân trang dữ liệu
- **Bộ lọc**: Theo trạng thái, tìm kiếm (có thể mở rộng)

## Cấu trúc API

### Endpoints chính:
- `GET /api/admin/combos/list` - Lấy danh sách combo
- `POST /api/admin/combos/create` - Tạo combo mới
- `POST /api/admin/combos/{id}/update` - Cập nhật combo
- `DELETE /api/admin/combos/{id}/soft/delete` - Xóa mềm combo
- `DELETE /api/admin/combos/{id}/force/delete` - Xóa vĩnh viễn combo
- `POST /api/admin/combos/{id}/restore` - Khôi phục combo đã xóa
- `POST /api/admin/combos/{id}/add-items` - Thêm món vào combo
- `POST /api/admin/combos/{comboId}/{dishId}/update-quantity` - Cập nhật số lượng món trong combo

### Cấu trúc dữ liệu combo:
```json
{
  "id": 1,
  "name": "Combo Gia đình",
  "price": 350000,
  "status": "active",
  "description": "Combo dành cho gia đình 4 người",
  "items": [
    { "id": 2, "name": "Gà rán", "quantity": 1 },
    { "id": 5, "name": "Khoai tây chiên", "quantity": 2 }
  ],
  "created_at": "2024-01-10T10:00:00Z"
}
```

## Trạng thái combo
- `active`: Đang bán
- `inactive`: Ngừng bán

## Công nghệ sử dụng
- **React**: Framework chính
- **Reactstrap**: UI components
- **SweetAlert2**: Thông báo đẹp
- **Axios**: HTTP client
- **React Icons**: Icon library

## Cách sử dụng

### 1. Truy cập trang quản lý combo món ăn:
```
http://localhost:3000/combos
```

### 2. Các thao tác cơ bản:
- **Tạo mới**: Click nút "Thêm combo mới"
- **Chỉnh sửa**: Click icon bút chì trong hàng tương ứng
- **Xem chi tiết**: Click icon mắt trong hàng tương ứng
- **Xóa**: Click icon thùng rác và xác nhận
- **Khôi phục**: Vào tab "Đã xóa" và click icon khôi phục
- **Thay đổi view**: Sử dụng nút chuyển đổi giữa dạng bảng và card

## Tuỳ chỉnh

### Thêm trạng thái mới:
1. Cập nhật `comboStatusOptions` trong `ComboIndex`
2. Cập nhật `getStatusBadge` function
3. Thêm logic xử lý trong backend

### Thêm trường dữ liệu:
1. Cập nhật form trong modal
2. Cập nhật cấu trúc dữ liệu
3. Cập nhật API endpoints

### Tuỳ chỉnh giao diện:
- Chỉnh sửa CSS trong các component
- Thay đổi layout trong JSX
- Tuỳ chỉnh SweetAlert2 themes

## Lưu ý
- Đảm bảo backend API đang chạy trên `http://127.0.0.1:8000`
- Cần cài đặt các dependencies: `sweetalert2`, `react-icons`
- Kiểm tra CORS settings nếu có lỗi API
- Backup dữ liệu trước khi test các chức năng xóa 