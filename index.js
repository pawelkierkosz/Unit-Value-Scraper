const rp = require('request-promise'); // Wysylanie zadan HTTP i obsluga odpowiedzi
const { JSDOM, VirtualConsole } = require('jsdom');

// Funkcja wyodrębniająca dane produktu (nazwa, cena, RAM) i obliczająca cenę za 1GB RAM
function extractProductInfo(prodEl) {
  // Pobieramy tytuł produktu z linku (a.productLink)
  const linkEl = prodEl.querySelector('a.productLink');
  const title = linkEl ? linkEl.textContent.trim() : 'Brak nazwy';

  // Pobieramy cenę z elementu z klasą .price-new
  const priceEl = prodEl.querySelector('.price-new');
  let cost = null;
  if (priceEl) {
    let priceData = priceEl.getAttribute('data-price');
    if (priceData) {
      cost = parseFloat(priceData);
    } else {
      let priceStr = priceEl.textContent.trim();
      priceStr = priceStr.replace('zł', '').trim().replace(/\s/g, '').replace(',', '.');
      cost = parseFloat(priceStr);
    }
  }

  // Wyciągamy ilość RAM z nazwy produktu (np. "16GB" lub "16 GB")
  const ramMatch = title.match(/(\d+)\s?GB/i);
  const ramAmount = ramMatch ? parseInt(ramMatch[1], 10) : null;

  if (cost && ramAmount) {
    return {
      name: title,
      price: cost,
      ram: ramAmount,
      unitPrice: cost / ramAmount
    };
  }
  return null;
}

(async function() {
  try {
    // Konfiguracja VirtualConsole – ignorujemy komunikaty o problemach z parsowaniem CSS
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('error', (err) => {
      if (!err.message.includes('Could not parse CSS stylesheet')) {
        console.error(err);
      }
    });


    const numPages = parseInt(process.argv[2] || '2', 10);
    const baseUrl = 'https://www.morele.net/kategoria/komputery-stacjonarne-672';

    // Generujemy listę adresów stron:
    // Strona 1 to baseUrl, a kolejne mają format: baseUrl + "/,,,,,,,,0,,,,/{n}/"
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      if (i === 1) {
        pages.push(baseUrl);
      } else {
        pages.push(`${baseUrl}/,,,,,,,,0,,,,/${i}/`);
      }
    }

    let allProducts = [];

    // Iterujemy po wszystkich wygenerowanych stronach
    for (const url of pages) {
      console.log(`Pobieram: ${url}`);
      const html = await rp({
        uri: url,
        headers: {
          'User-Agent': 'Mozilla/5.0' // Zeby morele nie blokowaly
        }
      });

      const dom = new JSDOM(html, { virtualConsole });
      const document = dom.window.document;
      // Zakładamy, że każdy produkt jest opakowany w element z klasą .cat-product-inside
      const prodNodes = document.querySelectorAll('.cat-product-inside');

      prodNodes.forEach(node => {
        const prod = extractProductInfo(node);
        if (prod) {
          allProducts.push(prod);
        }
      });
    }

    // Sortujemy wyniki według ceny za 1GB (rosnąco)
    allProducts.sort((a, b) => a.unitPrice - b.unitPrice);

    // Wyświetlamy ranking w konsoli
    console.log('\nRanking komputerów według ceny za 1GB RAM:\n');
    if (allProducts.length === 0) {
      console.log('Nie znaleziono produktów z odczytaną ceną i/lub RAM.');
    } else {
      allProducts.forEach((prod, index) => {
        console.log(
          `${index + 1}. ${prod.name}\n` +
          `   - Łączna cena: ${prod.price} zł\n` +
          `   - RAM: ${prod.ram} GB\n` +
          `   - Cena za 1GB: ${prod.unitPrice.toFixed(2)} zł\n`
        );
      });
    }
  } catch (error) {
    console.error('Wystąpił błąd podczas scrapowania:', error);
  }
})();
