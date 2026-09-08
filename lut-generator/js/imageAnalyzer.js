// LUT Generator — reference-media analysis
// Reads a canvas's pixels and derives the structured params the color
// pipeline (colorMath.js) expects. Uses percentile-based statistics rather
// than plain means/std-dev — a handful of blown-out highlight pixels or
// crushed shadow pixels can otherwise skew a simple average hard enough to
// throw off white balance, contrast, and saturation estimates.

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

function clampNum(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function percentile(sortedArr, p) {
  const idx = Math.min(sortedArr.length - 1, Math.max(0, Math.floor(p * (sortedArr.length - 1))));
  return sortedArr[idx];
}

// Analyzes an already-drawn canvas (shared by the image path and the
// video-frame path — both just draw a frame onto a canvas first).
function analyzeCanvas(ctx, w, h) {
  const { data } = ctx.getImageData(0, 0, w, h);
  const pixelCount = data.length / 4;

  const lumaArr = new Float32Array(pixelCount);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    lumaArr[p] = window.ColorMath.luma(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
  }
  const sortedLuma = Float32Array.from(lumaArr).sort();

  const lumaLow = percentile(sortedLuma, 0.05);
  const lumaHigh = percentile(sortedLuma, 0.95);
  const lumaMedian = percentile(sortedLuma, 0.5);
  const lumaP10 = percentile(sortedLuma, 0.1);
  const lumaP90 = percentile(sortedLuma, 0.9);
  const shadowCutoff = percentile(sortedLuma, 0.25);
  const highlightCutoff = percentile(sortedLuma, 0.75);

  let sumR = 0, sumG = 0, sumB = 0, sumS = 0, midCount = 0;
  let shadowH = 0, shadowS = 0, shadowCount = 0;
  let highH = 0, highS = 0, highCount = 0;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const l = lumaArr[p];
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    const { h: hue, s: sat } = rgbToHsl(r, g, b);

    // White balance / tint / saturation: trim the extreme 5% on each end so
    // clipped highlights and crushed shadows (often carrying unreliable or
    // sensor-noise color) don't drag the estimate around.
    if (l >= lumaLow && l <= lumaHigh) {
      sumR += r; sumG += g; sumB += b; sumS += sat; midCount++;
    }

    if (l <= shadowCutoff) { shadowH += hue; shadowS += sat; shadowCount++; }
    else if (l >= highlightCutoff) { highH += hue; highS += sat; highCount++; }
  }

  const denom = Math.max(1, midCount);
  const avgR = sumR / denom, avgG = sumG / denom, avgB = sumB / denom;
  const avgS = sumS / denom;

  const warmCoolBias = avgR - avgB;
  const greenMagentaBias = avgG - (avgR + avgB) / 2;

  const whiteBalanceKelvin = clampNum(6500 + warmCoolBias * 4000, 3000, 10000);
  const tint = clampNum(-greenMagentaBias * 500, -100, 100);

  const targetLuma = 0.45;
  const exposure = clampNum(Math.log2(Math.max(0.02, lumaMedian) / targetLuma), -2, 2);

  const baselineRange = 0.5; // typical 10th-90th luma spread for a normal-contrast photo
  const contrastRange = lumaP90 - lumaP10;
  const contrast = clampNum(((contrastRange - baselineRange) / baselineRange) * 80, -60, 60);

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

// Analyzes an uploaded media object (from MediaLoader.loadMedia) by first
// drawing its current frame onto a small offscreen canvas.
function analyzeMedia(media) {
  const canvas = document.createElement('canvas');
  const ctx = window.MediaLoader.drawMediaToCanvas(media, canvas, 300);
  return analyzeCanvas(ctx, canvas.width, canvas.height);
}

window.ImageAnalyzer = { analyzeMedia, analyzeCanvas };
