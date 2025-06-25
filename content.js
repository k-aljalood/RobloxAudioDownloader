// made by: @k_aljalood

(async () => {
  const INTERVAL = 1000;

  const getAudioSource = () => {
    return document.querySelector('audio')?.currentSrc || '';
  };

  const isBlobUrl = (url) => {
    return url.startsWith('blob:');
  };

  const getFileName = () => {
    return document.querySelector('a[href*="/store/asset/"]')?.textContent?.trim() || document.title?.trim() || 'roblox-audio';
  };

  const createDownloadButton = () => {
    const button = document.createElement('button');
    button.className = 'MuiButtonBase-root MuiIconButton-root web-blox-css-tss-ahjimg-IconButton-root-dropdownIconButton MuiIconButton-colorSecondary web-blox-css-tss-3p25jb-IconButton-colorSecondary MuiIconButton-sizeLarge web-blox-css-mui-31x6cl';
    button.setAttribute('aria-label', 'Download audio');
    button.setAttribute('data-testid', 'downloadButton');
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3">
        <g><rect fill="none" height="24" width="24"/></g>
        <g><path d="M5,20h14v-2H5V20z M19,9h-4V3H9v6H5l7,7L19,9z"/></g>
      </svg>
    `;
    button.onclick = async () => handleAudioDownload();
    return button;
  };

  const handleAudioDownload = async () => {
    const audioSource = getAudioSource();
    if (!isBlobUrl(audioSource)) {
      return alert('Audio not available or the link is incorrect.');
    }
    const audioBlob = await (await fetch(audioSource)).blob();
    const downloadLink = createDownloadLink(audioBlob);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  };

  const createDownloadLink = (audioBlob) => {
    return Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(audioBlob),
      download: `${getFileName()}.ogg`,
    });
  };

  const insertDownloadButton = () => {
    const buttonContainer = document.querySelector('div.MuiGrid-root.web-blox-css-tss-1ho07ld-Grid-root-headingButtonRow');
    if (!buttonContainer || buttonContainer.querySelector('[data-testid="downloadButton"]') || !isBlobUrl(getAudioSource())) return;
    const referenceButton = buttonContainer.querySelector('button[data-testid="dropdownButton"]');
    const downloadButton = createDownloadButton();
    if (referenceButton) {
      referenceButton.before(downloadButton);
    } else {
      buttonContainer.appendChild(downloadButton);
    }
  };

  setInterval(insertDownloadButton, INTERVAL);
  insertDownloadButton();
})();
