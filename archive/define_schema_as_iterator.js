import { executablePath } from 'puppeteer';
import { configure, wrap } from 'agentql'; // Hypothetical library for AgentQL
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { xPath } from 'playwright-DOMPath';
import fs from 'fs';
import { generalizeXPaths } from './xPath.js';

import dotenv from 'dotenv';

dotenv.config();

const stealthPlugin = stealth();
chromium.use(stealthPlugin);

// Replace with your actual API key or credentials
configure({ apiKey: process.env.AGENTQL_API_KEY });

const QUERY = `
{
  products(List the products on the page)[] {
    productTitle(Name of the product)
    productPrice(Price of the product)
    productLink(Link to the product)
  }
}
`;

export async function defineSchema(url) {
    const browser = await chromium.launch({ headless: true, executablePath: executablePath() });
    const page = await wrap(await browser.newPage()); // Wrap page with AgentQL

    // Go to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Handle cookie consent
    // const button = page.locator('xpath=//*[@id="mde-consent-modal-dialog"]/div[2]/div[1]/button');
    // if (await button.isVisible()) {
    //     await button.click();
    // }
    
    await page.waitForLoadState('load');

    const close_result = await page.queryElements("{close_btn(The button closes the popup)}");
    const close_btn_xpath = await xPath(close_result.close_btn);
    console.log('Close Button:', close_btn_xpath);
    await close_result.close_btn.click();

    // Execute AgentQL query
    const result = await page.queryElements(QUERY);

    // Convert the products to xpaths
    const productTitleXPaths = await Promise.all(result.products.map(async product => await xPath(product.productTitle)));
    const productPriceXPaths = await Promise.all(result.products.map(async product => await xPath(product.productPrice)));
    const productLinkXPaths = await Promise.all(result.products.map(async product => await xPath(product.productLink)));

    const generalizedXPath = generalizeXPaths(productTitleXPaths);
    const generalizedPriceXPath = generalizeXPaths(productPriceXPaths);
    const generalizedLinkXPath = generalizeXPaths(productLinkXPaths);
    const products = {
        titleXPath: generalizedXPath,
        priceXPath: generalizedPriceXPath,
        linkXPath: generalizedLinkXPath
    };

    const returned_result = {
        website_link: url,
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