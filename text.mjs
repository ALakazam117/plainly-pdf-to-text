// Keep the PDF's content-stream reading order. Coordinates help recover line
// endings and spaces; they cannot reconstruct every multi-column layout.
export function textFromItems(items) {
  let result = '', previous = null;
  for (const item of items) {
    if (typeof item.str !== 'string') continue;
    const height = Math.max(Math.hypot(item.transform[2], item.transform[3]), item.height || 0, 1);
    if (previous && item.str) {
      const dy = Math.abs(item.transform[5] - previous.transform[5]);
      const dx = item.transform[4] - (previous.transform[4] + previous.width);
      if (dy > Math.max(height, previous.height || height) * .45 && !result.endsWith('\n')) {
        result += '\n';
      } else if (dy < height * .45 && dx > height * .12 && !/\s$/.test(result) && !/^\s/.test(item.str)) {
        result += ' ';
      }
    }
    result += item.str;
    if (item.hasEOL && !result.endsWith('\n')) result += '\n';
    if (item.str) previous = item;
  }
  return result.replace(/[ \t]+\n/g, '\n').trim();
}

export function formatPages(pages, { keepBreaks = true, pageLabels = false, pageLabel = 'Page' } = {}) {
  return pages.map((text, i) => {
    const body = keepBreaks ? text : text.replace(/\s+/gu, ' ').trim();
    return pageLabels ? `--- ${pageLabel} ${i + 1} ---\n${body}` : body;
  }).join('\n\n').trim();
}

export function uniqueTextNames(names) {
  const used = new Set();
  return names.map(name => {
    let base = name.replace(/\.pdf$/i, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/g, '').trim() || 'document';
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(base)) base = '_' + base;
    // Stay within common filesystem filename limits, including the suffix.
    base = [...base].slice(0, 180).join('');
    let output = `${base}.txt`, n = 2;
    while (used.has(output.toLocaleLowerCase())) output = `${base} (${n++}).txt`;
    used.add(output.toLocaleLowerCase());
    return output;
  });
}
