// LUT Generator — core color-grading math
// A single transform pipeline shared by every input path (uploaded reference
// image today, a text description later) so a look is only ever computed
// one way. Params are plain numbers so they can double as the human-readable
// settings shown next to the download.

const NEUTRAL_KELVIN = 6500;

const DEFAULT_PARAMS = {
  whiteBalanceKelvin: NEUTRAL_KELVIN,
  tint: 0, // -100 (green) .. 100 (magenta)
  exposure: 0, // stops
  contrast: 0, // -100 .. 100
  saturation: 0, // -100 .. 100
  shadows: { hue: 200, amount: 0 }, // amount 0..100
  highlights: { hue: 30, amount: 0 }
};

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

// Approximate white-balance shift — not physically-accurate blackbody math,
// just enough to move the image the direction a Temp/Tint slider would.
function whiteBalanceMultipliers(kelvin, tint) {
  const diff = (kelvin - NEUTRAL_KELVIN) / 100;
  const rMul = 1 + Math.max(0, diff) * 0.007 - Math.max(0, -diff) * 0.004;
  const bMul = 1 - Math.max(0, diff) * 0.004 + Math.max(0, -diff) * 0.007;
  const gMul = 1 - (tint / 100) * 0.05;
  return [rMul, gMul, bMul];
}

function hueToRgb(hueDeg) {
  const h = ((hueDeg % 360) + 360) % 360;
  const c = 1;
  const x = 1 - Math.abs(((h / 60) % 2) - 1);
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [r, g, b];
}

function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Transforms one input pixel (0..1 channels) through the full look pipeline.
function transformPixel(r, g, b, params) {
  const [wbR, wbG, wbB] = whiteBalanceMultipliers(params.whiteBalanceKelvin, params.tint);
  r *= wbR;
  g *= wbG;
  b *= wbB;

  const exposureMul = Math.pow(2, params.exposure);
  r *= exposureMul;
  g *= exposureMul;
  b *= exposureMul;

  const contrastFactor = 1 + params.contrast / 100;
  r = (r - 0.5) * contrastFactor + 0.5;
  g = (g - 0.5) * contrastFactor + 0.5;
  b = (b - 0.5) * contrastFactor + 0.5;

  const l = luma(clamp01(r), clamp01(g), clamp01(b));

  if (params.shadows.amount > 0) {
    const weight = (1 - l) * (params.shadows.amount / 100) * 0.22;
    const [tr, tg, tb] = hueToRgb(params.shadows.hue);
    r += (tr - 0.5) * weight;
    g += (tg - 0.5) * weight;
    b += (tb - 0.5) * weight;
  }

  if (params.highlights.amount > 0) {
    const weight = l * (params.highlights.amount / 100) * 0.22;
    const [tr, tg, tb] = hueToRgb(params.highlights.hue);
    r += (tr - 0.5) * weight;
    g += (tg - 0.5) * weight;
    b += (tb - 0.5) * weight;
  }

  const satFactor = 1 + params.saturation / 100;
  const l2 = luma(r, g, b);
  r = l2 + (r - l2) * satFactor;
  g = l2 + (g - l2) * satFactor;
  b = l2 + (b - l2) * satFactor;

  return [clamp01(r), clamp01(g), clamp01(b)];
}

// Builds a standard 3D .cube LUT (R fastest, then G, then B — per spec).
function generateCubeFile(params, title, size = 33) {
  const lines = [`TITLE "${title.replace(/"/g, "'")}"`, `LUT_3D_SIZE ${size}`, 'DOMAIN_MIN 0.0 0.0 0.0', 'DOMAIN_MAX 1.0 1.0 1.0'];
  const max = size - 1;
  for (let bi = 0; bi < size; bi++) {
    for (let gi = 0; gi < size; gi++) {
      for (let ri = 0; ri < size; ri++) {
        const [r, g, b] = transformPixel(ri / max, gi / max, bi / max, params);
        lines.push(`${r.toFixed(6)} ${g.toFixed(6)} ${b.toFixed(6)}`);
      }
    }
  }
  return lines.join('\n');
}

function kelvinLabel(kelvin) {
  const diff = kelvin - NEUTRAL_KELVIN;
  if (Math.abs(diff) < 150) return `${Math.round(kelvin)}K (neutral)`;
  return diff > 0 ? `${Math.round(kelvin)}K (warm)` : `${Math.round(kelvin)}K (cool)`;
}

function hueName(hueDeg) {
  const h = ((hueDeg % 360) + 360) % 360;
  const names = [
    [15, 'red'], [45, 'orange'], [70, 'yellow'], [160, 'green'],
    [200, 'teal'], [260, 'blue'], [290, 'purple'], [345, 'magenta'], [360, 'red']
  ];
  for (const [max, name] of names) if (h <= max) return name;
  return 'red';
}

// Human-readable settings list shown next to the download, for people who
// want to punch the numbers in manually instead of importing the file.
function describeParams(params) {
  const rows = [
    { label: 'White balance', value: kelvinLabel(params.whiteBalanceKelvin) },
    { label: 'Tint', value: `${params.tint > 0 ? '+' : ''}${Math.round(params.tint)} (${params.tint >= 0 ? 'magenta' : 'green'})` },
    { label: 'Exposure', value: `${params.exposure >= 0 ? '+' : ''}${params.exposure.toFixed(2)} EV` },
    { label: 'Contrast', value: `${params.contrast >= 0 ? '+' : ''}${Math.round(params.contrast)}` },
    { label: 'Saturation', value: `${params.saturation >= 0 ? '+' : ''}${Math.round(params.saturation)}` }
  ];
  if (params.shadows.amount > 2) {
    rows.push({ label: 'Shadow tone', value: `${hueName(params.shadows.hue)} (${Math.round(params.shadows.amount)}%)` });
  }
  if (params.highlights.amount > 2) {
    rows.push({ label: 'Highlight tone', value: `${hueName(params.highlights.hue)} (${Math.round(params.highlights.amount)}%)` });
  }
  return rows;
}

window.ColorMath = { DEFAULT_PARAMS, transformPixel, generateCubeFile, describeParams, clamp01, luma };
