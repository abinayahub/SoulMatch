const jwt = require('jsonwebtoken');
const http = require('http');
const token = jwt.sign({ userId: 1, email: 'test@example.com', role: 'user' }, 'soulmatch-secret-dev-2024');
const data = JSON.stringify({ content: 'hello' });
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/notes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
req.write(data);
req.end();
