import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteerCore from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

puppeteer.use(StealthPlugin());

const { executablePath } = puppeteerCore;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function closePopup(page, xpath) {
    try {
        await page.evaluate((xpath) => {
            const element = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            if (element) {
                element.click();
            }
        }, xpath);
    } catch (error) {
        console.log(`Popup not found or already closed: ${xpath}`);
    }
}

function getRandomDelay(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

async function scrapeProductDetails(page, productSchema) {
    const results = [];
    const products = productSchema.products;
    console.log('Products:', products);

    for (const product of products) {
        const productDetails = await page.evaluate((xpaths) => {
            const getElementByXPath = (xpath) => {
                const element = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                return element;
            };

            const titleElement = getElementByXPath(xpaths.titleXPath);
            const priceElement = getElementByXPath(xpaths.priceXPath);
            const linkElement = getElementByXPath(xpaths.linkXPath);

            return {
                title: titleElement ? titleElement.innerText : null,
                price: priceElement ? priceElement.innerText : null,
                link: linkElement ? linkElement.getAttribute('href') : null
            };
        }, product);

        results.push(productDetails);
        console.log('Product:', productDetails);
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

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: executablePath(),
        args: [
            `--proxy-server=${proxyServer}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled'
        ],
    });

    const page = await browser.newPage();

    if (proxyUsername && proxyPassword) {
        await page.authenticate({ username: proxyUsername, password: proxyPassword });
    }

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.9',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      });

    try {
        // await page.setDefaultNavigationTimeout(100000);
        const response = await page.goto(link, { waitUntil: 'domcontentloaded' });
        if (response.status() === 403) {
            console.error('Access Denied. Retrying with a different proxy...');
            await browser.close();
            await delay(getRandomDelay(30000, 60000)); // Waits between 30 to 60 seconds
            return scrapeProducts(link, schema); // Retry the function
        }


        // Close popup if defined
        const closeBtnXPath = schema.close_btn;
        if (closeBtnXPath) {
            await closePopup(page, closeBtnXPath);
        }

        // Scroll the page progressively
        // console.log('Starting to scroll the page...');
        // await autoScroll(page);
        // console.log('Finished scrolling');

        // Wait a bit for any dynamic content to load after scrolling

        const productDetails = await scrapeProductDetails(page, schema);
        console.log('Scraped Products:', productDetails);

        return productDetails;
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
    }
}