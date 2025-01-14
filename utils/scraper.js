import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

chromium.use(stealth());

async function closePopup(page, xpath) {
  await page.locator(`xpath=${xpath}`).click().catch(() => {
    console.log(`Popup not found or already closed: ${xpath}`);
  });
}

async function scrapeProductDetails(page, productSchema) {
  const results = [];

  // Scroll to the bottom of the page to load all products
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  const products = productSchema.products;
  for (const product of products) {
    const title = await page.locator(`xpath=${product.titleXPath}`).innerText().catch(() => null);
    const price = await page.locator(`xpath=${product.priceXPath}`).innerText().catch(() => null);
    const link = await page.locator(`xpath=${product.linkXPath}`).getAttribute('href').catch(() => null);

    results.push({ title, price, link });
    console.log('Product:', { title, price, link });
  }

  return results;
}

export async function scrapeProducts(link, schema) {
  if (!schema || !link) {
    throw new Error('Schema not found');
  }

  const proxyServer = process.env.PROXY_SERVER;
  const proxyUsername = process.env.PROXY_USERNAME;
  const proxyPassword = process.env.PROXY_PASSWORD;

  const browser = await chromium.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    executablePath: executablePath(),
    proxy: {
      server: proxyServer,
      username: proxyUsername,
      password: proxyPassword,
    },
  });

  const page = await browser.newPage();

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');

    // Close popup if defined
    const closeBtnXPath = schema.close_btn;
    if (closeBtnXPath) {
      await closePopup(page, closeBtnXPath);
      await page.waitForTimeout(1000); // Wait for the popup to close
    }

    const productDetails = await scrapeProductDetails(page, schema);
    console.log('Scraped Products:', productDetails);

    return productDetails;
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
};