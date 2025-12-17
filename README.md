# UCL ARC Services Portal

Management portal for [UCL ARC](https://www.ucl.ac.uk/advanced-research-computing/)
services.

# Overview

The Service Portal aims to serve as a single entry point for researchers and other users to manage and engage with the various services and platforms supported by ARC, e.g. [TRE](https://www.ucl.ac.uk/advanced-research-computing/sensitive-data-and-trusted-research-environments), [DSH](https://www.ucl.ac.uk/isd/services/file-storage-sharing/data-safe-haven-dsh).

Currently, the entities within the portal have the following  relationships:

<p align="center">
  <img src="web/public/entity_diagram.drawio.svg" alt="entity diagram"/>
</p>

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

These deployments are managed by the TRE team. [Staging](https://portal.ucl-arc.dev/) will update after merging into `main`.

## 🏗️ Development

If you are part of a service team, check our [services documentation](docs/services.md). Otherwise, get in touch with [the portal team](mailto:arc.portal@ucl.ac.uk).
