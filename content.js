// made by: @k_aljalood

(() => {
  const DOWNLOAD_TEXTS = {
    en: "Download",
    ar: "تنزيل",
    id: "Unduh",
    de: "Herunterladen",
    es: "Descargar",
    fr: "Télécharger",
    it: "Scarica",
    pl: "Pobierz",
    pt: "Baixar",
    vi: "Tải xuống",
    tr: "İndir",
    hi: "डाउनलोड करें",
    th: "ดาวน์โหลด",
    zh: "下载",
    ja: "ダウンロード",
    ko: "다운로드",
    ms: "Muat turun",
    nb: "Last ned",
    no: "Last ned",
    sr: "Преузми",
    da: "Download",
    et: "Laadi alla",
    fil: "I-download",
    tl: "I-download",
    hr: "Preuzmi",
    lv: "Lejupielādēt",
    lt: "Atsisiųsti",
    hu: "Letöltés",
    nl: "Downloaden",
    ro: "Descarcă",
    sq: "Shkarko",
    sl: "Prenesi",
    sk: "Stiahnuť",
    fi: "Lataa",
    sv: "Ladda ner",
    uk: "Завантажити",
    cs: "Stáhnout",
    el: "Λήψη",
    bs: "Preuzmi",
    bg: "Изтегляне",
    ru: "Скачать",
    kk: "Жүктеп алу",
    bn: "ডাউনলোড",
    si: "බාගන්න",
    my: "ဒေါင်းလုဒ်လုပ်ရန်",
    ka: "ჩამოტვირთვა",
    km: "ទាញយក"
  };

  const getLangCode = () => {
    let code = "";
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      code = htmlLang.toLowerCase().replace("-", "_");
    } else {
      const meta = document.querySelector('meta[name="locale-data"]');
      if (meta) {
        code = (meta.getAttribute("data-language-code") || "").toLowerCase().replace("-", "_");
      }
    }
    return code;
  };

  const getDownloadButtonText = () => {
    const fullCode = getLangCode();
    const baseCode = fullCode.split("_")[0];
    return DOWNLOAD_TEXTS[fullCode] || DOWNLOAD_TEXTS[baseCode] || DOWNLOAD_TEXTS.en;
  };

  const getMainAudioElement = () => document.querySelector("audio");
  const getAudioPlayers = () => Array.from(document.querySelectorAll('div[data-test-id="audioPlayer"], div[data-testid="PLAYWRIGHT_audioPlayer"]'));
  const getAudioRow = (player) => player.closest('div[data-testid="audioRow"], div[data-testid="audioRowDeprecated"]');
  const getAudioElement = (player) => player.querySelector("audio");
  const getAudioSource = (audio) => audio?.currentSrc || audio?.src || "";
  const isBlobUrl = (url) => url?.startsWith("blob:");

  const getChartsContainer = () => document.querySelector('div[class*="1nnmove"]');
  const getChartsName = () =>
    document.querySelector('span[class*="Typography-h6"] + span')?.textContent?.trim()
    || document.querySelector('span[class*="Typography-h6"]')?.nextSibling?.textContent?.trim()
    || document.title?.trim()
    || "roblox-audio";

  const getNewMusicName = () =>
    document.querySelector('[data-testid="music-player"] h2')?.textContent?.trim()
    || document.title?.trim()
    || "roblox-audio";

  const getFileName = (audioRow) =>
    audioRow?.querySelector('span[class*="assetName"]')?.textContent?.trim()
    || document.querySelector('a[href*="/store/asset/"]')?.textContent?.trim()
    || document.title?.trim()
    || "roblox-audio";

  const getAudioExtension = (blob) => {
    const type = blob?.type?.toLowerCase() || "";
    if (type.includes("mpeg") || type.includes("mp3")) return "mp3";
    if (type.includes("wav")) return "wav";
    if (type.includes("mp4") || type.includes("m4a") || type.includes("aac")) return "m4a";
    return "ogg";
  };

  const createDownloadButton = (audioRow, isSideAudio, referenceButton, isCharts) => {
    const button = document.createElement("button");

    if (isCharts) {
      button.className =
        "MuiButtonBase-root MuiIconButton-root web-blox-css-tss-13gs37d-IconButton-root MuiIconButton-colorInherit MuiIconButton-edgeStart MuiIconButton-sizeLarge web-blox-css-mui-d0f6mv";
      button.setAttribute("aria-label", getDownloadButtonText());
    } else if (isSideAudio) {
      button.className =
        "MuiButtonBase-root MuiIconButton-root web-blox-css-tss-jxjuu4-IconButton-root-saveIconButton MuiIconButton-colorSecondary web-blox-css-tss-3p25jb-IconButton-colorSecondary MuiIconButton-sizeMedium web-blox-css-mui-1h2q8ec";
      button.setAttribute("aria-label", "saveButton");
    } else if (referenceButton) {
      button.className = referenceButton.className;
      button.setAttribute("data-testid", "downloadButton");
    } else {
      button.className =
        "MuiButtonBase-root MuiIconButton-root web-blox-css-tss-ahjimg-IconButton-root-dropdownIconButton MuiIconButton-colorSecondary web-blox-css-tss-3p25jb-IconButton-colorSecondary MuiButtonIconButton-sizeLarge web-blox-css-mui-31x6cl";
      button.setAttribute("data-testid", "dropdownButton");
    }

    button.type = "button";
    button.setAttribute("data-testid", isCharts ? "chartsDownloadButton" : "downloadButton");

    button.innerHTML = `
      <svg class="MuiSvgIcon-root ${isCharts ? "MuiSvgIcon-fontSizeLarge web-blox-css-mui-1dnx15j" : "MuiSvgIcon-fontSizeMedium web-blox-css-mui-12kqpzp"}"
        focusable="false"
        aria-hidden="true"
        viewBox="0 -960 960 960">
        <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"></path>
      </svg>
      <span class="MuiTouchRipple-root web-blox-css-mui-w0pj6f"></span>
    `;

    let frameId;

    const updateCursor = () => {
      const audio = audioRow ? audioRow.querySelector("audio") : getMainAudioElement();
      const ready = audio && isBlobUrl(getAudioSource(audio));
      button.style.cursor = ready ? "pointer" : "not-allowed";
      if (!ready && button.matches(":hover")) frameId = requestAnimationFrame(updateCursor);
    };

    button.onmouseenter = () => updateCursor();
    button.onmouseleave = () => { cancelAnimationFrame(frameId); button.style.cursor = ""; };

    button.onclick = async () => {
      const audio = audioRow ? audioRow.querySelector("audio") : getMainAudioElement();
      if (!audio || !isBlobUrl(getAudioSource(audio))) return;
      await handleAudioDownload(button, audio, audioRow, isCharts, false);
    };

    return button;
  };

  const handleAudioDownload = async (button, audio, audioRow, isCharts, isNewMusic) => {
    const audioSource = getAudioSource(audio);
    button.disabled = true;

    try {
      const response = await fetch(audioSource);
      if (!response.ok) throw new Error();
      const audioBlob = await response.blob();
      const extension = getAudioExtension(audioBlob);

      let fileName = "roblox-audio";
      if (isNewMusic) {
        fileName = getNewMusicName();
      } else if (isCharts) {
        fileName = getChartsName();
      } else {
        fileName = getFileName(audioRow);
      }

      const link = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(audioBlob),
        download: `${fileName}.${extension}`,
      });

      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
    } finally {
      button.disabled = false;
    }
  };

  const insertMainButton = () => {
    const mainAudio = getMainAudioElement();
    const container =
      document.querySelector('[data-testid="heading-button-row"]')
      || document.querySelector('div[class*="headingButtonRow"]');

    if (!mainAudio || !container) return;

    const referenceButton = container.querySelector('button[data-testid="dropdownButton"]');
    if (!referenceButton) return;

    let downloadButton = container.querySelector('[data-testid="downloadButton"]');

    if (!downloadButton) {
      downloadButton = createDownloadButton(null, false, referenceButton);
      container.insertBefore(downloadButton, referenceButton.nextSibling);
    } else {
      if (downloadButton !== referenceButton.nextSibling) {
        container.insertBefore(downloadButton, referenceButton.nextSibling);
      }
      downloadButton.className = referenceButton.className;
    }
  };

  const insertSideButtons = () => {
    getAudioPlayers().forEach((player) => {
      const audio = getAudioElement(player);
      const audioRow = getAudioRow(player);
      if (!audio || !audioRow) return;

      const container = audioRow.querySelector('div[class*="controlButtons"]');
      if (!container) return;

      const referenceButton =
        container.querySelector('button[aria-label="saveButton"]')
        || container.querySelector('button.web-blox-css-tss-jxjuu4-IconButton-root-saveIconButton');

      let downloadButton = container.querySelector('[data-testid="downloadButton"]');
      if (!downloadButton) {
        downloadButton = createDownloadButton(audioRow, true, referenceButton);
        if (referenceButton) referenceButton.before(downloadButton);
        else container.prepend(downloadButton);
      }
    });
  };

  const insertChartsButton = () => {
    const container = getChartsContainer();
    if (!container) return;

    if (container.querySelector('[data-testid="chartsDownloadButton"]')) return;

    const wrapper = document.createElement("div");
    wrapper.className = "MuiGrid-root MuiGrid-item web-blox-css-mui-1wxaqej";

    const button = createDownloadButton(null, false, null, true);
    wrapper.appendChild(button);

    container.prepend(wrapper);
  };

  const insertNewMusicButton = () => {
    const container = document.querySelector('[data-testid="music-actions"]');
    if (!container) return;

    const downloadText = getDownloadButtonText();
    let button = container.querySelector('[data-testid="newMusicDownloadButton"]');

    if (button) {
      const textSpan = button.querySelector("span.padding-y-xsmall");
      if (textSpan && textSpan.textContent !== downloadText) {
        textSpan.textContent = downloadText;
      }
      return;
    }

    button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-testid", "newMusicDownloadButton");
    button.className = "foundation-web-button relative clip group/interactable focus-visible:outline-focus disabled:outline-none cursor-pointer relative flex items-center justify-center stroke-none padding-y-none select-none radius-medium text-label-medium height-1000 padding-x-medium bg-action-standard content-action-standard";
    button.style.textDecoration = "none";

    button.innerHTML = `
      <div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none"></div>
      <span class="flex items-center min-width-0 gap-small">
        <svg style="width: 20px; height: 20px; flex-shrink: 0;" focusable="false" aria-hidden="true" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"></path>
        </svg>
        <span class="padding-y-xsmall text-truncate-end text-no-wrap">${downloadText}</span>
      </span>
    `;

    let frameId;

    const updateCursor = () => {
      const audio = document.querySelector('[data-testid="music-player"] audio') || getMainAudioElement();
      const ready = audio && isBlobUrl(getAudioSource(audio));
      button.style.cursor = ready ? "pointer" : "not-allowed";
      if (!ready && button.matches(":hover")) frameId = requestAnimationFrame(updateCursor);
    };

    button.onmouseenter = () => updateCursor();
    button.onmouseleave = () => { cancelAnimationFrame(frameId); button.style.cursor = ""; };

    button.onclick = async () => {
      const audio = document.querySelector('[data-testid="music-player"] audio') || getMainAudioElement();
      if (!audio || !isBlobUrl(getAudioSource(audio))) return;
      await handleAudioDownload(button, audio, null, false, true);
    };

    container.appendChild(button);
  };

  const removeMainButtonIfUnavailable = () => {
    const container =
      document.querySelector('[data-testid="heading-button-row"]')
      || document.querySelector('div[class*="headingButtonRow"]');

    const downloadButton = container?.querySelector('[data-testid="downloadButton"]');
    if (!downloadButton) return;

    if (document.querySelector('[class*="unavailableAudioContainer"]')) {
      downloadButton.remove();
    }
  };

  const insertDownloadButtons = () => {
    insertMainButton();
    insertSideButtons();
    insertChartsButton();
    insertNewMusicButton();
    removeMainButtonIfUnavailable();
  };

  let observerRunning = false;
  const observePage = () => {
    const observer = new MutationObserver(() => {
      if (!observerRunning) {
        observerRunning = true;
        requestAnimationFrame(() => { insertDownloadButtons(); observerRunning = false; });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  observePage();
  insertDownloadButtons();
})();