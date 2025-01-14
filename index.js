import { scrapeProducts } from './scraper/scrape.js';
import data from './schemas.json' assert { type: 'json' };
import { fetchLinksByInterval, fetchSchemaByLink, get_last_scraped_data, update_last_scraped_data } from './supabase/scrape.js';

import express from 'express';
import telegramRoutes from './routes/telegram.js';
import scraperRoutes from './routes/scraper.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', async (req, res) => {
  // Example usage
  inspectHeaders('https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=8600%3B47%3B%3B&ref=quickSearch&s=Car&sb=rel&vc=Car');
  // inspectHeaders('https://www.kleinanzeigen.de/s-motorraeder-roller/preis::2200/bmw/k0c305');
});


import fetch from 'node-fetch';
import createHttpsProxyAgent from 'https-proxy-agent'

async function inspectHeaders(url) {
  const username = 'YOUR_USERNAME';
  const password = 'YOUR_PASSWORD';

  const agent = createHttpsProxyAgent(
    `http://${username}:${password}@unblock.smartproxy.com:60000`
  );

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

  const headers = {
    'X-SU-Custom-My-Header': 'Custom header content here',
    'X-Smartproxy-Force-User-Headers': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36'
  }

  const response = await fetch('https://ip.smartproxy.com/', {
    method: 'get',
    headers: headers,
    agent: agent
  });

  console.log(await response.text());

}

app.use('/telegram', telegramRoutes);
app.use('/scraper', scraperRoutes);

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});


// const { defineSchema } = require('./utils/define_schema');

const main = async () => {
  // await defineSchema('https://us.vestiairecollective.com/men-shoes/?_gl=1*tqavgn*_up*MQ..*_gs*MQ..&gclid=EAIaIQobChMI1are__fligMVbl6RBR1Mjw6yEAAYASAAEgLKUPD_BwE#categoryParent=Shoes%2313_gender=Men%232')
  // await scrape_data()

  const data = await fetchLinksByInterval()
  console.log(data);

};

async function scrape_db() {
  // const linksToScrape = await fetchLinksByInterval()
  
  const linksToScrape = [
    // {
    //   link_id: 14,
    //   url: 'https://www.kleinanzeigen.de/s-autos/audi/preis::60000/c216+autos.marke_s:audi+autos.model_s:r8',
    //   last_scraped_link: '2025-01-08T15:36:00.000Z',
    //   email: 'octavicristea@gmail.com',
    //   schema_id: null
    // },
    // {
    //   link_id: 13,
    //   url: 'https://www.kleinanzeigen.de/s-autos/porsche/preis::20000/c216+autos.marke_s:porsche+autos.model_s:cayman',
    //   last_scraped_link: '2025-01-07T20:52:00.000Z',
    //   email: 'octavicristea@gmail.com',
    //   schema_id: null
    // },
    // {
    //   link_id: 12,
    //   url: 'https://www.kleinanzeigen.de/s-seite:4/porsche-momo/k0',
    //   last_scraped_link: '2024-10-15T00:00:00.000Z',
    //   email: 'alexandrucristea246@gmail.com',
    //   schema_id: null
    // },
    {
      link_id: 1,
      url: 'https://www.kleinanzeigen.de/s-motorraeder-roller/preis::2200/bmw/k0c305',
      last_scraped_link: '2025-01-08T19:54:00.000Z',
      email: 'octavicristea@gmail.com',
      schema_id: 4
    },
    {
      link_id: 2,
      url: 'https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=8600%3B47%3B%3B&ref=quickSearch&s=Car&sb=rel&vc=Car',
      last_scraped_link: null,
      email: 'octavicristea@gmail.com',
      schema_id: 1
    }
  ]

  console.log('Links to scrape:', linksToScrape);
  

  for (const link of linksToScrape) {

    console.log('Link:', link);
    
    
    if (!link.schema_id) continue

    const schema = await fetchSchemaByLink(link.schema_id)
    console.log('Schema:', schema);
    const new_scraped_data = await scrapeProducts(link.url, schema)
    const last_scraped_data = await get_last_scraped_data(link.link_id)


    console.log('New scraped data:', new_scraped_data);
    console.log('Last scraped data:', last_scraped_data);
    

    // compare the new scraped data with the last scraped data
    // if the data is different, send a notification

    for (const product of new_scraped_data) {
      let found = false;
      if (!new_scraped_data.link) continue;

      for (const last_product of last_scraped_data) {
        if (product.link === last_product.link) {
          found = true;
          break;
        }
      }

      if (!found) {
        console.log('New product found:', product);
        await update_last_scraped_data(link.link_id, new_scraped_data);
      }
    }

  }
}

async function scrape_data() {
  // get the data from the json file
  
  // get the first element from the data
  const firstElement = data[0];

  // get the link and schema from the first element
  const { website_link, schema } = firstElement;

  console.log('Website Link:', website_link);
  console.log('Schema:', schema);
  

  // scrape the products
  const products = await scrapeProducts(website_link, schema);

  console.log('Products:', products);
}

// main();