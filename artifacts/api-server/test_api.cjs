const http = require('http');

const data = JSON.stringify({
  content: "Navigating dating in a new city. Moved to a new place and used the app to meet people. It's a wonderful journey so far."
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/journal',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 1' // using hardcoded test userId=1
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
