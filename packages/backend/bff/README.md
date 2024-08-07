# Api gateway

## Development

### Dependencies

-   Keycloak server
-   (optional) Prometheus and Grafana (to preview metrics)

## Startup

```shell
# Run in the repository root
npm i

# Launch oauth-mock-server in its folder by running
npm start

# Hot reload
npm run dev
```

## Configuration

Configuration is stored in `./config/default.toml`.
Default configuration can be overridden with `./config/development.toml` file.

You can also override defaults using ENV variables, as described in `./config/custom-environment-variables.json`

## Endpoints

-   `/ws` - Websocket server
-   `/metrics` - Metrics endpoint
-   `/` - Healthcheck

## How to Proxy local gRPC service

Guide [here](https://drive.google.com/file/d/1Zxx_tzhIfehgBahc5ITjQgo2EtsDlefN/view?usp=sharing)

The code explanation is [here](https://drive.google.com/file/d/1tuant5bL_EV2sKJ8YMRQSwKBc5kuGq_d/view?usp=sharing)
