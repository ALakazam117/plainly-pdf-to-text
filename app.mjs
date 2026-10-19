import { textFromItems, formatPages, uniqueTextNames } from './text.mjs';

const $ = id => document.getElementById(id);
const records = [];
let selectedId = null, busy = false, stopping = false, activeTask = null;
let passwordContext = null, toastTimer = null, pdfjsPromise = null, zipping = false;
const MAX_FILE = 100 * 1024 * 1024, MAX_TOTAL = 300 * 1024 * 1024, MAX_FILES = 50;
const PREVIEW_LIMIT = 500_000;
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const options = () => ({ keepBreaks: $('keepBreaks').checked, pageLabels: $('pageLabels').checked });
const selected = () => records.find(r => r.id === selectedId);
const ready = () => records.filter(r => r.status === 'done');
const pending = () => records.filter(r => r.status === 'queued' || r.status === 'error');
const outputText = record => formatPages(record.pages, options());
const escapeHTML = value => String(value).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const outputNames = () => uniqueTextNames(records.map(r => r.file.name));
const outputName = record => outputNames()[records.indexOf(record)];

function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5000);
}
function fileSize(bytes) { return bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
function statusLabel(record) {
  if (record.status === 'processing') return record.pageCount ? `Extracting page ${record.donePages + 1} of ${record.pageCount}…` : 'Opening PDF…';
  if (record.status === 'done') return `${record.pageCount} ${record.pageCount === 1 ? 'page' : 'pages'} · Text ready${record.emptyPages ? ` · ${record.emptyPages} without text` : ''}`;
  if (record.status === 'empty') return `${record.pageCount} ${record.pageCount === 1 ? 'page' : 'pages'} · No selectable text`;
  if (record.status === 'error') return record.error;
  return `${fileSize(record.file.size)} · Ready to extract`;
}
function renderList() {
  $('fileCount').textContent = records.length;
  $('fileList').innerHTML = records.map(record => `<li class="file-row${record.id === selectedId ? ' selected' : ''}"><button class="file-select" data-select="${record.id}" aria-pressed="${record.id === selectedId}" title="${escapeHTML(record.file.name)}"><span class="pdf-icon">PDF</span><span class="file-details"><span class="file-name">${escapeHTML(record.file.name)}</span><span class="file-meta${record.status === 'error' ? ' error' : record.status === 'done' ? ' success' : ''}">${escapeHTML(statusLabel(record))}</span></span></button><button class="icon-button" data-remove="${record.id}" aria-label="Remove ${escapeHTML(record.file.name)}" ${busy ? 'disabled' : ''}>${icon('close')}</button></li>`).join('');
  $('clearButton').disabled = !records.length || busy || zipping;
  $('browseButton').disabled = busy;
  $('sampleButton').disabled = busy;
  $('zipButton').disabled = !ready().length || busy || zipping;
  $('zipButton').querySelector('span').textContent = zipping ? 'Preparing…' : ready().length > 1 ? `Download all (${ready().length})` : 'Download all';
  $('convertButton').disabled = !busy && !pending().length;
  $('convertButton').querySelector('span').textContent = busy ? (stopping ? 'Stopping…' : 'Stop extraction') : pending().length && pending().every(r => r.status === 'error') ? 'Retry extraction' : 'Extract text';
  if (busy && stopping) $('convertButton').disabled = true;
  if (!busy) {
    const count = ready().length;
    const errors = records.filter(r => r.status === 'error').length;
    $('batchStatus').textContent = !records.length ? 'Add a PDF to get started' : count ? `${count} ${count === 1 ? 'text file' : 'text files'} ready to download${errors ? ` · ${errors} failed` : ''}` : pending().length ? `${pending().length} ${pending().length === 1 ? 'PDF' : 'PDFs'} waiting for extraction` : 'No selectable text found in these PDFs';
  }
}
function renderPreview() {
  const record = selected();
  const hasText = record?.status === 'done';
  $('previewEmpty').hidden = !!record && record.status !== 'queued';
  $('previewToolbar').hidden = !record || record.status === 'queued';
  $('previewText').hidden = !hasText;
  $('previewMessage').hidden = true;
  $('copyButton').disabled = !hasText;
  $('downloadButton').disabled = !hasText;
  $('previewFilename').textContent = record ? outputName(record) : '';
  if (hasText) {
    const text = outputText(record);
    $('previewText').value = text.slice(0, PREVIEW_LIMIT);
    const words = text.trim().split(/\s+/u).filter(Boolean).length;
    $('textStats').textContent = `${words.toLocaleString()} words · ${text.length.toLocaleString()} characters`;
    const notices = [];
    if (record.emptyPages) notices.push(`${record.emptyPages} of ${record.pageCount} pages have no selectable text. Scanned content needs OCR.`);
    if (text.length > PREVIEW_LIMIT) notices.push('Preview shortened to 500,000 characters. Copy and downloads include all extracted text.');
    if (notices.length) showPreviewMessage(notices.join(' '), false);
  } else {
    $('previewText').value = '';
    $('textStats').innerHTML = `<span class="green-dot"></span>${record?.status === 'processing' ? 'Working on your words…' : 'Ready when you are'}`;
    if (record?.status === 'processing') showPreviewMessage('Extracting text on your device. Your preview will appear when this PDF is ready.', true);
    if (record?.status === 'empty') showPreviewMessage('No selectable text was found. This PDF may contain scanned pages or images. You’ll need an OCR tool to turn those images into text.', true);
    if (record?.status === 'error') showPreviewMessage(`${record.error} Choose another PDF, or try extracting again.`, true);
  }
}
function showPreviewMessage(message, only) {
  $('previewMessage').classList.toggle('only', only);
  $('previewMessage').textContent = message;
  $('previewMessage').hidden = false;
}
function render() { renderList(); renderPreview(); }

function addFiles(files) {
  if (busy) { toast('Wait for extraction to finish, or stop it before adding more files.'); return; }
  let added = 0, duplicate = 0;
  const errors = [];
  for (const file of files) {
    if (!/\.pdf$/i.test(file.name)) { errors.push(`${file.name}: please choose a PDF.`); continue; }
    if (file.size > MAX_FILE) { errors.push(`${file.name}: exceeds 100 MB.`); continue; }
    if (!file.size) { errors.push(`${file.name}: this file is empty.`); continue; }
    if (records.some(r => r.file.name === file.name && r.file.size === file.size && r.file.lastModified === file.lastModified)) { duplicate++; continue; }
    if (records.length >= MAX_FILES) { errors.push('A batch can contain up to 50 PDFs.'); break; }
    if (records.reduce((n, r) => n + r.file.size, 0) + file.size > MAX_TOTAL) { errors.push('This batch exceeds 300 MB. Download and clear some files first.'); break; }
    const record = { id: crypto.randomUUID(), file, status: 'queued', pages: [], pageCount: 0, donePages: 0, emptyPages: 0, error: '' };
    records.push(record); added++;
    if (!selectedId) selectedId = record.id;
  }
  render();
  if (errors.length) toast(errors.slice(0, 2).join(' '));
  else if (duplicate) toast(`${added ? `${added} added. ` : ''}${duplicate} duplicate ${duplicate === 1 ? 'file skipped' : 'files skipped'}.`);
}

async function loadPDFLibrary() {
  if (!pdfjsPromise) pdfjsPromise = import('./vendor/pdf.mjs').then(lib => {
    lib.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.mjs', import.meta.url).href;
    return lib;
  }).catch(error => { pdfjsPromise = null; throw error; });
  return pdfjsPromise;
}
function errorMessage(error) {
  if (error?.name === 'InvalidPDFException') return 'This PDF is damaged or isn’t a valid PDF.';
  if (error?.name === 'PasswordException') return 'This PDF needs a valid password.';
  if (error?.name === 'UnknownErrorException') return 'This PDF could not be read.';
  if (error?.name === 'TypeError') return 'The PDF reader could not load. Refresh the app and try again.';
  return 'Unable to extract text from this PDF.';
}
function closePassword() {
  passwordContext = null;
  $('passwordInput').value = '';
  if ($('passwordDialog').open) $('passwordDialog').close();
}
function cancelPassword() {
  const context = passwordContext;
  closePassword();
  if (context) { context.record.error = 'Password entry was cancelled.'; void context.task.destroy().catch(() => {}); }
}
async function extractAll() {
  if (busy) {
    stopping = true;
    closePassword();
    if (activeTask) void activeTask.destroy().catch(() => {});
    renderList(); return;
  }
  const batch = [...pending()];
  if (!batch.length) return;
  busy = true; stopping = false; render();
  let completed = 0;
  try {
    const pdfjs = await loadPDFLibrary();
    for (const record of batch) {
      if (stopping) break;
      record.status = 'processing'; record.pages = []; record.error = ''; record.donePages = 0; record.pageCount = 0; record.emptyPages = 0;
      selectedId = record.id;
      $('batchStatus').textContent = `PDF ${++completed} of ${batch.length} · Processing on your device`;
      render();
      let task;
      try {
        const data = new Uint8Array(await record.file.arrayBuffer());
        if (stopping) { record.status = 'queued'; break; }
        task = pdfjs.getDocument({ data, isEvalSupported: false, cMapUrl: new URL('./vendor/cmaps/', import.meta.url).href, cMapPacked: true, standardFontDataUrl: new URL('./vendor/standard_fonts/', import.meta.url).href, wasmUrl: new URL('./vendor/wasm/', import.meta.url).href });
        activeTask = task;
        task.onPassword = (updatePassword, reason) => {
          passwordContext = { updatePassword, task, record };
          $('passwordMessage').textContent = reason === pdfjs.PasswordResponses.INCORRECT_PASSWORD ? 'That password didn’t work. Please try again.' : `Enter the password for “${record.file.name}” to extract its text.`;
          $('passwordInput').value = '';
          if (!$('passwordDialog').open) $('passwordDialog').showModal();
          $('passwordInput').focus();
        };
        const pdf = await task.promise;
        record.pageCount = pdf.numPages;
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          if (stopping) break;
          renderList();
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const text = textFromItems(content.items);
          record.pages.push(text);
          if (!text.trim()) record.emptyPages++;
          record.donePages = pageNumber;
          page.cleanup();
        }
        if (stopping) { record.status = 'queued'; record.pages = []; }
        else record.status = record.pages.some(p => p.trim()) ? 'done' : 'empty';
      } catch (error) {
        if (stopping) { record.status = 'queued'; record.pages = []; }
        else { record.status = 'error'; record.error ||= errorMessage(error); }
      } finally {
        closePassword();
        if (task) { try { await task.destroy(); } catch {} }
        activeTask = null;
      }
      render();
    }
  } catch (error) {
    toast('The PDF reader couldn’t start. Refresh this page and try again.');
  } finally {
    busy = false;
    render();
    if (stopping) toast('Extraction stopped. Completed files are ready to download.');
    else if (ready().length) toast(`${ready().length} ${ready().length === 1 ? 'text file is' : 'text files are'} ready. Your words are yours to use.`);
    stopping = false;
  }
}
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
function downloadText() {
  const record = selected();
  if (record?.status !== 'done') return;
  saveBlob(new Blob([outputText(record) + '\n'], { type: 'text/plain;charset=utf-8' }), outputName(record));
}
async function downloadZip() {
  if (zipping || busy || !ready().length) return;
  zipping = true; renderList();
  try {
    if (!window.JSZip) throw new Error('ZIP library unavailable');
    const zip = new window.JSZip();
    ready().forEach(record => zip.file(outputName(record), outputText(record) + '\n'));
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    saveBlob(blob, 'plainly-text-files.zip');
    toast('Your text files have been packaged into a ZIP.');
  } catch { toast('Couldn’t create the ZIP. You can still download each text file individually.'); }
  finally { zipping = false; renderList(); }
}
async function copyText() {
  const record = selected();
  if (record?.status !== 'done') return;
  const text = outputText(record);
  try { await navigator.clipboard.writeText(text); toast('Text copied to your clipboard.'); }
  catch {
    const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch {}
    area.remove();
    toast(copied ? 'Text copied to your clipboard.' : 'Clipboard access was blocked. Select and copy the text from the preview, or download the .txt file.');
  }
}

