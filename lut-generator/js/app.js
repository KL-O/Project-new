// LUT Generator — UI wiring

const dropzone = document.getElementById('dropzone');
const dropzoneEmpty = document.getElementById('dropzoneEmpty');
const refFileInput = document.getElementById('refFileInput');
const refPreviewWrap = document.getElementById('refPreviewWrap');
const refPreviewImg = document.getElementById('refPreviewImg');
const selectBox = document.getElementById('selectBox');
const selectHint = document.getElementById('selectHint');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const changeRefBtn = document.getElementById('changeRefBtn');
const refScrub = document.getElementById('refScrub');
const refScrubSlider = document.getElementById('refScrubSlider');

const resultSection = document.getElementById('resultSection');
const previewSourceLabel = document.getElementById('previewSourceLabel');
const uploadOwnPhotoBtn = document.getElementById('uploadOwnPhotoBtn');
const previewFileInput = document.getElementById('previewFileInput');
const previewScrub = document.getElementById('previewScrub');
const previewScrubSlider = document.getElementById('previewScrubSlider');

const beforeCanvas = document.getElementById('beforeCanvas');
const afterCanvas = document.getElementById('afterCanvas');
const compareHandle = document.getElementById('compareHandle');
const compareSlider = document.getElementById('compareSlider');

const settingsList = document.getElementById('settingsList');
const lutNameInput = document.getElementById('lutNameInput');
const softwareSelect = document.getElementById('softwareSelect');
const importGuide = document.getElementById('importGuide');
const downloadBtn = document.getElementById('downloadBtn');
const saveLutBtn = document.getElementById('saveLutBtn');
const resetSlidersBtn = document.getElementById('resetSlidersBtn');

const historySection = document.getElementById('historySection');
const historyGrid = document.getElementById('historyGrid');

const MAX_PREVIEW_WIDTH = 800;
const SOFTWARE_KEY = 'lutGenerator.software';

let refMedia = null;
let previewMedia = null;
let currentParams = null;
let lastAnalyzedParams = null;
let previewRAF = null;
let sampleRegion = null; // { x0, y0, x1, y1 } fractions, or null = whole frame

function cloneParams(p) {
  return { ...p, shadows: { ...p.shadows }, highlights: { ...p.highlights } };
}

// --- Software guide (persisted) ---

const savedSoftware = localStorage.getItem(SOFTWARE_KEY);
if (savedSoftware && window.SoftwareGuides.SOFTWARE_GUIDES[savedSoftware]) {
  softwareSelect.value = savedSoftware;
}
window.SoftwareGuides.renderImportGuide(importGuide, softwareSelect.value);

softwareSelect.addEventListener('change', () => {
  localStorage.setItem(SOFTWARE_KEY, softwareSelect.value);
  window.SoftwareGuides.renderImportGuide(importGuide, softwareSelect.value);
});

// --- Settings readout + sliders ---

function renderSettingsList(params) {
  settingsList.innerHTML = '';
  window.ColorMath.describeParams(params).forEach((row) => {
    const div = document.createElement('div');
    div.className = 'settings-row';
    div.innerHTML = `<span class="settings-row-label">${row.label}</span><span class="settings-row-value">${row.value}</span>`;
    settingsList.appendChild(div);
  });
}

