const MODEL = 'gemini-3.6-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return settings || {};
}

function buildPrompt(phrases) {
  const numbered = phrases.map((t, i) => `${i + 1}. ${t}`).join('\n');
  return `Ban la bien dich vien chuyen dich phu de bai giang tu tieng Anh sang tieng Viet.
Duoi day la transcript mot video bai giang, da bi cat thanh ${phrases.length} doan ngan theo dau ngat cau tu dong (doi khi cat ngay giua cau).

Yeu cau:
1. Doc toan bo transcript theo dung thu tu de hieu tron ven ngu canh/ngu phap cua tung cau day du.
2. Dich sang tieng Viet tu nhien, dung nghia, giu van phong bai giang.
3. Sau do CHIA ban dich tro lai thanh dung ${phrases.length} doan, khop theo cung ranh gioi voi transcript goc ben duoi (doan i cua ban dich tuong ung noi dung doan i tieng Anh, ke ca khi doan do khong phai mot cau tron ven).
4. Tra ve dung ${phrases.length} phan tu trong mang "translations", khong them so thu tu, khong them ghi chu.

Transcript goc:
${numbered}`;
}

async function callGemini(phrases, settings) {
  const url = `${API_BASE}/${MODEL}:generateContent?key=${encodeURIComponent(settings.geminiApiKey)}`;
  const body = {
    contents: [{ parts: [{ text: buildPrompt(phrases) }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          translations: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['translations'],
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API loi ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini khong tra ve noi dung');

  const parsed = JSON.parse(text);
  const translations = parsed.translations;
  if (!Array.isArray(translations)) throw new Error('Dinh dang phan hoi khong hop le');
  return translations;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'TRANSLATE_BATCH') {
    (async () => {
      try {
        const settings = await getSettings();
        if (!settings.geminiApiKey) {
          sendResponse({ ok: false, error: 'Chua cau hinh API key' });
          return;
        }
        const translations = await callGemini(message.phrases, settings);
        if (translations.length !== message.phrases.length) {
          sendResponse({
            ok: false,
            error: `So cau dich (${translations.length}) khong khop (${message.phrases.length})`,
          });
          return;
        }
        sendResponse({ ok: true, translations });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || String(err) });
      }
    })();
    return true;
  }
});

const POPUP_WIDTH = 360;
const POPUP_HEIGHT = 460;
const POPUP_MARGIN = 16;
let popupWindowId = null;

async function openPopupWindow() {
  if (popupWindowId !== null) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch (err) {
      popupWindowId = null;
    }
  }

  let left = 100;
  let top = 100;
  try {
    const current = await chrome.windows.getCurrent();
    const winLeft = current.left ?? 0;
    const winTop = current.top ?? 0;
    const winWidth = current.width ?? 1280;
    const winHeight = current.height ?? 800;
    left = Math.max(0, Math.round(winLeft + winWidth - POPUP_WIDTH - POPUP_MARGIN));
    top = Math.max(0, Math.round(winTop + winHeight - POPUP_HEIGHT - POPUP_MARGIN));
  } catch (err) {
    // giu vi tri mac dinh neu khong lay duoc kich thuoc cua so hien tai
  }

  const created = await chrome.windows.create({
    url: chrome.runtime.getURL('src/popup/popup.html'),
    type: 'popup',
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    left,
    top,
    focused: true,
  });
  popupWindowId = created.id;
}

chrome.windows.onRemoved.addListener((id) => {
  if (id === popupWindowId) popupWindowId = null;
});

chrome.action.onClicked.addListener(() => {
  openPopupWindow();
});
