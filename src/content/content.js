(() => {
  const TRANSCRIPT_SELECTOR = '.rc-Transcript';
  const PHRASE_SELECTOR = '.rc-Phrase';
  const VI_LINE_CLASS = 'ct-vi-line';
  const BANNER_CLASS = 'ct-banner';

  let lastHref = location.href;
  let mountObserver = null;
  let inflight = false;

  function cacheKey(pathname) {
    return `ct_cache:${pathname}`;
  }

  function waitForElement(selector, timeout = 15000) {
    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }
      const obs = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          clearTimeout(timer);
          resolve(el);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      const timer = setTimeout(() => {
        obs.disconnect();
        resolve(document.querySelector(selector));
      }, timeout);
    });
  }

  function getEnglishText(phraseEl) {
    const span = phraseEl.querySelector('span');
    const raw = span ? span.textContent : phraseEl.textContent || '';
    return raw.replace(/​/g, '').trim();
  }

  function collectPhrases(root) {
    return Array.from(root.querySelectorAll(PHRASE_SELECTOR)).map((el) => ({
      el,
      cue: el.getAttribute('data-cue'),
      text: getEnglishText(el),
    }));
  }

  function injectTranslations(phrases, translations) {
    phrases.forEach((p, i) => {
      if (p.el.querySelector(`.${VI_LINE_CLASS}`)) return;
      const vi = translations[i];
      if (!vi) return;
      const span = document.createElement('span');
      span.className = VI_LINE_CLASS;
      span.textContent = vi;
      p.el.appendChild(span);
    });
  }

  function bannerContainer(root) {
    return root.parentElement || root;
  }

  function showBanner(root, message, onClick) {
    const container = bannerContainer(root);
    removeBanner(root);
    const banner = document.createElement('div');
    banner.className = BANNER_CLASS;
    banner.textContent = message;
    if (onClick) {
      banner.style.cursor = 'pointer';
      banner.addEventListener('click', onClick);
    }
    container.insertBefore(banner, root);
  }

  function removeBanner(root) {
    const container = bannerContainer(root);
    const existing = container.querySelector(`.${BANNER_CLASS}`);
    if (existing) existing.remove();
  }

  async function getSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    return settings || {};
  }

  async function getCache(pathname) {
    const key = cacheKey(pathname);
    const data = await chrome.storage.local.get(key);
    return data[key] || null;
  }

  async function setCache(pathname, value) {
    const key = cacheKey(pathname);
    await chrome.storage.local.set({ [key]: value });
  }

  function translateBatch(texts) {
    return chrome.runtime.sendMessage({ type: 'TRANSLATE_BATCH', phrases: texts });
  }

  async function processTranscript(root) {
    if (inflight) return;
    inflight = true;
    try {
      const phrases = collectPhrases(root);
      if (phrases.length === 0) return;

      const pathname = location.pathname;
      const cached = await getCache(pathname);
      if (cached && cached.translations && cached.translations.length === phrases.length) {
        removeBanner(root);
        injectTranslations(phrases, cached.translations);
        return;
      }

      const settings = await getSettings();
      if (!settings.geminiApiKey) {
        showBanner(root, 'Chua co Gemini API key - bam vao icon tien ich tren thanh cong cu de nhap');
        return;
      }

      showBanner(root, 'Dang dich transcript sang tieng Viet...');
      const texts = phrases.map((p) => p.text);
      const response = await translateBatch(texts);

      if (!response || !response.ok) {
        const reason = response && response.error ? response.error : 'loi khong xac dinh';
        showBanner(root, `Dich that bai: ${reason} - bam de thu lai`, () => {
          removeBanner(root);
          processTranscript(root);
        });
        return;
      }

      removeBanner(root);
      injectTranslations(phrases, response.translations);
      await setCache(pathname, {
        texts,
        translations: response.translations,
        updatedAt: Date.now(),
      });
    } finally {
      inflight = false;
    }
  }

  async function bootstrap() {
    const root = await waitForElement(TRANSCRIPT_SELECTOR);
    if (!root) return;

    await processTranscript(root);

    if (mountObserver) mountObserver.disconnect();
    mountObserver = new MutationObserver(() => {
      processTranscript(root);
    });
    mountObserver.observe(root, { childList: true, subtree: true });
  }

  function watchNavigation() {
    setInterval(() => {
      if (location.href === lastHref) return;
      lastHref = location.href;
      if (mountObserver) {
        mountObserver.disconnect();
        mountObserver = null;
      }
      setTimeout(bootstrap, 500);
    }, 1000);
  }

  bootstrap();
  watchNavigation();
})();
