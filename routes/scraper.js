import express from 'express';

import { defineSchema } from '../utils/define_schema.js';
import { get_link, saveNewSchema } from '../supabase/scrape.js';

const router = express.Router();

router.get('/test', async (req, res) => {
    const link = await get_link(1)

    console.log(link);
    

    const schema_definition = await defineSchema(link.url)

    await saveNewSchema(schema_definition, 1)
});

router.post('/define_schema', async (req) => {return defineSchema(req.body.url)});

export default router;
