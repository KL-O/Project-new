// LUT Generator — reference-image analysis
// Reads an uploaded photo's pixels via canvas and derives the same
// structured params the color pipeline (colorMath.js) expects — a
// gray-world white-balance/tint estimate, exposure vs. a neutral target,
// contrast from luma spread, saturation from average HSL, and a shadow/
// highlight color cast for split-toning (the classic teal-orange signature
// comes straight out of this).

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

function analyzeImage(imgEl) {
  const maxDim = 300;
  const scale = Math.min(1, maxDim / Math.max(imgEl.naturalWidth, imgEl.naturalHeight));
  const w = Math.max(1, Math.round(imgEl.naturalWidth * scale));
  const h = Math.max(1, Math.round(imgEl.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgEl, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let sumR = 0, sumG = 0, sumB = 0, sumL = 0, sumS = 0;
  let sqSumL = 0;
  let shadowH = 0, shadowS = 0, shadowCount = 0;
  let highH = 0, highS = 0, highCount = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const l = window.ColorMath.luma(r, g, b);
    const { h: hue, s: sat } = rgbToHsl(r, g, b);

    sumR += r; sumG += g; sumB += b;
    sumL += l; sqSumL += l * l;
    sumS += sat;

    if (l < 0.35) { shadowH += hue; shadowS += sat; shadowCount++; }
    else if (l > 0.65) { highH += hue; highS += sat; highCount++; }
  }

  const avgR = sumR / pixelCount, avgG = sumG / pixelCount, avgB = sumB / pixelCount;
  const avgL = sumL / pixelCount;
  const avgS = sumS / pixelCount;
  const variance = sqSumL / pixelCount - avgL * avgL;
  const stdDevL = Math.sqrt(Math.max(0, variance));

  const warmCoolBias = avgR - avgB; // >0 warm/orange cast, <0 cool/blue cast
  const greenMagentaBias = avgG - (avgR + avgB) / 2; // >0 green cast

  const whiteBalanceKelvin = clampNum(6500 + warmCoolBias * 4000, 3000, 10000);
  const tint = clampNum(-greenMagentaBias * 500, -100, 100);

  const targetLuma = 0.45;
  const exposure = clampNum(Math.log2(Math.max(0.02, avgL) / targetLuma), -2, 2);

  const baselineStdDev = 0.2;
  const contrast = clampNum(((stdDevL - baselineStdDev) / baselineStdDev) * 80, -60, 60);

  const baselineSat = 0.35;
  const saturation = clampNum(((avgS - baselineSat) / baselineSat) * 80, -70, 70);

  const shadows = shadowCount > 0
    ? { hue: shadowH / shadowCount, amount: clampNum((shadowS / shadowCount) * 90, 0, 35) }
    : { hue: 200, amount: 0 };
  const highlights = highCount > 0
    ? { hue: highH / highCount, amount: clampNum((highS / highCount) * 90, 0, 35) }
    : { hue: 30, amount: 0 };

  return { whiteBalanceKelvin, tint, exposure, contrast, saturation, shadows, highlights };
}

function clampNum(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

window.ImageAnalyzer = { analyzeImage };
