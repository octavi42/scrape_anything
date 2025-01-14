import { executablePath } from 'puppeteer';
import { configure, wrap } from 'agentql'; // Hypothetical library for AgentQL
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { xPath } from 'playwright-DOMPath';
import fs from 'fs';
import dotenv from 'dotenv';
import { extractWebLink } from './url.js';

dotenv.config();

const stealthPlugin = stealth();
chromium.use(stealthPlugin);

// Replace with your actual API key or credentials
configure({ apiKey: process.env.AGENTQL_API_KEY });

const QUERY = `
{
  products(List all the products on the page)[] {
    productTitle(Name of the product)
    productPrice(Price of the product)
    productLink(Link to the product)
  }
}
`;

export async function defineSchema(url) {
    const browser = await chromium.launch({ headless: false, executablePath: executablePath() });
    const page = await wrap(await browser.newPage()); // Wrap page with AgentQL

    // Go to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Handle cookie consent
    // const button = page.locator('xpath=//*[@id="mde-consent-modal-dialog"]/div[2]/div[1]/button');
    // if (await button.isVisible()) {
    //     await button.click();
    // }
    
    await page.waitForLoadState('load');

    const close_result = await page.queryElements("{popup(The button closes the popup){close_btn(The button that closes the popup, close, accept, depends on the website)}}");
    let close_btn_xpath = null;
    if (close_result.popup.close_btn) {
        close_btn_xpath = await xPath(close_result.popup.close_btn);
        console.log('Close Button:', close_btn_xpath);
        await close_result.popup.close_btn.click();
    } else {
        console.log('No close button found.');
    }

    // Scroll to the bottom of the page to load all products
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });

    // Execute AgentQL query
    const result = await page.queryElements(QUERY);

    // Convert the products to xpaths
    const products = await Promise.all(result.products.map(async product => ({
        titleXPath: product.productTitle ? await xPath(product.productTitle) : null,
        priceXPath: product.productPrice ? await xPath(product.productPrice) : null,
        linkXPath: product.productLink ? await xPath(product.productLink) : null
    })));

    console.log('Products:', products);

    const returned_result = {
        website: extractWebLink(url),
        schema: {
            close_btn: close_btn_xpath,
            products: products
        }
    };

    await browser.close();

    console.log('Returned Result:', returned_result);

    // Save the result to schemas.json
    const filePath = '/Users/cristeaoctavian/Dev/paid/testbot/schemas.json';
    let schemas = [];
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        schemas = JSON.parse(fileContent);
    }
    schemas.push(returned_result);
    fs.writeFileSync(filePath, JSON.stringify(schemas, null, 2));

    return returned_result;
};