# Tổng quan dự án: Phòng Thí Nghiệm Hóa Học Ảo (VibeTDU - Virtual Chemistry Lab)

## 1. Lý do chọn đề tài
Hóa học là một môn khoa học thực nghiệm, tuy nhiên việc tiếp cận với các thí nghiệm thực tế trong môi trường học đường thường gặp nhiều hạn chế do thiếu hụt trang thiết bị, hóa chất đắt đỏ, hoặc các nguy cơ tiềm ẩn về an toàn (cháy nổ, độc hại). Bên cạnh đó, việc học lý thuyết chay thường khô khan và khó hình dung quá trình phản ứng.
Dự án "Phòng Thí Nghiệm Hóa Học Ảo" (VibeTDU) được phát triển nhằm giải quyết những vấn đề trên, cung cấp một môi trường mô phỏng an toàn, trực quan và sinh động. Hệ thống giúp học sinh, sinh viên và những người yêu thích hóa học có thể tự do thực hành, quan sát hiện tượng và hiểu sâu hơn về bản chất của các phản ứng hóa học mà không phải lo lắng về rủi ro vật lý hay giới hạn về vật tư.

## 2. Đối tượng người dùng hướng tới
- **Học sinh, sinh viên:** Cần một công cụ hỗ trợ học tập, thực hành thí nghiệm để củng cố kiến thức lý thuyết, đặc biệt là trong các môn Hóa học cơ bản và nâng cao.
- **Giáo viên, giảng viên:** Sử dụng phần mềm như một công cụ giảng dạy trực quan trên lớp để minh họa các phản ứng hóa học một cách sinh động, thu hút sự chú ý của học sinh.
- **Người đam mê khoa học/hóa học:** Những người muốn tự tìm hiểu, khám phá và mô phỏng các phản ứng hóa học trong một môi trường an toàn.

## 3. Mô tả ý tưởng và hướng dẫn sử dụng sản phẩm
### Mô tả ý tưởng
VibeTDU là một ứng dụng web kết hợp giao diện mô phỏng 2.5D trực quan, cho phép người dùng chọn lựa các hóa chất, dụng cụ thí nghiệm và tiến hành pha trộn chúng để tạo ra các phản ứng hóa học theo thời gian thực. Điểm nổi bật của dự án là việc tích hợp Trợ lý ảo AI (sử dụng Google Gemini) để giải đáp thắc mắc, dự đoán kết quả phản ứng và hướng dẫn chi tiết từng bước cho người dùng. Cấu trúc dữ liệu B-Tree được áp dụng để tối ưu hóa việc tra cứu và lập chỉ mục hóa chất.

### Hướng dẫn sử dụng cơ bản
1. **Giao diện chính (Bàn thí nghiệm 2.5D):** Tại đây, người dùng có thể tương tác với các hóa chất (ví dụ: dung dịch CuSO4, NaOH) và các dụng cụ thí nghiệm từ bảng điều khiển (Control Panel).
2. **Tiến hành thí nghiệm:**
   - Kết hợp các hóa chất với nhau trong môi trường ảo.
   - Sử dụng các công cụ điều khiển mô phỏng (Play) trên Control Panel để bắt đầu quan sát phản ứng.
   - Quan sát hiện tượng (kết tủa, đổi màu, sinh khí...) được mô phỏng trực quan trên màn hình.
   - Nhấn nút **Reset** để dọn dẹp và bắt đầu một thí nghiệm mới.
3. **Sử dụng Trợ lý AI (Chatbot):** Nếu gặp khó khăn trong việc dự đoán sản phẩm, phân tích hiện tượng, hoặc cần tìm hiểu thêm về phương trình hóa học, người dùng có thể nhập câu hỏi vào hộp thoại Chatbot AI tích hợp trên giao diện để nhận được hỗ trợ tức thì.

## 4. Công nghệ và kỹ thuật sử dụng
Dự án được xây dựng dựa trên kiến trúc hệ thống hiện đại, phân tách rõ ràng giữa Frontend và Backend:
- **Frontend (Giao diện người dùng):**
  - Sử dụng **Next.js & React** để xây dựng trải nghiệm UI/UX mượt mà, quản lý trạng thái phức tạp của các thành phần mô phỏng.
  - Xây dựng giao diện không gian 2.5D tối ưu hóa cho việc tương tác kéo-thả và quan sát.
- **Backend (Máy chủ và Xử lý logic):**
  - Sử dụng **Spring Boot (Java)** để xử lý logic cốt lõi của các phản ứng hóa học, cung cấp API nhanh chóng.
  - Áp dụng cấu trúc dữ liệu **B-Tree Architecture** để lập chỉ mục (indexing) dữ liệu hóa chất, giúp việc tra cứu thuộc tính, công thức và tìm kiếm phản ứng diễn ra với hiệu suất cực cao.
- **Tích hợp AI (Trí tuệ nhân tạo):**
  - Sử dụng **Google Gemini API** làm bộ não cho Trợ lý Hóa học Ảo (Chemistry Assistant Chatbot).
  - Tích hợp kỹ thuật xoay vòng khóa API (Key Rotation) để đảm bảo hệ thống hỗ trợ AI luôn hoạt động ổn định và không bị gián đoạn do giới hạn lượng truy cập.

## 5. Khả năng ứng dụng và giá trị mang lại
- **An toàn tuyệt đối:** Loại bỏ hoàn toàn các nguy cơ cháy nổ, ngộ độc khí hay bỏng hóa chất, mang lại môi trường học tập lý tưởng.
- **Tiết kiệm chi phí:** Giải quyết bài toán tài chính cho các cơ sở giáo dục thiếu ngân sách trang bị phòng thí nghiệm vật lý, mua sắm hóa chất hay dụng cụ đắt tiền.
- **Nâng cao chất lượng giáo dục:** Kích thích sự tò mò, sáng tạo và tư duy thực nghiệm của học sinh thông qua phương pháp học tập tương tác (interactive learning) và sự đồng hành của giáo viên AI thông minh.
- **Tính tiếp cận cao (Accessibility):** Là một ứng dụng Web, người dùng có thể thực hành hóa học ở bất cứ đâu, bất cứ lúc nào thông qua trình duyệt mà không cần cài đặt phần mềm nặng nề.
- **Khả năng mở rộng:** Kiến trúc phần mềm cho phép dễ dàng cập nhật thêm các bộ hóa chất mới, phản ứng hữu cơ/vô cơ phức tạp trong các giai đoạn phát triển tiếp theo của dự án.
