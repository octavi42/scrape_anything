import express from 'express';

import { defineSchema } from '../utils/define_schema.js';
import { get_link, saveNewSchema } from '../supabase/scrape.js';

import { scrape_db } from '../utils/scrape_links.js'

const router = express.Router();

router.get('/test', async (req, res) => {
    const link = await get_link(15)

    const schema_definition = await defineSchema(link.url)

    await saveNewSchema(schema_definition, link.id)
});

router.post('/define_schema', async (req) => {
    const link_id = req.body.link_id
    const link = await get_link(link_id)
    const schema_definition = await defineSchema(link)
    await saveNewSchema(schema_definition, link_id)
});

router.get('/scrape_links', async (req) => {return scrape_db()})

export default router;