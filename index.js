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
  // inspectHeaders('https://www.kleinanzeigen.de/s-motorraeder-roller/preis::2200/bmw/k0c305');
});


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