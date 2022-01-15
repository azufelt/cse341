const http = require('http');

const server = http.createServer((req, res) => {
  const url = req.url;
  if (url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Assignment 1</title></head>');
    res.write(
      '<body><h1>Username Form</h1><form action="/create-user" method="POST"><label for=""></label><input type="text" name="username" id="username"><button type="submit">Send</button></form></body>'
    );
    res.write('</html>');
    return res.end();
  }
  if (url === '/users') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Assignment 1</title></head>');
    res.write('<body><ul><li>User 1</li><li>User 2</li></ul></body>');
    res.write('</html>');
    return res.end();
  }
  if (url === '/create-user') {
    const body = [];
    req.on('data', dataChunk => {
      body.push(dataChunk);
    });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody.split('=')[1]); //username=input-from-user
    });
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
  }
});

server.listen(3000);