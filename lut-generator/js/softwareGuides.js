// LUT Generator — per-editor .cube import instructions
// Exact menu names shift between app versions, so these are worded as
// generally-reliable steps rather than pixel-precise screenshots. Where an
// app doesn't support custom LUT import at all, say so plainly instead of
// giving steps that won't work.

const SOFTWARE_GUIDES = {
  resolve: {
    noSupport: false,
    steps: [
      'Open the Color page.',
      'In the LUT panel (bottom-right), right-click → "Open LUT Folder".',
      'Drop the downloaded .cube file into that folder.',
      'Back in Resolve, right-click the LUT panel → "Refresh LUT List".',
      'Right-click your clip → LUT → find it under your file name.'
    ]
  },
  premiere: {
    noSupport: false,
    steps: [
      'Select your clip, open the Lumetri Color panel.',
      'Under the Creative tab, click the Look dropdown → Browse.',
      'Select the downloaded .cube file directly — no install needed.'
    ]
  },
  fcp: {
    noSupport: false,
    steps: [
      'In the Effects Browser, search "Custom LUT" and drag it onto your clip.',
      'Open the Inspector, find the Custom LUT effect, click its LUT dropdown.',
      'Choose Custom → select the downloaded .cube file.',
      'Needs Final Cut Pro 10.4 or later.'
    ]
  },
  capcutDesktop: {
    noSupport: false,
    steps: [
      'Select your clip and open the Adjust/Filters panel.',
      'Look for an "Import" option for custom LUTs — this varies by CapCut version, so it may not be there yet.',
      "If you don't see it, use the settings below instead — match Contrast/Saturation/Tint by hand."
    ]
  },
  capcutMobile: {
    noSupport: true,
    steps: [
      "CapCut's mobile app doesn't support importing custom LUT files.",
      'Use the plain-English settings below instead — dial in Exposure, Contrast, Saturation, and Tint by hand under Adjust.'
    ]
  },
  lightroom: {
    noSupport: false,
    steps: [
      'Close Lightroom first.',
      'Place the .cube file in Lightroom\'s "CameraProfiles/Look" folder (the exact path differs by OS and version — check Adobe\'s docs if you can\'t find it).',
      'Reopen Lightroom, open the Profile browser, find it under your custom profiles.'
    ]
  },
  other: {
    noSupport: false,
    steps: [
      'Most editors that support 3D LUTs accept the standard .cube format through a "Load LUT" or "Import LUT" option in their color panel.',
      "If yours doesn't support LUT files at all, use the plain-English settings below to match the look by hand."
    ]
  }
};

function renderImportGuide(container, softwareKey) {
  const guide = SOFTWARE_GUIDES[softwareKey] || SOFTWARE_GUIDES.other;
  container.classList.toggle('no-support', guide.noSupport);
  const title = guide.noSupport ? "Won't import directly" : 'How to import';
  const stepsHtml = guide.steps.map((step) => `<li>${step}</li>`).join('');
  container.innerHTML = `<p class="import-guide-title">${title}</p><ol class="import-guide-steps">${stepsHtml}</ol>`;
}

window.SoftwareGuides = { SOFTWARE_GUIDES, renderImportGuide };