$('browseButton').addEventListener('click', () => $('fileInput').click());
$('fileInput').addEventListener('change', event => { addFiles([...event.target.files]); event.target.value = ''; });
$('clearButton').addEventListener('click', () => { if (busy || zipping) return; records.length = 0; selectedId = null; render(); });
$('convertButton').addEventListener('click', extractAll);
$('copyButton').addEventListener('click', copyText);
$('downloadButton').addEventListener('click', downloadText);
$('zipButton').addEventListener('click', downloadZip);
$('keepBreaks').addEventListener('change', renderPreview);
$('pageLabels').addEventListener('change', renderPreview);
$('helpButton').addEventListener('click', () => $('helpDialog').showModal());
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => $(button.dataset.closeDialog).close()));
$('passwordCancel').addEventListener('click', cancelPassword);
$('passwordDialog').addEventListener('cancel', event => { event.preventDefault(); cancelPassword(); });
$('passwordForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!passwordContext) return;
  const { updatePassword } = passwordContext;
  const password = $('passwordInput').value;
  closePassword(); updatePassword(password);
});
$('fileList').addEventListener('click', event => {
  const selectButton = event.target.closest('[data-select]');
  const removeButton = event.target.closest('[data-remove]');
  if (selectButton) { selectedId = selectButton.dataset.select; render(); }
  if (removeButton && !busy && !zipping) {
    const index = records.findIndex(r => r.id === removeButton.dataset.remove);
    if (index < 0) return;
    const [removed] = records.splice(index, 1);
    if (selectedId === removed.id) selectedId = records[Math.min(index, records.length - 1)]?.id ?? null;
    render();
  }
});
let dragDepth = 0;
document.addEventListener('dragover', event => { if (event.dataTransfer?.types.includes('Files')) event.preventDefault(); });
document.addEventListener('drop', event => {
  if (!event.dataTransfer?.types.includes('Files')) return;
  event.preventDefault(); dragDepth = 0; $('dropzone').classList.remove('dragover');
  addFiles([...event.dataTransfer.files]);
});
$('dropzone').addEventListener('dragenter', event => { if (event.dataTransfer?.types.includes('Files')) { dragDepth++; $('dropzone').classList.add('dragover'); } });
$('dropzone').addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('dropzone').classList.remove('dragover'); } });
$('sampleButton').addEventListener('click', async () => {
  $('sampleButton').disabled = true;
  try {
    const response = await fetch('./assets/hello-plainly.pdf');
    if (!response.ok) throw new Error('Sample unavailable');
    const blob = await response.blob();
    addFiles([new File([blob], 'hello-plainly.pdf', { type: 'application/pdf', lastModified: 0 })]);
    await extractAll();
  } catch { toast('The sample couldn’t load. You can choose a PDF from your device instead.'); }
  finally { $('sampleButton').disabled = busy; }
});
render();
