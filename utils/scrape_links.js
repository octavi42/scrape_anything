import { fetchLinksByInterval, fetchSchemaByLink, get_last_scraped_data, update_last_scraped_data } from '../supabase/scrape.js';
import { scrapeProducts } from '../scraper/scrape.js';

export async function scrape_db() {
    const linksToScrape = await fetchLinksByInterval()
    
    // const linksToScrape = [
    //   // {
    //   //   link_id: 14,
    //   //   url: 'https://www.kleinanzeigen.de/s-autos/audi/preis::60000/c216+autos.marke_s:audi+autos.model_s:r8',
    //   //   last_scraped_link: '2025-01-08T15:36:00.000Z',
    //   //   email: 'octavicristea@gmail.com',
    //   //   schema_id: null
    //   // },
    //   // {
    //   //   link_id: 13,
    //   //   url: 'https://www.kleinanzeigen.de/s-autos/porsche/preis::20000/c216+autos.marke_s:porsche+autos.model_s:cayman',
    //   //   last_scraped_link: '2025-01-07T20:52:00.000Z',
    //   //   email: 'octavicristea@gmail.com',
    //   //   schema_id: null
    //   // },
    //   // {
    //   //   link_id: 12,
    //   //   url: 'https://www.kleinanzeigen.de/s-seite:4/porsche-momo/k0',
    //   //   last_scraped_link: '2024-10-15T00:00:00.000Z',
    //   //   email: 'alexandrucristea246@gmail.com',
    //   //   schema_id: null
    //   // },
    //   {
    //     link_id: 1,
    //     url: 'https://www.kleinanzeigen.de/s-motorraeder-roller/preis::2200/bmw/k0c305',
    //     last_scraped_link: '2025-01-08T19:54:00.000Z',
    //     email: 'octavicristea@gmail.com',
    //     schema_id: 4
    //   },
    //   {
    //     link_id: 2,
    //     url: 'https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=8600%3B47%3B%3B&ref=quickSearch&s=Car&sb=rel&vc=Car',
    //     last_scraped_link: null,
    //     email: 'octavicristea@gmail.com',
    //     schema_id: 1
    //   }
    // ]
  
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
        if (!product.link) continue;
        
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