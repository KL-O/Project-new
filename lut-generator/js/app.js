// LUT Generator — UI wiring

const dropzone = document.getElementById('dropzone');
const dropzoneEmpty = document.getElementById('dropzoneEmpty');
const refFileInput = document.getElementById('refFileInput');
const refPreviewImg = document.getElementById('refPreviewImg');
const changeRefBtn = document.getElementById('changeRefBtn');

const resultSection = document.getElementById('resultSection');
const previewSourceLabel = document.getElementById('previewSourceLabel');
const uploadOwnPhotoBtn = document.getElementById('uploadOwnPhotoBtn');
const previewFileInput = document.getElementById('previewFileInput');

const beforeCanvas = document.getElementById('beforeCanvas');
const afterCanvas = document.getElementById('afterCanvas');
const compareFrame = document.getElementById('compareFrame');
const compareHandle = document.getElementById('compareHandle');
const compareSlider = document.getElementById('compareSlider');

const settingsList = document.getElementById('settingsList');
const lutNameInput = document.getElementById('lutNameInput');
const downloadBtn = document.getElementById('downloadBtn');

const MAX_PREVIEW_WIDTH = 800;

let currentParams = null;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function renderSettingsList(params) {
  settingsList.innerHTML = '';
  window.ColorMath.describeParams(params).forEach((row) => {
    const div = document.createElement('div');
    div.className = 'settings-row';
    div.innerHTML = `<span class="settings-row-label">${row.label}</span><span class="settings-row-value">${row.value}</span>`;
    settingsList.appendChild(div);
  });
}

function drawScaled(imgEl, canvas) {
  const scale = Math.min(1, MAX_PREVIEW_WIDTH / imgEl.naturalWidth);
  const w = Math.round(imgEl.naturalWidth * scale);
  const h = Math.round(imgEl.naturalHeight * scale);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0, w, h);
  return ctx;
}

function renderComparePreview(imgEl, params) {
  const beforeCtx = drawScaled(imgEl, beforeCanvas);
  afterCanvas.width = beforeCanvas.width;
  afterCanvas.height = beforeCanvas.height;
  const afterCtx = afterCanvas.getContext('2d');

  const imageData = beforeCtx.getImageData(0, 0, beforeCanvas.width, beforeCanvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = window.ColorMath.transformPixel(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255, params);
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

async function handleReferenceFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const img = await loadImageFromFile(file);

  refPreviewImg.src = img.src;
  refPreviewImg.hidden = false;
  dropzoneEmpty.hidden = true;
  changeRefBtn.hidden = false;

  currentParams = window.ImageAnalyzer.analyzeImage(img);
  renderSettingsList(currentParams);
  renderComparePreview(img, currentParams);
  previewSourceLabel.textContent = 'your reference image';
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
  const file = e.dataTransfer.files[0];
  handleReferenceFile(file);
});

uploadOwnPhotoBtn.addEventListener('click', () => previewFileInput.click());
previewFileInput.addEventListener('change', async () => {
  const file = previewFileInput.files[0];
  if (!file || !currentParams) return;
  const img = await loadImageFromFile(file);
  renderComparePreview(img, currentParams);
  previewSourceLabel.textContent = 'your uploaded photo';
});

downloadBtn.addEventListener('click', () => {
  if (!currentParams) return;
  const name = lutNameInput.value.trim() || 'My Custom Look';
  const cubeContent = window.ColorMath.generateCubeFile(currentParams, name);
  const blob = new Blob([cubeContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/[^a-z0-9 _-]/gi, '').trim() || 'lut'}.cube`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
