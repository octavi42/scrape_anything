# Scrape Anything

This project is a web scraper built using Puppeteer and Puppeteer Extra with the Stealth Plugin. It allows you to scrape product details from any web pages while avoiding detection.

## Prerequisites

- Node.js (v12 or higher)
- npm or yarn
- A proxy server (optional, but recommended)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/scrape_anything.git
    cd scrape_anything
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```

3. Create a `.env` file in the root directory and add your proxy server details (if using a proxy):

    ```plaintext
    PROXY_SERVER=your_proxy_server
    PROXY_USERNAME=your_proxy_username
    PROXY_PASSWORD=your_proxy_password
    ```

## Usage

1. Import the `scrapeProducts` function in your script:

    ```javascript
    import { scrapeProducts } from './scraper/scrape.js';
    ```

2. Define the schema for the products you want to scrape. The schema should include the XPaths for the product details and an optional XPath for closing popups:

    ```javascript
    const schema = {
        data_load_xpath: 'XPath_to_check_data_load',
        close_btn: 'XPath_to_close_popup',
        products: [
            {
                titleXPath: 'XPath_for_product_title',
                priceXPath: 'XPath_for_product_price',
                linkXPath: 'XPath_for_product_link'
            }
        ]
    };
    ```

3. Call the `scrapeProducts` function with the URL of the page and the schema:

    ```javascript
    const link = 'https://example.com/products';
    scrapeProducts(link, schema)
        .then(productDetails => {
            console.log('Scraped Products:', productDetails);
        })
        .catch(error => {
            console.error('Error during scraping:', error);
        });
    ```

## How It Works

1. **Initialization**: The scraper initializes Puppeteer with the Stealth Plugin to avoid detection. It also sets up a proxy server if provided in the `.env` file.

2. **Page Navigation**: The scraper navigates to the provided URL and waits for the page to load.

3. **Data Loading**: It waits for a specific element (defined by `data_load_xpath` in the schema) to appear on the page, ensuring that the data is loaded properly.

4. **Popup Handling**: If a popup close button XPath is provided in the schema, the scraper attempts to close the popup.

5. **Scrolling**: The scraper can scroll the page to load dynamic content if necessary (this part is currently commented out in the code).

6. **Data Extraction**: The scraper extracts product details based on the XPaths provided in the schema. It collects the title, price, and link for each product.

7. **Return Results**: The scraped product details are returned as an array of objects.

## AI Detection and XPath Schema

- **AgentQL**: The scraper uses AgentQL for AI detection of page elements. This helps in identifying the correct elements to scrape on the page.
- **XPath Schema**: The scraping schema is defined using XPath, which allows precise selection of elements on the page. The schema includes XPaths for product details and optional XPaths for closing popups.

## Example

Here is a complete example:

```javascript
import { scrapeProducts } from './scraper/scrape.js';

const schema = {
    data_load_xpath: '//div[@class="product-list"]',
    close_btn: '//button[@class="close-popup"]',
    products: [
        {
            titleXPath: '//h2[@class="product-title"]',
            priceXPath: '//span[@class="product-price"]',
            linkXPath: '//a[@class="product-link"]'
        }
    ]
};

const link = 'https://example.com/products';

scrapeProducts(link, schema)
    .then(productDetails => {
        console.log('Scraped Products:', productDetails);
    })
    .catch(error => {
        console.error('Error during scraping:', error);
    });
```

## Notes

- Ensure that the XPaths in the schema are correct and specific to the elements you want to scrape.
- Adjust the delay times in the `scrape.js` file if necessary to ensure that the data is loaded properly.
- Use a proxy server to avoid IP blocking and improve scraping performance.

## License

This project is licensed under the MIT License.
