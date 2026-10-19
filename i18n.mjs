const STORAGE_KEY = 'plainly-language';
let language = 'pl';
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'pl' || saved === 'en') language = saved;
} catch { /* Language selection also works when browser storage is unavailable. */ }

const pluralPL = (number, one, few, many) => {
  const category = new Intl.PluralRules('pl').select(number);
  return category === 'one' ? one : category === 'few' ? few : many;
};
export const getLanguage = () => language;
export const locale = () => language === 'pl' ? 'pl-PL' : 'en-US';
const number = value => value.toLocaleString(locale());

const messages = {
  pl: {
    pageTitle: 'Plainly — PDF na tekst',
    description: 'Zamień pliki PDF na zwykły tekst. Wyodrębniaj, przeglądaj, kopiuj i pobieraj pliki tekstowe prywatnie w swojej przeglądarce.',
    languageLabel: 'Język interfejsu', homeLabel: 'Plainly — strona główna', browserOnly: 'Wszystko w Twojej przeglądarce',
    howItWorks: 'Jak to działa', eyebrow: 'PDF NA TEKST. PO PROSTU.', headlineFirst: 'Z PDF.', headlineSecond: 'Do tekstu.',
    subtitleFirst: 'Twój tekst, bez ograniczeń dokumentu.', subtitleSecond: 'Zamień PDF-y w edytowalne pliki .txt w kilku kliknięciach.',
    privacyTitle: 'Twoje pliki zostają u Ciebie.', privacyLine1: 'Przetwarzanie na Twoim urządzeniu.', privacyLine2: 'Nic nie trafia na serwer.',
    converterLabel: 'Konwerter PDF na tekst', yourPdfs: 'Twoje PDF-y', clearAll: 'Wyczyść',
    dropTitle: 'Upuść tutaj pliki PDF', dropSubtitle: 'lub wybierz je ze swojego urządzenia', chooseFiles: 'Wybierz pliki PDF',
    fileLimit: 'Wiele plików · do 100 MB każdy', sampleIntro: 'Chcesz sprawdzić, jak to działa?', trySample: 'Wypróbuj przykład',
    filesLabel: 'Wybrane pliki PDF', textOptions: 'OPCJE TEKSTU', keepBreaks: 'Zachowaj podziały wierszy',
    keepBreaksHint: 'Zachowaj końce wierszy wykryte na każdej stronie PDF.', pageNumbers: 'Dodaj numery stron',
    extract: 'Wyodrębnij tekst', retry: 'Spróbuj ponownie', stop: 'Zatrzymaj', stopping: 'Zatrzymywanie…',
    addPdf: 'Dodaj PDF, aby rozpocząć', previewTitle: 'Podgląd tekstu', copyText: 'Kopiuj tekst',
    emptyTitle: 'Nowe miejsce dla Twojego tekstu.', emptyLine1: 'Dodaj PDF i wyodrębnij tekst.', emptyLine2: 'Wynik pojawi się właśnie tutaj.',
    emptyCaption: 'Mniej formatowania. Więcej możliwości.', previewLabel: 'Podgląd wyodrębnionego tekstu',
    idle: 'Wszystko gotowe do pracy', working: 'Pracujemy nad Twoim tekstem…', downloadTxt: 'Pobierz .txt', downloadAll: 'Pobierz wszystko',
    preparing: 'Przygotowywanie…', downloadCount: ({ count }) => `Pobierz wszystko (${count})`,
    privacyFooter: 'Prywatność od podstaw. Dokumenty pozostają w tej przeglądarce.', encodingNote: 'Tekst UTF-8 · Oryginalne nazwy plików',
    goodToKnow: 'Warto wiedzieć', tipsTitle: 'Kilka słów o plikach PDF',
    tipsText: 'Obsługuje PDF-y z tekstem, który można zaznaczyć. Skany i zdjęcia wymagają OCR — ta funkcja nie jest dostępna. Tekst z wielu kolumn może wymagać uporządkowania.',
    tipsTag: 'WARTO WIEDZIEĆ', footerTagline: 'Mniej przeszkód. Więcej swobody.', licenses: 'Licencje open source',
    helpTitle: 'Od PDF-a do zwykłego tekstu', closeHelp: 'Zamknij pomoc', helpStep1: 'Wybierz pliki PDF',
    helpText1: 'Upuść do 50 plików lub kliknij „Wybierz pliki PDF”. Każdy plik może mieć do 100 MB, a cała partia — do 300 MB.',
    helpStep2: 'Wyodrębnij i sprawdź tekst', helpText2: 'Kliknij „Wyodrębnij tekst”, a następnie wybierz plik, aby zobaczyć wynik. W każdej chwili możesz zmienić podziały wierszy lub oznaczenia stron.',
    helpStep3: 'Zapisz swój tekst', helpText3: 'Skopiuj tekst, pobierz jeden plik .txt lub wszystkie wyniki razem w archiwum ZIP. Pliki tekstowe są zapisywane w UTF-8.',
    helpNote: 'Pliki są przetwarzane w tej przeglądarce i nie są zapisywane przez aplikację. Pobierz wyniki przed zamknięciem lub odświeżeniem strony. Skany wymagają OCR — ta funkcja nie jest dostępna.',
    gotIt: 'Rozumiem', passwordTitle: 'Ten PDF jest zabezpieczony', cancelPassword: 'Anuluj wpisywanie hasła', passwordLabel: 'Hasło do PDF-a',
    unlock: 'Odblokuj PDF', passwordNote: 'Hasło pozostaje w tej przeglądarce i jest usuwane po użyciu.',
    enableJs: 'Włącz JavaScript, aby wyodrębniać tekst z PDF-ów w swojej przeglądarce.',
    pageLabel: 'Strona', openingPdf: 'Otwieranie PDF-a…', extractingPage: ({ current, total }) => `Wyodrębnianie strony ${current} z ${total}…`,
    pages: ({ count }) => `${count} ${pluralPL(count, 'strona', 'strony', 'stron')}`,
    textReady: 'Tekst gotowy', pagesWithoutText: ({ count }) => `bez tekstu: ${count}`, noSelectableText: 'Brak tekstu do zaznaczenia', queued: 'Gotowy do wyodrębnienia',
    removeFile: ({ name }) => `Usuń ${name}`,
    readyFiles: ({ count, errors }) => `${count} ${pluralPL(count, 'plik tekstowy gotowy', 'pliki tekstowe gotowe', 'plików tekstowych gotowych')} do pobrania${errors ? ` · błędy: ${errors}` : ''}`,
    waitingFiles: ({ count }) => `${count} ${pluralPL(count, 'PDF czeka', 'PDF-y czekają', 'PDF-ów czeka')} na wyodrębnienie`,
    noTextInBatch: 'W tych PDF-ach nie znaleziono tekstu do zaznaczenia',
    stats: ({ words, characters }) => `${number(words)} ${pluralPL(words, 'słowo', 'słowa', 'słów')} · ${number(characters)} ${pluralPL(characters, 'znak', 'znaki', 'znaków')}`,
    missingPages: ({ count, total }) => `Strony bez tekstu do zaznaczenia: ${count} z ${total}. Skany wymagają OCR.`,
    previewTruncated: 'Podgląd ograniczono do 500 000 znaków. Kopiowanie i pobieranie obejmuje cały wyodrębniony tekst.',
    processingMessage: 'Wyodrębnianie tekstu na Twoim urządzeniu. Podgląd pojawi się po zakończeniu pracy nad tym PDF-em.',
    emptyMessage: 'Nie znaleziono tekstu do zaznaczenia. Ten PDF może zawierać skany lub obrazy. Do zamiany takich obrazów na tekst potrzebne jest narzędzie OCR.',
    retryHint: 'Wybierz inny PDF lub spróbuj ponownie wyodrębnić tekst.',
    waitBeforeAdding: 'Zaczekaj na zakończenie wyodrębniania lub zatrzymaj je, zanim dodasz kolejne pliki.',
    invalidExtension: ({ name }) => `${name}: wybierz plik PDF.`, tooLarge: ({ name }) => `${name}: przekracza limit 100 MB.`,
    emptyFile: ({ name }) => `${name}: ten plik jest pusty.`, tooManyFiles: 'Jedna partia może zawierać do 50 PDF-ów.',
    totalTooLarge: 'Ta partia przekracza limit 300 MB. Najpierw pobierz wyniki i usuń część plików.',
    fileErrors: ({ errors }) => errors.slice(0, 2).map(error => t(error.key, error.params)).join(' '),
    duplicates: ({ added, duplicate }) => `${added ? `Dodano: ${added}. ` : ''}Pominięte duplikaty: ${duplicate}.`,
    errorInvalid: 'Ten PDF jest uszkodzony lub ma nieprawidłowy format.', errorPassword: 'Ten PDF wymaga poprawnego hasła.', errorUnknown: 'Nie udało się odczytać tego PDF-a.',
    errorReader: 'Nie udało się wczytać czytnika PDF. Odśwież aplikację i spróbuj ponownie.', errorExtract: 'Nie udało się wyodrębnić tekstu z tego PDF-a.',
    passwordCancelled: 'Wpisywanie hasła anulowano.', passwordIncorrect: 'To hasło nie zadziałało. Spróbuj ponownie.',
    passwordPrompt: ({ name }) => `Wpisz hasło do pliku „${name}”, aby wyodrębnić jego tekst.`,
    readerStarting: 'Uruchamianie czytnika PDF…', batchProgress: ({ current, total }) => `PDF ${current} z ${total} · Przetwarzanie na Twoim urządzeniu`,
    readerFailed: 'Nie udało się uruchomić czytnika PDF. Odśwież stronę i spróbuj ponownie.',
    stopped: 'Wyodrębnianie zatrzymano. Ukończone pliki są gotowe do pobrania.',
    completed: ({ count }) => `Gotowe pliki tekstowe: ${count}. Możesz je pobrać lub skopiować.`,
    zipFilename: 'plainly-pliki-tekstowe.zip', zipReady: 'Twoje pliki tekstowe zostały spakowane do ZIP-a.',
    zipFailed: 'Nie udało się utworzyć ZIP-a. Nadal możesz pobrać każdy plik tekstowy osobno.', copied: 'Tekst skopiowano do schowka.',
    clipboardBlocked: 'Dostęp do schowka został zablokowany. Zaznacz i skopiuj tekst z podglądu lub pobierz plik .txt.',
    sampleFailed: 'Nie udało się wczytać przykładu. Zamiast tego możesz wybrać PDF ze swojego urządzenia.'
  },
  en: {
    pageTitle: 'Plainly — PDF to text', description: 'Turn your PDFs into plain text. Extract, preview, copy, and download text files privately in your browser.',
    languageLabel: 'Interface language', homeLabel: 'Plainly home', browserOnly: 'A browser-only workspace', howItWorks: 'How it works',
    eyebrow: 'PDF TO TEXT, SIMPLIFIED', headlineFirst: 'PDFs in.', headlineSecond: 'Text out.',
    subtitleFirst: 'Your words, freed from the document.', subtitleSecond: 'Turn PDFs into clean, editable .txt files in a few clicks.',
    privacyTitle: 'Your files stay yours.', privacyLine1: 'Processed on your device.', privacyLine2: 'Nothing sent to a server.',
    converterLabel: 'PDF to text converter', yourPdfs: 'Your PDFs', clearAll: 'Clear all', dropTitle: 'Drop your PDFs here',
    dropSubtitle: 'or choose them from your device', chooseFiles: 'Choose PDF files', fileLimit: 'Multiple files · up to 100 MB each',
    sampleIntro: 'Just looking around?', trySample: 'Try a sample', filesLabel: 'Selected PDF files', textOptions: 'TEXT OPTIONS',
    keepBreaks: 'Keep line breaks', keepBreaksHint: 'Retain line endings detected in each PDF page.', pageNumbers: 'Add page numbers',
    extract: 'Extract text', retry: 'Retry extraction', stop: 'Stop extraction', stopping: 'Stopping…', addPdf: 'Add a PDF to get started',
    previewTitle: 'Text preview', copyText: 'Copy text', emptyTitle: 'A fresh start for your text.', emptyLine1: 'Add a PDF and extract its text.',
    emptyLine2: 'Your words will appear right here.', emptyCaption: 'Less formatting. More possibilities.', previewLabel: 'Extracted text preview',
    idle: 'Ready when you are', working: 'Working on your words…', downloadTxt: 'Download .txt', downloadAll: 'Download all', preparing: 'Preparing…',
    downloadCount: ({ count }) => `Download all (${count})`, privacyFooter: 'Private by design. Your documents never leave this browser.',
    encodingNote: 'UTF-8 text · Original filenames', goodToKnow: 'Good to know', tipsTitle: 'A small note about PDFs',
    tipsText: 'Works with PDFs that contain selectable text. Scanned pages and photos need OCR, which isn’t included. Complex columns may need a little tidying.',
    tipsTag: 'GOOD TO KNOW', footerTagline: 'Less friction. More flow.', licenses: 'Open-source licenses', helpTitle: 'From PDF to plain text',
    closeHelp: 'Close help', helpStep1: 'Choose your PDFs', helpText1: 'Drop in up to 50 files, or use “Choose PDF files”. Each file can be up to 100 MB, with 300 MB total per batch.',
    helpStep2: 'Extract and preview', helpText2: 'Click “Extract text”, then choose a file to see its text. Adjust line breaks or page numbers at any time.',
    helpStep3: 'Take your text with you', helpText3: 'Copy it, download one .txt file, or download all results together in a ZIP. All text files use UTF-8.',
    helpNote: 'Your files are processed in this browser and aren’t saved by the app. Download your results before closing or refreshing the page. Scanned pages need OCR, which isn’t included.',
    gotIt: 'Got it', passwordTitle: 'This PDF is locked', cancelPassword: 'Cancel password entry', passwordLabel: 'PDF password', unlock: 'Unlock PDF',
    passwordNote: 'The password stays in this browser and is discarded after use.', enableJs: 'Please enable JavaScript to extract text from PDFs in your browser.',
    pageLabel: 'Page', openingPdf: 'Opening PDF…', extractingPage: ({ current, total }) => `Extracting page ${current} of ${total}…`,
    pages: ({ count }) => `${count} ${count === 1 ? 'page' : 'pages'}`, textReady: 'Text ready', pagesWithoutText: ({ count }) => `${count} without text`,
    noSelectableText: 'No selectable text', queued: 'Ready to extract', removeFile: ({ name }) => `Remove ${name}`,
    readyFiles: ({ count, errors }) => `${count} ${count === 1 ? 'text file' : 'text files'} ready to download${errors ? ` · ${errors} failed` : ''}`,
    waitingFiles: ({ count }) => `${count} ${count === 1 ? 'PDF' : 'PDFs'} waiting for extraction`, noTextInBatch: 'No selectable text found in these PDFs',
    stats: ({ words, characters }) => `${number(words)} words · ${number(characters)} characters`,
    missingPages: ({ count, total }) => `${count} of ${total} pages have no selectable text. Scanned content needs OCR.`,
    previewTruncated: 'Preview shortened to 500,000 characters. Copy and downloads include all extracted text.',
    processingMessage: 'Extracting text on your device. Your preview will appear when this PDF is ready.',
    emptyMessage: 'No selectable text was found. This PDF may contain scanned pages or images. You’ll need an OCR tool to turn those images into text.',
    retryHint: 'Choose another PDF, or try extracting again.', waitBeforeAdding: 'Wait for extraction to finish, or stop it before adding more files.',
    invalidExtension: ({ name }) => `${name}: please choose a PDF.`, tooLarge: ({ name }) => `${name}: exceeds 100 MB.`, emptyFile: ({ name }) => `${name}: this file is empty.`,
    tooManyFiles: 'A batch can contain up to 50 PDFs.', totalTooLarge: 'This batch exceeds 300 MB. Download and clear some files first.',
    fileErrors: ({ errors }) => errors.slice(0, 2).map(error => t(error.key, error.params)).join(' '),
    duplicates: ({ added, duplicate }) => `${added ? `${added} added. ` : ''}${duplicate} duplicate ${duplicate === 1 ? 'file skipped' : 'files skipped'}.`,
    errorInvalid: 'This PDF is damaged or isn’t a valid PDF.', errorPassword: 'This PDF needs a valid password.', errorUnknown: 'This PDF could not be read.',
    errorReader: 'The PDF reader could not load. Refresh the app and try again.', errorExtract: 'Unable to extract text from this PDF.',
    passwordCancelled: 'Password entry was cancelled.', passwordIncorrect: 'That password didn’t work. Please try again.',
    passwordPrompt: ({ name }) => `Enter the password for “${name}” to extract its text.`, readerStarting: 'Starting the PDF reader…',
    batchProgress: ({ current, total }) => `PDF ${current} of ${total} · Processing on your device`,
    readerFailed: 'The PDF reader couldn’t start. Refresh this page and try again.', stopped: 'Extraction stopped. Completed files are ready to download.',
    completed: ({ count }) => `${count} ${count === 1 ? 'text file is' : 'text files are'} ready. Your words are yours to use.`,
    zipFilename: 'plainly-text-files.zip', zipReady: 'Your text files have been packaged into a ZIP.', zipFailed: 'Couldn’t create the ZIP. You can still download each text file individually.',
    copied: 'Text copied to your clipboard.', clipboardBlocked: 'Clipboard access was blocked. Select and copy the text from the preview, or download the .txt file.',
    sampleFailed: 'The sample couldn’t load. You can choose a PDF from your device instead.'
  }
};

export function t(key, params = {}) {
  const value = messages[language][key];
  if (value === undefined) throw new Error(`Missing translation: ${language}.${key}`);
  return typeof value === 'function' ? value(params) : value;
}

export function applyTranslations() {
  document.documentElement.lang = language;
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]').content = t('description');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-title]').forEach(node => { node.title = t(node.dataset.i18nTitle); });
  document.getElementById('languageSelect').value = language;
}

export function setLanguage(next) {
  if (next !== 'pl' && next !== 'en') return;
  language = next;
  try { localStorage.setItem(STORAGE_KEY, language); } catch {}
  applyTranslations();
}
