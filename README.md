# Coursera Bilingual Transcript

Chrome extension hiển thị **transcript song ngữ Anh-Việt** ngay trong panel transcript gốc của Coursera. Mỗi câu tiếng Anh sẽ có thêm một dòng tiếng Việt nhỏ hơn ngay bên dưới, và phần đang được đọc sẽ **tự động highlight đúng theo tiến trình video** — bám sát cơ chế highlight gốc của Coursera.

## Tính năng

- Song ngữ dạng **double-line**: dòng tiếng Anh (chính) + dòng tiếng Việt (nhỏ hơn) ngay bên dưới cho từng câu trong transcript.
- Highlight tự động theo lời giảng — nói tới đâu, cả 2 dòng Anh/Việt sáng lên tới đó.
- Không phá vỡ transcript gốc: giữ nguyên khung, nút timestamp, tìm kiếm, autoscroll... của Coursera; click vào câu (Anh hoặc Việt) vẫn seek video như bình thường.
- Tự động kích hoạt trên mọi bài giảng có transcript, không cần bật/tắt thủ công.

## Cài đặt (Load unpacked)

1. Tải/clone repo này về máy.
2. Mở Chrome, vào địa chỉ `chrome://extensions`.
3. Bật **Developer mode** (góc trên bên phải).
4. Bấm **Load unpacked**, chọn thư mục gốc của repo (thư mục chứa file `manifest.json`).
5. Extension "Coursera Bilingual Transcript" sẽ xuất hiện trên thanh công cụ.

## Cấu hình API key (miễn phí)

1. Lấy Gemini API key miễn phí tại **[Google AI Studio](https://aistudio.google.com/apikey)** (đăng nhập bằng tài khoản Google, bấm "Create API key").
2. Bấm vào **icon extension** trên thanh công cụ Chrome để mở popup cài đặt.
3. Dán API key vào ô **Gemini API key** (model dịch dùng cố định `gemini-3.6-flash`, không cần chỉnh).
4. Bấm **Lưu cài đặt**. Popup sẽ hiện trạng thái "Đã cấu hình API key".

## Cách dùng

1. Vào một bài giảng Coursera bất kỳ có transcript (`coursera.org/learn/.../lecture/...`).
2. Mở panel **Transcript** (nếu chưa mở).
3. Extension tự phát hiện transcript, gọi Gemini dịch toàn bộ sang tiếng Việt (chỉ lần đầu cho mỗi bài, lần sau dùng cache), rồi chèn dòng tiếng Việt bên dưới mỗi câu.
4. Phát video — câu đang được đọc sẽ tự động highlight ở cả 2 dòng Anh/Việt.

Nếu popup báo "Chưa có API key", hoặc trong panel transcript hiện banner nhắc nhở — quay lại bước [Cấu hình API key](#cấu-hình-api-key-miễn-phí) ở trên.

## Giới hạn / lưu ý

- Cần API key Gemini hợp lệ; gói miễn phí có giới hạn số request/phút — nếu dịch lỗi, panel sẽ báo và có nút thử lại.
- Chỉ hoạt động trên các trang bài giảng dạng `coursera.org/learn/*/lecture/*` có transcript.

## Thư mục dự án

```
manifest.json
src/
  background/background.js   # gọi Gemini API, xử lý message
  content/content.js         # phát hiện transcript, dịch, chèn dòng Việt
  content/styles.css         # style double-line + highlight
  popup/popup.html           # UI popup nhập API key
  popup/popup.js
```

## Copyright

© VibeCode by NhatTruong
