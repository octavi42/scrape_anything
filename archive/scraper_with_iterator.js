import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';

chromium.use(stealth());

async function closePopup(page, xpath) {
    await page.locator(`xpath=${xpath}`).click().catch(() => console.log(`Popup not found or already closed: ${xpath}`));
}

async function scrapeProductDetails(page, productSchema) {
    const results = [];
    let i = 1;

    while (true) {
        // Replace iterator placeholder in XPaths
        const titleXPath = productSchema.titleXPath.replace('[i]', `[${i}]`);
        const priceXPath = productSchema.priceXPath.replace('[i]', `[${i}]`);
        const linkXPath = productSchema.linkXPath.replace('[i]', `[${i}]`);

        console.log('Title:', titleXPath);
        console.log('Price:', priceXPath);
        console.log('Link:', linkXPath);

        // Use Promise.all to parallelize the scraping
        const [title, price, link] = await Promise.all([
            page.locator(`xpath=${titleXPath}`).innerText().catch(() => null),
            page.locator(`xpath=${priceXPath}`).innerText().catch(() => null),
            page.locator(`xpath=${linkXPath}`).getAttribute('href').catch(() => null)
        ]);

        console.log('Title:', title);
        console.log('Price:', price);
        console.log('Link:', link);

        // If all fields are null, stop iteration
        if (!title && !price && !link) break;

        // Add the product details to the results if at least one field is found
        if (title || price || link) {
            results.push({ title, price, link });
        }

        i++; // Move to the next item
    }

    return results;
}

export async function scrapeProducts(link, schema) {
    if (!schema || !link) {
        throw new Error('Schema not found');
    }

    const browser = await chromium.launch({ headless: false, executablePath: executablePath() });
    const page = await browser.newPage(); // Wrap page with AgentQL

    try {
        // Go to the URL
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('load');

        // Close the popup if the XPath is defined
        const closeBtnXPath = schema.close_btn;
        if (closeBtnXPath) {
            await closePopup(page, closeBtnXPath);
        }

        // Scrape product details
        const products = {
            titleXPath: schema.products.titleXPath,
            priceXPath: schema.products.priceXPath,
            linkXPath: schema.products.linkXPath
        };

        const productDetails = await scrapeProductDetails(page, products);
        console.log('Scraped Products:', productDetails);

        return productDetails;

    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        // await browser.close();
    }
};


// /html/body/div[1]/div/main/div[6]/div[2]/article[1]/div[1]/a/div[3]/div/h2
// /html/body/div[1]/div/main/div[6]/div[2]/article[1]/div[6]/div/div[1]/a/div[2]/div/h2
// /html/body/div[1]/div/main/div[6]/div[2]/article[1]/div[3]/a/div[2]/div/h2
// /html/body/div[1]/div/main/div[6]/div[2]/article[1]/div[8]/div/a/div[2]/div/h2