const SLIDER_CONFIG = [
  { el: document.getElementById('sldKelvin'), valEl: document.getElementById('valKelvin'),
    get: () => currentParams.whiteBalanceKelvin, set: (v) => { currentParams.whiteBalanceKelvin = v; },
    format: (v) => `${Math.round(v)}K` },
  { el: document.getElementById('sldTint'), valEl: document.getElementById('valTint'),
    get: () => currentParams.tint, set: (v) => { currentParams.tint = v; },
    format: (v) => `${v >= 0 ? '+' : ''}${Math.round(v)}` },
  { el: document.getElementById('sldExposure'), valEl: document.getElementById('valExposure'),
    get: () => currentParams.exposure, set: (v) => { currentParams.exposure = v; },
    format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} EV` },
  { el: document.getElementById('sldContrast'), valEl: document.getElementById('valContrast'),
    get: () => currentParams.contrast, set: (v) => { currentParams.contrast = v; },
    format: (v) => `${v >= 0 ? '+' : ''}${Math.round(v)}` },
  { el: document.getElementById('sldSaturation'), valEl: document.getElementById('valSaturation'),
    get: () => currentParams.saturation, set: (v) => { currentParams.saturation = v; },
    format: (v) => `${v >= 0 ? '+' : ''}${Math.round(v)}` },
  { el: document.getElementById('sldShadowAmount'), valEl: document.getElementById('valShadowAmount'),
    get: () => currentParams.shadows.amount, set: (v) => { currentParams.shadows.amount = v; },
    format: (v) => `${Math.round(v)}%` },
  { el: document.getElementById('sldShadowHue'), valEl: document.getElementById('valShadowHue'),
    get: () => currentParams.shadows.hue, set: (v) => { currentParams.shadows.hue = v; },
    format: (v) => `${Math.round(v)}°` },
  { el: document.getElementById('sldHighlightAmount'), valEl: document.getElementById('valHighlightAmount'),
    get: () => currentParams.highlights.amount, set: (v) => { currentParams.highlights.amount = v; },
    format: (v) => `${Math.round(v)}%` },
  { el: document.getElementById('sldHighlightHue'), valEl: document.getElementById('valHighlightHue'),
    get: () => currentParams.highlights.hue, set: (v) => { currentParams.highlights.hue = v; },
    format: (v) => `${Math.round(v)}°` }
];

function syncSlidersFromParams() {
  SLIDER_CONFIG.forEach(({ el, valEl, get, format }) => {
    el.value = get();
    valEl.textContent = format(get());
  });
}

SLIDER_CONFIG.forEach(({ el, valEl, set, format }) => {
  el.addEventListener('input', () => {
    const v = parseFloat(el.value);
    set(v);
    valEl.textContent = format(v);
    renderSettingsList(currentParams);
    scheduleRenderPreview();
  });
});

resetSlidersBtn.addEventListener('click', () => {
  if (!lastAnalyzedParams) return;
  currentParams = cloneParams(lastAnalyzedParams);
  syncSlidersFromParams();
  renderSettingsList(currentParams);
  renderComparePreview();
});

// --- Compare preview ---

function scheduleRenderPreview() {
  if (previewRAF) return;
  previewRAF = requestAnimationFrame(() => {
    previewRAF = null;
    renderComparePreview();
  });
}

function renderComparePreview() {
  const media = previewMedia || refMedia;
  if (!media || !currentParams) return;

  const beforeCtx = window.MediaLoader.drawMediaToCanvas(media, beforeCanvas, MAX_PREVIEW_WIDTH);
  afterCanvas.width = beforeCanvas.width;
  afterCanvas.height = beforeCanvas.height;
  const afterCtx = afterCanvas.getContext('2d');

  const imageData = beforeCtx.getImageData(0, 0, beforeCanvas.width, beforeCanvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = window.ColorMath.transformPixel(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255, currentParams);
    data[i] = Math.round(r * 255);
    data[i + 1] = Math.round(g * 255);
    data[i + 2] = Math.round(b * 255);
  }
  afterCtx.putImageData(imageData, 0, 0);
  updateSliderPosition(compareSlider.value);
}

function updateSliderPosition(value) {
  afterCanvas.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  compareHandle.style.left = `${value}%`;
}

compareSlider.addEventListener('input', () => updateSliderPosition(compareSlider.value));

// --- Reference upload (image or video) ---

async function reanalyzeReference() {
  lastAnalyzedParams = window.ImageAnalyzer.analyzeMedia(refMedia, sampleRegion);
  currentParams = cloneParams(lastAnalyzedParams);
  syncSlidersFromParams();
  renderSettingsList(currentParams);
}

async function refreshRefThumbnail() {
  const thumbCanvas = document.createElement('canvas');
  window.MediaLoader.drawMediaToCanvas(refMedia, thumbCanvas, 500);
  refPreviewImg.src = thumbCanvas.toDataURL('image/jpeg', 0.85);
}

async function handleReferenceFile(file) {
  if (!file || !(file.type.startsWith('image/') || file.type.startsWith('video/'))) return;

  const media = await window.MediaLoader.loadMedia(file);
  refMedia = media;
  previewMedia = null;
  previewSourceLabel.textContent = 'your reference';

  sampleRegion = null;
  selectBox.hidden = true;
  clearSelectionBtn.hidden = true;
  selectHint.hidden = false;

  await refreshRefThumbnail();
  refPreviewWrap.hidden = false;
  dropzoneEmpty.hidden = true;
  changeRefBtn.hidden = false;

  if (media.type === 'video') {
    refScrub.hidden = false;
    refScrubSlider.max = media.duration;
    refScrubSlider.value = media.element.currentTime;
  } else {
    refScrub.hidden = true;
  }
  previewScrub.hidden = true;

  await reanalyzeReference();
  renderComparePreview();
  resultSection.hidden = false;
}

dropzone.addEventListener('click', () => refFileInput.click());
dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    refFileInput.click();
  }
});
refFileInput.addEventListener('change', () => handleReferenceFile(refFileInput.files[0]));

changeRefBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  refFileInput.click();
});

['dragenter', 'dragover'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
});
dropzone.addEventListener('drop', (e) => {
  handleReferenceFile(e.dataTransfer.files[0]);
});

let refScrubDebounce;
refScrubSlider.addEventListener('input', () => {
  clearTimeout(refScrubDebounce);
  refScrubDebounce = setTimeout(async () => {
    await window.MediaLoader.seekVideoTo(refMedia.element, parseFloat(refScrubSlider.value));
    await refreshRefThumbnail();
    await reanalyzeReference();
    renderComparePreview();
  }, 150);
});

// --- Drag-select a sample region on the reference (instead of the whole frame) ---

function pointerFraction(e, el) {
  const rect = el.getBoundingClientRect();
  const point = e.touches ? e.touches[0] : e;
  const xFrac = Math.min(1, Math.max(0, (point.clientX - rect.left) / rect.width));
  const yFrac = Math.min(1, Math.max(0, (point.clientY - rect.top) / rect.height));
  return { xFrac, yFrac };
}

function drawSelectBox(a, b) {
  const x0 = Math.min(a.xFrac, b.xFrac) * 100;
  const x1 = Math.max(a.xFrac, b.xFrac) * 100;
  const y0 = Math.min(a.yFrac, b.yFrac) * 100;
  const y1 = Math.max(a.yFrac, b.yFrac) * 100;
  selectBox.style.left = `${x0}%`;
  selectBox.style.top = `${y0}%`;
  selectBox.style.width = `${x1 - x0}%`;
  selectBox.style.height = `${y1 - y0}%`;
}

let dragging = false;
let dragStart = null;

function startSelect(e) {
  if (refPreviewWrap.hidden) return;
  dragging = true;
  dragStart = pointerFraction(e, refPreviewImg);
  selectBox.hidden = false;
  drawSelectBox(dragStart, dragStart);
  e.preventDefault();
}

function moveSelect(e) {
  if (!dragging) return;
  drawSelectBox(dragStart, pointerFraction(e, refPreviewImg));
  e.preventDefault();
}

async function endSelect(e) {
  if (!dragging) return;
  dragging = false;
  const end = pointerFraction(e.changedTouches ? { touches: e.changedTouches } : e, refPreviewImg);
  const x0 = Math.min(dragStart.xFrac, end.xFrac);
  const x1 = Math.max(dragStart.xFrac, end.xFrac);
  const y0 = Math.min(dragStart.yFrac, end.yFrac);
  const y1 = Math.max(dragStart.yFrac, end.yFrac);

  if (x1 - x0 < 0.03 || y1 - y0 < 0.03) {
    // too small to be an intentional drag — treat as clearing the selection
    sampleRegion = null;
    selectBox.hidden = true;
    clearSelectionBtn.hidden = true;
  } else {
    sampleRegion = { x0, y0, x1, y1 };
    clearSelectionBtn.hidden = false;
  }
  await reanalyzeReference();
  renderComparePreview();
}

refPreviewImg.addEventListener('mousedown', startSelect);
window.addEventListener('mousemove', moveSelect);
window.addEventListener('mouseup', endSelect);
refPreviewImg.addEventListener('touchstart', startSelect, { passive: false });
window.addEventListener('touchmove', moveSelect, { passive: false });
window.addEventListener('touchend', endSelect);

clearSelectionBtn.addEventListener('click', async (e) => {
  e.stopPropagation();
  sampleRegion = null;
  selectBox.hidden = true;
  clearSelectionBtn.hidden = true;
  await reanalyzeReference();
  renderComparePreview();
});

// --- Optional secondary preview media ---

uploadOwnPhotoBtn.addEventListener('click', () => previewFileInput.click());
previewFileInput.addEventListener('change', async () => {
  const file = previewFileInput.files[0];
  if (!file || !currentParams || !(file.type.startsWith('image/') || file.type.startsWith('video/'))) return;

  previewMedia = await window.MediaLoader.loadMedia(file);
  previewSourceLabel.textContent = 'your uploaded media';

  if (previewMedia.type === 'video') {
    previewScrub.hidden = false;
    previewScrubSlider.max = previewMedia.duration;
    previewScrubSlider.value = previewMedia.element.currentTime;
  } else {
    previewScrub.hidden = true;
  }
  renderComparePreview();
});

let previewScrubDebounce;
previewScrubSlider.addEventListener('input', () => {
  clearTimeout(previewScrubDebounce);
  previewScrubDebounce = setTimeout(async () => {
    await window.MediaLoader.seekVideoTo(previewMedia.element, parseFloat(previewScrubSlider.value));
    renderComparePreview();
  }, 150);
});

// --- Download ---

function downloadCube(params, name) {
  const cubeContent = window.ColorMath.generateCubeFile(params, name);
  const blob = new Blob([cubeContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^a-z0-9 _-]/gi, '').trim() || 'lut'}.cube`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

downloadBtn.addEventListener('click', () => {
  if (!currentParams) return;
  downloadCube(currentParams, lutNameInput.value.trim() || 'My Custom Look');
});

// --- Saved LUT history ---

function renderHistory() {
  const list = window.LutHistory.getHistory();
  historySection.hidden = list.length === 0;
  historyGrid.innerHTML = '';

  list.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const dateStr = new Date(entry.createdAt).toLocaleDateString();
    card.innerHTML = `
      <img class="history-thumb" src="${entry.thumbnail}" alt="${entry.name}" />
      <div class="history-body">
        <p class="history-name">${entry.name}</p>
        <p class="history-date">${dateStr}</p>
        <div class="history-actions">
          <button class="history-load" type="button">Load</button>
          <button class="history-download" type="button">⬇</button>
          <button class="history-delete" type="button">✕</button>
        </div>
      </div>
    `;

    card.querySelector('.history-load').addEventListener('click', () => {
      currentParams = cloneParams(entry.params);
      lastAnalyzedParams = cloneParams(entry.params);
      lutNameInput.value = entry.name;
      if (entry.software) {
        softwareSelect.value = entry.software;
        localStorage.setItem(SOFTWARE_KEY, entry.software);
        window.SoftwareGuides.renderImportGuide(importGuide, entry.software);
      }
      syncSlidersFromParams();
      renderSettingsList(currentParams);
      if (refMedia) {
        resultSection.hidden = false;
        renderComparePreview();
      }
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    card.querySelector('.history-download').addEventListener('click', () => {
      downloadCube(entry.params, entry.name);
    });

    card.querySelector('.history-delete').addEventListener('click', () => {
      window.LutHistory.deleteHistoryEntry(entry.id);
      renderHistory();
    });

    historyGrid.appendChild(card);
  });
}

saveLutBtn.addEventListener('click', () => {
  if (!currentParams) return;
  const name = lutNameInput.value.trim() || 'My Custom Look';
  const thumbnail = window.LutHistory.makeThumbnail(afterCanvas, 240);
  window.LutHistory.saveHistoryEntry({
    id: `lut-${Date.now()}`,
    name,
    params: cloneParams(currentParams),
    software: softwareSelect.value,
    createdAt: Date.now(),
    thumbnail
  });
  renderHistory();
  saveLutBtn.textContent = '✓ Saved';
  saveLutBtn.classList.add('saved');
  setTimeout(() => {
    saveLutBtn.textContent = '💾 Save';
    saveLutBtn.classList.remove('saved');
  }, 1500);
});

renderHistory();
