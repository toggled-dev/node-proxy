## Use HTTPS with your proxy server

To enable HTTPS, SSL certificate and private key files must be provided in configuration file.

```json
{
  "server": {
    "port": 9100,
    "protocol": "https",
    "ssl": {
      "private-key": "certs/localhost.key",
      "cert": "certs/localhost.cert"
    }
  },
  "toggled-endpoint": "us-east-1-api.saas.toggled.dev",
  "verbose": false
}
```
More details here: https://nodejs.org/api/tls.html#tlscreateserveroptions-secureconnectionlistener

### Create a self signed cert

Use `openssl` to create a self signed cert.

```bash
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost" \
    -keyout localhost.key  -out localhost.cert
```

### HTTP only

To use HTTP to connect your clients to proxy server, change protocol setting in configuration file. 
In this case, SSL configuration is no more required.

```json
{
  "server": {
    "port": 9100,
    "protocol": "http"
  },
  "toggled-endpoint": "us-east-1-api.saas.toggled.dev",
  "verbose": false
}
```

