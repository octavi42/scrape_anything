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