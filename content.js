// made by: @k_aljalood

(() => {
  const getMainAudioElement = () => document.querySelector('audio');
  const getAudioPlayers = () => Array.from(document.querySelectorAll('div[data-test-id="audioPlayer"]'));
  const getAudioRow = (player) => player.closest('div[data-testid="audioRow"]');
  const getAudioElement = (player) => player.querySelector('audio');
  const getAudioSource = (audio) => audio?.currentSrc || '';
  const isBlobUrl = (url) => url?.startsWith('blob:');

  const getFileName = (audioRow) =>
    audioRow?.querySelector('span[class*="assetName"]')?.textContent?.trim()
    || document.querySelector('a[href*="/store/asset/"]')?.textContent?.trim()
    || document.title?.trim()
    || 'roblox-audio';

  const createDownloadButton = (audioRow, isSideAudio, referenceButton) => {
    const button = document.createElement('button');

    if (isSideAudio) {
      button.className =
        'MuiButtonBase-root MuiIconButton-root web-blox-css-tss-jxjuu4-IconButton-root-saveIconButton MuiIconButton-colorSecondary web-blox-css-tss-3p25jb-IconButton-colorSecondary MuiIconButton-sizeMedium web-blox-css-mui-1h2q8ec';
      button.setAttribute('aria-label', 'saveButton');
    } else if (referenceButton) {
      button.className = referenceButton.className;
      button.setAttribute('data-testid', 'downloadButton');
    } else {
      button.className =
        'MuiButtonBase-root MuiIconButton-root web-blox-css-tss-ahjimg-IconButton-root-dropdownIconButton MuiIconButton-colorSecondary web-blox-css-tss-3p25jb-IconButton-colorSecondary MuiButtonIconButton-sizeLarge web-blox-css-mui-31x6cl';
      button.setAttribute('data-testid', 'dropdownButton');
    }

    button.type = 'button';
    button.setAttribute('data-testid', 'downloadButton');

    button.innerHTML = `
      <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium web-blox-css-mui-12kqpzp"
        focusable="false"
        aria-hidden="true"
        viewBox="0 -960 960 960">
        <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"></path>
      </svg>
      <span class="MuiTouchRipple-root web-blox-css-mui-w0pj6f"></span>
    `;

    let frameId;

    const updateCursor = () => {
      const audio = audioRow ? audioRow.querySelector('audio') : getMainAudioElement();
      const ready = audio && isBlobUrl(getAudioSource(audio));
      button.style.cursor = ready ? 'pointer' : 'not-allowed';
      if (!ready && button.matches(':hover')) frameId = requestAnimationFrame(updateCursor);
    };

    button.onmouseenter = () => updateCursor();
    button.onmouseleave = () => { cancelAnimationFrame(frameId); button.style.cursor = ''; };

    button.onclick = async () => {
      const audio = audioRow ? audioRow.querySelector('audio') : getMainAudioElement();
      if (!audio || !isBlobUrl(getAudioSource(audio))) return;
      await handleAudioDownload(button, audio, audioRow);
    };

    return button;
  };

  const handleAudioDownload = async (button, audio, audioRow) => {
    const audioSource = getAudioSource(audio);
    button.disabled = true;

    try {
      const response = await fetch(audioSource);
      if (!response.ok) throw new Error();
      const audioBlob = await response.blob();

      const link = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(audioBlob),
        download: `${getFileName(audioRow)}.ogg`,
      });

      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
    } finally { button.disabled = false; }
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
