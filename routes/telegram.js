import express from 'express';

import { update_telegram, set_webhook, remove_webhook, get_webhooks } from '../utils/telegram.js';

const router = express.Router();

router.get('/test', async (req, res) => {
    res.send('Hello World!');
});

router.post('/updates', async (req) => {return update_telegram(req)});

router.post('/set_webhook', async () => {return set_webhook()});

router.post('/remove_webhook', async () => {return remove_webhook()});

router.get('/get_webhooks', async () => {return get_webhooks()});

export default router;
