const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World! Frontend server test\n');
});

server.listen(5173, '0.0.0.0', () => {
  console.log('Test server running at http://localhost:5173/');
});