# UCL ARC Services Portal

Management portal for [UCL ARC](https://www.ucl.ac.uk/advanced-research-computing/)
services.

Production site: https://portal.arc.ucl.ac.uk/

Staging site: https://portal.ucl-arc.dev/

# Overview

The Service Portal aims to serve as a single entry point for researchers and other users to manage and engage with the various services and platforms supported by ARC, eg. TRE, DSH.

Currently, the services within the portal have the following entity relationships:

![entity diagram](web/public/entity_diagram.drawio.svg)

## ⚙️ Deployment

### dev

1. Create `deploy/dev/oauth2-proxy.cfg` from [deploy/dev/oauth2-proxy.sample.cfg](./deploy/dev/oauth2-proxy.sample.cfg)
1. Create `deploy/dev/config.yaml` from [deploy/dev/config.sample.yaml](./deploy/dev/config.sample.yaml)
1. Install the [development prerequisites](#dev-prerequisites)
1. Spin up a development environment by running:

```bash
make dev
```

then go to http://localhost:8000. To destroy it run `make dev-destroy`. To see other commands run `make help`.

### staging and production

These deployments are managed by the TRE team. Staging will update after merging into `main`

## 🏗️ Development

If you are part of a service team, check our [Services doc](docs/services.md). Otherwise, get in touch with [the portal team](mailto:arc.portal-dev@ucl.ac.uk)
