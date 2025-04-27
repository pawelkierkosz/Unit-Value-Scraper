```markdown
# Unit-Value Scraper – RAM Price-per-GB Ranking for Morele.net

This Node.js script crawls the desktop-PC category on **Morele.net** and produces a terminal ranking of computers ordered by **price per gigabyte of RAM**.  
It was written for an academic assignment that asked for a “unit value” web-scraper (example: cost per horsepower, cost per square metre, etc.).

---

## Features

* Accepts any number of listing pages via a command-line argument  
* Extracts product name, total price and RAM size from each listing  
* Computes and sorts by unit price (PLN / GB)  
* Skips items that lack price or RAM information  
* Outputs a clear ranking in plain text  
* Uses only two dependencies: `request-promise` and `jsdom`

---

## Requirements

* Node.js 14 or newer  
* Internet connection to reach `morele.net`

---

## Installation
npm install
```

---

## Usage

```bash
node scrape.js 4     # scrape first 4 listing pages
```

If no argument is provided, the script defaults to the first two pages.

Sample output:

```
Ranking komputerów według ceny za 1GB RAM:

1. Lenovo IdeaCentre G5-13IMB
   - Łączna cena: 2899 zł
   - RAM: 16 GB
   - Cena za 1GB: 181.19 zł

2. HP Victus TG02-0017nw
   - Łączna cena: 3599 zł
   - RAM: 16 GB
   - Cena za 1GB: 224.94 zł
```

---

## Configuration

All site-specific selectors and the base URL are defined at the top of `scrape.js`.  
If Morele.net changes its layout, adjust these values accordingly.

---

## Project structure

```
.
├── scrape.js        # main script
└── package.json     # lists dependencies
```

---

## How it works

1. `request-promise` downloads each listing page while sending a desktop browser user-agent.  
2. `jsdom` parses the HTML into an in-memory DOM, enabling standard selectors (`querySelectorAll`).  
3. For every element with class `.cat-product-inside`, the script reads:
   * the anchor with class `productLink` for the title
   * the element with class `price-new` for price (prefers the `data-price` attribute, falls back to text)
   * a regular expression to capture `"XX GB"` in the title
4. The script computes `unitPrice = price / ram`, collects valid products, sorts by `unitPrice`, then prints the ranking.

---

## License

MIT © 2025 <your name>
```
