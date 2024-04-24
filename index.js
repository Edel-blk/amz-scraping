const express = require('express');
const playwright = require('playwright');
const { chromium } = playwright;

const app = express();
const port = 4321;

app.get("/search/:name", async (req, res) => {
  const productName = req.params.name;
  const searchResults = await searchProductOnAmazon(productName);

  if (searchResults.length > 0) {
    res.json({ results: searchResults });
  } else {
    res.status(404).json({ error: `No se encontraron resultados para "${productName}".` });
  }
});

async function searchProductOnAmazon(productName) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Reemplaza la URL vacía con la URL de búsqueda de Amazon para el producto deseado
  const amazonUrl = `https://www.amazon.com.mx/s?k=${productName}`;
  await page.goto(amazonUrl);

  const products = await page.$$eval('.s-result-item', (items) => {
    return items.map((item) => {
      const titleElement = item.querySelector('.a-text-normal');
      const priceElement = item.querySelector('.a-price .a-offscreen');
      const productTitle = titleElement ? titleElement.textContent.trim() : 'No se encontró el título';
      const productPrice = priceElement ? priceElement.textContent.trim() : 'Precio no disponible';

      // Obtén la URL de la imagen
      const imageElement = item.querySelector('.s-image');
      const imageUrl = imageElement ? imageElement.getAttribute('src') : '';

      return { title: productTitle, price: productPrice, imageUrl };
    });
  });

  await browser.close();

  return products;
}

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
