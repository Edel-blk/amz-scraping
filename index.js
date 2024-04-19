import { chromium } from "playwright";

const browser = await chromium.launch(
  { headless: true }
);

const page = await browser.newPage();

await page.goto('');

const products = await page.$$eval('', (products) => {
  products.map((product) => {
    console.log('products here')
  })
});