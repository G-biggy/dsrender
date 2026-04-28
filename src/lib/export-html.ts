export function downloadPreviewHTML() {
  const preview = document.getElementById('preview-pane');
  if (!preview) return;

  // Extract title from the H1
  const h1 = preview.querySelector('h1');
  const title = h1?.textContent?.trim() || 'Design System';
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Collect Google Font links
  const fontLinks = Array.from(document.querySelectorAll('link[href*="fonts.googleapis.com"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  // Collect all CSS rules from stylesheets
  const cssRules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        cssRules.push(rule.cssText);
      }
    } catch {
      // Cross-origin stylesheet, skip
    }
  }
  const allCSS = cssRules.join('\n');

  // Clone preview content and strip dark: classes for light-mode export
  const clone = preview.cloneNode(true) as HTMLElement;
  stripDarkClasses(clone);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — dsrender</title>
  ${fontLinks}
  <style>
    ${allCSS}
    /* Export overrides */
    body {
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: #FAFAFA !important;
      color: #1F2937 !important;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    html { height: auto !important; }
    body > div { padding: 32px; }
  </style>
</head>
<body>
<div>
${clone.innerHTML}
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function stripDarkClasses(el: HTMLElement) {
  // Remove dark: variant classes so export is always light mode
  const cls = el.getAttribute('class');
  if (cls) {
    const cleaned = cls
      .split(/\s+/)
      .filter((c) => !c.startsWith('dark:'))
      .join(' ');
    el.setAttribute('class', cleaned);
  }
  for (const child of Array.from(el.children)) {
    stripDarkClasses(child as HTMLElement);
  }
}
