// This started as code I grabbed from this SO question: http://stackoverflow.com/a/13472952/670023

const url = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');
const config = require('config');

const port = config.get('server.port');
const protocol = config.get('server.protocol');
const endpoint = config.get('toggled-endpoint');
const verbose = config.get('verbose');

const server = (protocol === 'https' ? https : http).createServer(
  protocol === 'https' ?
    {
      key: fs.readFileSync(config.get('server.ssl.private-key')),
      cert: fs.readFileSync(config.get('server.ssl.cert')),
    } :
    {},
  function(req, res) {
    onRequest(req, res);
  },
);

console.log('\n[Toggled.dev proxy server]');
console.log(
    'Listening on %s://localhost:%s - Forwarding requests to https://%s',
    protocol,
    port,
    endpoint,
);
server.listen(port, '0.0.0.0');

// Request serving
function onRequest(req, res) {
  const reqUrl = req.url;
  req.pause();

  const options = url.parse(reqUrl);

  options.headers = req.headers;
  options.method = req.method;
  options.agent = false;
  options.host = endpoint;
  options.protocol = 'https:';
  options.headers['host'] = options.host;

  if (verbose === true) {
    console.log('==> Making request for %s', reqUrl);
    console.log(options.headers);
  }

  const connector = https.request(options, function(serverResponse) {
    if (verbose === true) {
      console.log(
          '<== Received response for',
          serverResponse.statusCode,
          reqUrl,
      );
      console.log(serverResponse.headers);
    }

    serverResponse.pause();
    serverResponse.headers['access-control-allow-origin'] = '*';

    switch (serverResponse.statusCode) {
      // pass through.  we're not too smart here...
      case 200:
      case 201:
      case 202:
      case 203:
      case 204:
      case 205:
      case 206:
      case 304:
      case 400:
      case 401:
      case 402:
      case 403:
      case 404:
      case 405:
      case 406:
      case 407:
      case 408:
      case 409:
      case 410:
      case 411:
      case 412:
      case 413:
      case 414:
      case 415:
      case 416:
      case 417:
      case 418:
        res.writeHeader(serverResponse.statusCode, serverResponse.headers);
        serverResponse.pipe(res, {end: true});
        serverResponse.resume();
        break;

      // fix host and pass through.
      case 301:
      case 302:
      case 303:
        serverResponse.statusCode = 303;
        serverResponse.headers['location'] =
          'http://localhost:' + port + '/' + serverResponse.headers['location'];
        console.log('\t-> Redirecting to ', serverResponse.headers['location']);
        res.writeHeader(serverResponse.statusCode, serverResponse.headers);
        serverResponse.pipe(res, {end: true});
        serverResponse.resume();
        break;

      // error everything else
      default:
        const stringifiedHeaders = JSON.stringify(
            serverResponse.headers,
            null,
            4,
        );
        serverResponse.resume();
        res.writeHeader(500, {
          'content-type': 'text/plain',
        });
        res.end(
            process.argv.join(' ') +
            ':\n\nError ' +
            serverResponse.statusCode +
            '\n' +
            stringifiedHeaders,
        );
        break;
    }
  });
  req.pipe(connector, {end: true});
  req.resume();
}
