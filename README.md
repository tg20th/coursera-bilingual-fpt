# Coursera Bilingual Transcript

Chrome extension hiển thị **transcript song ngữ Anh-Việt** ngay trong panel transcript gốc của Coursera. Mỗi câu tiếng Anh sẽ có thêm một dòng tiếng Việt nhỏ hơn ngay bên dưới, và phần đang được đọc sẽ **tự động highlight đúng theo tiến trình video** — bám sát cơ chế highlight gốc của Coursera.

## Tính năng

- Song ngữ dạng **double-line**: dòng tiếng Anh (chính) + dòng tiếng Việt (nhỏ hơn) ngay bên dưới cho từng câu trong transcript.
- Highlight tự động theo lời giảng — nói tới đâu, cả 2 dòng Anh/Việt sáng lên tới đó.
- Không phá vỡ transcript gốc: giữ nguyên khung, nút timestamp, tìm kiếm, autoscroll... của Coursera; click vào câu (Anh hoặc Việt) vẫn seek video như bình thường.
- Tự động kích hoạt trên mọi bài giảng có transcript, không cần bật/tắt thủ công.
- Dịch bằng **Gemini API** (Google AI Studio) — có gói **miễn phí**. Kết quả dịch được cache theo từng bài giảng để không dịch lại nhiều lần.
- API key được lưu cục bộ trong trình duyệt (`chrome.storage.local`), không hề hardcode trong code hay gửi đi đâu khác.

## Cài đặt (Load unpacked)

Extension này chưa đăng trên Chrome Web Store, cài theo dạng "Load unpacked":

1. Tải/clone repo này về máy.
2. Mở Chrome, vào địa chỉ `chrome://extensions`.
3. Bật **Developer mode** (góc trên bên phải).
4. Bấm **Load unpacked**, chọn thư mục gốc của repo (thư mục chứa file `manifest.json`).
5. Extension "Coursera Bilingual Transcript" sẽ xuất hiện trên thanh công cụ.

## Cấu hình API key (miễn phí)

1. Lấy Gemini API key miễn phí tại **[Google AI Studio](https://aistudio.google.com/apikey)** (đăng nhập bằng tài khoản Google, bấm "Create API key").
2. Bấm vào **icon extension** trên thanh công cụ Chrome để mở popup cài đặt.
3. Dán API key vào ô **Gemini API key**, có thể tuỳ chỉnh **Model** (mặc định `gemini-2.5-flash`).
4. Bấm **Lưu cài đặt**. Popup sẽ hiện trạng thái "Đã cấu hình API key".

## Cách dùng

1. Vào một bài giảng Coursera bất kỳ có transcript (`coursera.org/learn/.../lecture/...`).
2. Mở panel **Transcript** (nếu chưa mở).
3. Extension tự phát hiện transcript, gọi Gemini dịch toàn bộ sang tiếng Việt (chỉ lần đầu cho mỗi bài, lần sau dùng cache), rồi chèn dòng tiếng Việt bên dưới mỗi câu.
4. Phát video — câu đang được đọc sẽ tự động highlight ở cả 2 dòng Anh/Việt.

Nếu popup báo "Chưa có API key", hoặc trong panel transcript hiện banner nhắc nhở — quay lại bước [Cấu hình API key](#cấu-hình-api-key-miễn-phí) ở trên.

## Cách hoạt động (kỹ thuật)

- **Content script** (`src/content/content.js`) chờ panel transcript của Coursera mount (`div.rc-Transcript`), thu thập toàn bộ câu (`span.rc-Phrase[data-cue]`), gửi sang background để dịch, rồi chèn thêm `<span class="ct-vi-line">` chứa bản dịch làm con của mỗi câu — không đụng tới DOM gốc nên các tương tác có sẵn của Coursera vẫn hoạt động bình thường.
- **Đồng bộ highlight** không cần thêm JavaScript: Coursera tự gắn thuộc tính `data-active="true"` lên câu đang được đọc, extension chỉ cần CSS `[data-active="true"]` để tự động bắt theo — chính xác tuyệt đối theo cơ chế gốc.
- **Background service worker** (`src/background/background.js`) gọi Gemini API với toàn bộ transcript trong một request (giữ ngữ cảnh để dịch mạch lạc, kể cả khi Coursera cắt câu ở giữa), dùng `responseSchema` để ép kết quả trả về đúng định dạng JSON khớp số lượng câu.
- **Popup** (`src/popup/popup.html`) là nơi duy nhất để nhập/xem API key, không mở tab riêng.
- Theo dõi điều hướng SPA của Coursera bằng cách poll `location.href`, tự chạy lại toàn bộ luồng khi chuyển sang bài giảng khác.

## Giới hạn / lưu ý

- Cần API key Gemini hợp lệ; gói miễn phí có giới hạn số request/phút — nếu dịch lỗi, panel sẽ báo và có nút thử lại.
- Chỉ hoạt động trên các trang bài giảng dạng `coursera.org/learn/*/lecture/*` có transcript.
- Bản dịch được cache theo từng bài giảng trong `chrome.storage.local`; xoá cache bằng cách gỡ và cài lại extension, hoặc xoá dữ liệu extension trong `chrome://extensions`.

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
