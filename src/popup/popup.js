const DEFAULT_MODEL = 'gemini-2.5-flash';

const apiKeyInput = document.getElementById('apiKey');
const modelInput = document.getElementById('model');
const toggleBtn = document.getElementById('toggleKey');
const saveBtn = document.getElementById('save');
const statusMsg = document.getElementById('statusMsg');
const statusBox = document.getElementById('status');
const statusText = document.getElementById('statusText');

function updateStatus(hasKey) {
  statusBox.classList.remove('ok', 'warn');
  if (hasKey) {
    statusBox.classList.add('ok');
    statusText.textContent = 'Đã cấu hình API key';
  } else {
    statusBox.classList.add('warn');
    statusText.textContent = 'Chưa có API key';
  }
}

async function load() {
  const { settings } = await chrome.storage.local.get('settings');
  apiKeyInput.value = settings?.geminiApiKey || '';
  modelInput.value = settings?.geminiModel || DEFAULT_MODEL;
  updateStatus(Boolean(settings?.geminiApiKey));
}

toggleBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  toggleBtn.textContent = isPassword ? 'Ẩn' : 'Hiện';
});

saveBtn.addEventListener('click', async () => {
  const geminiApiKey = apiKeyInput.value.trim();
  const geminiModel = modelInput.value.trim() || DEFAULT_MODEL;
  await chrome.storage.local.set({ settings: { geminiApiKey, geminiModel } });
  updateStatus(Boolean(geminiApiKey));
  statusMsg.textContent = 'Đã lưu!';
  setTimeout(() => {
    statusMsg.textContent = '';
  }, 2000);
});

load();
