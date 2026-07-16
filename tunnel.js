const localtunnel = require('localtunnel');
(async () => {
  async function start() {
    try {
      const tunnel = await localtunnel({ port: 5173, subdomain: 'soulmatch-dev-app' });
      console.log('Tunnel started at', tunnel.url);
      tunnel.on('close', () => {
        console.log('Tunnel closed, restarting...');
        setTimeout(start, 1000);
      });
    } catch (e) {
      console.log('Error:', e);
      setTimeout(start, 1000);
    }
  }
  start();
})();
