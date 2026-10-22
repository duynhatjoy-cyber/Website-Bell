# Dữ liệu câu chuyện khách hàng

Thêm phản hồi vào `customer-stories.json` trong mảng `stories`. Section trên trang chủ chỉ hiển thị khi có ít nhất 3 phản hồi hợp lệ, đã được khách đồng ý đăng. Không thêm phản hồi giả hoặc số liệu chưa được khách xác nhận.

Mẫu cho một phản hồi (thay toàn bộ nội dung bằng dữ liệu thật):

```json
{
  "approved": true,
  "permissionToPublish": true,
  "quote": "Trích dẫn về một thay đổi cụ thể, tối đa 40 từ.",
  "name": "Họ tên khách hàng",
  "role": "Chức danh",
  "property": "Tên cơ sở",
  "type": "Khách sạn",
  "rooms": 30,
  "products": ["PMS", "CMS"],
  "image": "./assets/anh-khach-hang.jpg",
  "logo": "./assets/logo-co-so.svg",
  "caseStudy": {
    "before": "Tình trạng trước đây",
    "how": "Cách cơ sở dùng Bellhop",
    "after": "Kết quả đã xác nhận",
    "metricsConfirmed": true
  }
}
```

Chép ảnh và logo vào thư mục `assets`. `caseStudy` có thể bỏ qua; chỉ điền số liệu trong phần “Sau” khi khách hàng đã xác nhận. Sau khi cập nhật, chạy `npm run build`.
