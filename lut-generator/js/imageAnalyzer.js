// LUT Generator — reference-media analysis
// Reads a canvas's pixels and derives the structured params the color
// pipeline (colorMath.js) expects. Uses percentile-based statistics rather
// than plain means/std-dev — a handful of blown-out highlight pixels or
// crushed shadow pixels can otherwise skew a simple average hard enough to
// throw off white balance, contrast, and saturation estimates.
//
// Two ways to keep the analysis from just grabbing whatever fills the most
// of the frame (a bright sky, a wall behind a subject):
// - No region given: color stats are center-weighted (nearer the middle of
//   the frame counts more), since most reference shots have the subject
//   roughly centered.
// - A region given (user drag-selected a box on the reference): stats are
//   restricted to that box entirely, including the percentile cutoffs —
//   the user is saying "everything I care about is in here."

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
// `region`, if given, is { x0, y0, x1, y1 } as fractions (0-1) of the frame.
function analyzeCanvas(ctx, w, h, region) {
  const { data } = ctx.getImageData(0, 0, w, h);
  const pixelCount = w * h;

  const lumaArr = new Float32Array(pixelCount);
  const weightArr = new Float32Array(pixelCount);
  const inRegionArr = region ? new Uint8Array(pixelCount) : null;

  let idx = 0;
  for (let py = 0; py < h; py++) {
    const yf = (py + 0.5) / h;
    for (let px = 0; px < w; px++, idx++) {
      const i = idx * 4;
      lumaArr[idx] = window.ColorMath.luma(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);

      if (region) {
        const xf = (px + 0.5) / w;
        const inside = xf >= region.x0 && xf <= region.x1 && yf >= region.y0 && yf <= region.y1;
        inRegionArr[idx] = inside ? 1 : 0;
        weightArr[idx] = inside ? 1 : 0;
      } else {
        const xf = (px + 0.5) / w;
        const dx = xf - 0.5, dy = yf - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy) / 0.7071; // 0 at center, ~1 at corners
        weightArr[idx] = 1 / (1 + 2.5 * dist * dist); // soft center-weighting, never fully zero
      }
    }
  }

  // Percentiles: over just the region if one was given, else the whole frame.
  let lumaForPercentiles = lumaArr;
  if (region) {
    const inRegion = [];
    for (let i = 0; i < pixelCount; i++) if (inRegionArr[i]) inRegion.push(lumaArr[i]);
    if (inRegion.length > 0) lumaForPercentiles = inRegion;
  }
  const sortedLuma = Float32Array.from(lumaForPercentiles).sort();

  const lumaLow = percentile(sortedLuma, 0.05);
  const lumaHigh = percentile(sortedLuma, 0.95);
  const lumaMedian = percentile(sortedLuma, 0.5);
  const lumaP10 = percentile(sortedLuma, 0.1);
  const lumaP90 = percentile(sortedLuma, 0.9);
  const shadowCutoff = percentile(sortedLuma, 0.25);
  const highlightCutoff = percentile(sortedLuma, 0.75);

  let sumR = 0, sumG = 0, sumB = 0, sumS = 0, sumW = 0;
  let shadowH = 0, shadowS = 0, shadowW = 0;
  let highH = 0, highS = 0, highW = 0;

  idx = 0;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++, idx++) {
      const weight = weightArr[idx];
      if (weight <= 0) continue;

      const i = idx * 4;
      const l = lumaArr[idx];
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const { h: hue, s: sat } = rgbToHsl(r, g, b);

      if (l >= lumaLow && l <= lumaHigh) {
        sumR += r * weight; sumG += g * weight; sumB += b * weight; sumS += sat * weight; sumW += weight;
      }
      if (l <= shadowCutoff) { shadowH += hue * weight; shadowS += sat * weight; shadowW += weight; }
      else if (l >= highlightCutoff) { highH += hue * weight; highS += sat * weight; highW += weight; }
    }
  }

  const denom = Math.max(1e-6, sumW);
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

  const shadows = shadowW > 0
    ? { hue: shadowH / shadowW, amount: clampNum((shadowS / shadowW) * 90, 0, 35) }
    : { hue: 200, amount: 0 };
  const highlights = highW > 0
    ? { hue: highH / highW, amount: clampNum((highS / highW) * 90, 0, 35) }
    : { hue: 30, amount: 0 };

  return { whiteBalanceKelvin, tint, exposure, contrast, saturation, shadows, highlights };
}

// Analyzes an uploaded media object (from MediaLoader.loadMedia) by first
// drawing its current frame onto a small offscreen canvas. `region` is
// optional, { x0, y0, x1, y1 } as fractions (0-1) of the frame.
function analyzeMedia(media, region) {
  const canvas = document.createElement('canvas');
  const ctx = window.MediaLoader.drawMediaToCanvas(media, canvas, 300);
  return analyzeCanvas(ctx, canvas.width, canvas.height, region);
}

window.ImageAnalyzer = { analyzeMedia, analyzeCanvas };
