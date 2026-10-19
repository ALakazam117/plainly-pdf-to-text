# Plainly — PDF do TXT

Gotowa strona do publikacji w GitHub Pages. Wybierz PDF-y, kliknij **Extract text**, a następnie pobierz pliki `.txt` osobno lub razem w archiwum ZIP.

## Publikacja w GitHub Pages

1. Utwórz na swoim koncie publiczne repozytorium, np. `plainly-pdf-to-text`.
2. Umieść zawartość tego folderu w głównym katalogu repozytorium na gałęzi `main`. Plik `index.html` musi znajdować się bezpośrednio w katalogu głównym, obok `app.mjs`, `style.css`, `assets/` i `vendor/`.
3. W repozytorium otwórz **Settings → Pages**.
4. Wybierz **Deploy from a branch**, gałąź **main** i folder **/ (root)**. Kliknij **Save**.
5. Po zakończeniu publikacji GitHub wyświetli adres działającej strony.

Nie wgrywaj samego archiwum ZIP jako pliku strony. Najpierw je rozpakuj. Do przesłania całego folderu najwygodniej użyć GitHub Desktop lub Gita.

Dokumentacja: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Działanie

- Wszystkie pliki bibliotek są dołączone. Nie trzeba instalować zależności ani niczego kompilować.
- PDF-y i hasła do PDF-ów pozostają w przeglądarce. Aplikacja nie przesyła dokumentów na serwer i nie zapisuje ich po odświeżeniu strony.
- Obsługa wielu PDF-ów, podglądu tekstu, schowka, plików TXT w UTF-8 i zbiorczego ZIP-a.
- Do 50 plików, 100 MB na plik i 300 MB na partię.
- Zachowywanie podziałów wierszy i opcjonalne oznaczenia stron.
- Obsługa PDF-ów zabezpieczonych hasłem.
- Skany i zdjęcia wymagają OCR, którego aplikacja nie zawiera. Złożony układ kolumn może wymagać poprawienia tekstu.
- Podgląd jest ograniczony do 500 000 znaków. Pobieranie i kopiowanie obejmuje całość wyodrębnionego tekstu.

## Podgląd lokalny

Nie uruchamiaj aplikacji przez dwukrotne kliknięcie `index.html`: moduły PDF.js wymagają serwera HTTP. Jeśli masz Pythona, w tym folderze uruchom:

```powershell
python -m http.server 8765
```

Następnie otwórz `http://localhost:8765`. Opublikowana strona GitHub Pages nie wymaga Pythona.

## Biblioteki

Mozilla PDF.js 5.6.205 (Apache-2.0), JSZip 3.10.1 (używane na licencji MIT). Teksty licencji znajdują się w folderze `vendor/`.
