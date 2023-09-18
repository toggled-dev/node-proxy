# Toggled.dev / node-proxy

[Toggled](https://www.toggled.dev) is a solid, scalable and multi-regional feature toggles management platform.

The [JavaScript client](https://github.com/toggled-dev/toggled-client-js) is a tiny Toggled client written in JavaScript without any external dependencies (except from browser APIs). This client stores toggles relevant for the current user in `localStorage` and synchronizes with Toggled (see [Integrate Toggled in your app](https://docs.saas.toggled.dev/docs/getting-started/integrate-toggled)) in the background. 

By default, the client connects directly to the Toggled client endpoint. 

However, ***if you need to proxy client requests and forward them, this is a very simple Node proxy server*** that you can run in your environment.

## Quick start

The Toggled Proxy server listens for requests and forwards them to the Toggled client endpoint. The proxy server's listening port and protocol (HTTP/HTTPS) can be configured in the configuration file. All requests are forwarded to the host provided in the `toggled-endpoint` configuration parameter, preserving the Host and Authorization HTTP headers. The proxy server does not cache responses from the Toggled client endpoint.

### HTTP/HTTPS? Self signed certificate?
To enable HTTPS in your proxy server, it's required to copy cert file and private key file in the `certs` folder.
Use `openssl` to create a self signed cert, if needed.

```bash
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost" \
    -keyout certs/localhost.key  -out certs/localhost.cert
```

*Warning*: Using a self-signed certificate is not recommended. It creates a potential security vulnerability and should not be used in production environments. Use it for testing purposes only. 


## Check configuration
Check and edit [default](config/default.json) configuration file if needed.  
Remember to set the proper regional endpoint according to your account location.


| Section | Option | Type | Description      |
|---------|--------|------|------------------|
| server  | port | number - mandatory | Proxy server listening port. Default: 9100 |
| server  | protocol | string - mandatory | Proxy server listening protocol. Allowed: 'http'/'https' |
| server.ssl  | private-key | string | SSL Private key file name, mandatory when 'https' protocol is selected |
| server.ssl  | cert | string | SSL cert file name, mandatory when 'https' protocol is selected |
| - | toggled-endpoint | string - mandatory | Toggled.dev hostname to forward client requests |
| - | verbose | boolean - mandatory | If true, requests details are logged |

## Run the server with docker
Build and run server. 

```bash
docker build . -t toggled-proxy 
docker run -p 9100:9100 -d toggled-proxy
```

## Client configuration
Configure clients to use the proxy server (Node example).

```js
import { ToggledClient, TOGGLED_PLATFORM_URLS } from '@toggled.dev/toggled-client-js';

// This is required for self-signed certs - don't use it in production
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const toggled = new ToggledClient({
    url: 'https://<your-proxy-server-host>:9100/client/features',
    clientKey: '<your-client-api-key>',
});

// Start the background polling
toggled.start();
```

## Change Toggled.dev region
Default configuration use Toggled.dev US endpoint. If your workspace is hosted in a different region, you must configure the proxy server to forward requests to the correct endpoint.
Simply change the `toggled-endpoint` setting in the [default](config/default.json) configuration file. 

## Select a different configuration file
Another option is to use a different configuration file. 
This is an example using the [eu-central-1](config/eu-central-1.json) configuration file. 

Use `NODE_ENV` environment variable to select the configuration to be used.

```bash
docker build . -t toggled-proxy 
docker run -p 9100:9100 --env NODE_ENV=eu-central-1 -d toggled-proxy
```

You can create your own configuration file in `config` folder.

## Provide configuration using an environment variable
In addition to configuration files, you can provide the needed configuration using the `NODE_CONFIG` environment variable.

```bash
docker build . -t toggled-proxy 
docker run -p 9100:9100 \
       --env NODE_CONFIG='{"server": {"port": 9100,"protocol": "http"},"toggled-endpoint": "us-east-1-api.saas.toggled.dev","verbose": false}' \
       -d toggled-proxy
```







