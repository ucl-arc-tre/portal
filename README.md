# UCL ARC Portal

Management portal for [UCL ARC](https://www.ucl.ac.uk/advanced-research-computing/)
services.

## ⚙️ Deployment

### dev

1. Create `deploy/dev/oauth2-proxy.cfg` from [deploy/dev/oauth2-proxy.sample.cfg](./deploy/dev/oauth2-proxy.sample.cfg)
1. Install the [development prerequisites](#dev-prerequisites)
1. Spin up a development environment by running:

```bash
make dev
```

then go to http://localhost:8000. To destroy it run `make dev-destroy`.

## 🏗️ Development

Contributions are very welcome. To suggest a change please:

- Fork this repository and create a branch.
- Run `pre-commit install` to install [pre-commit](https://pre-commit.com/).
- If not already present, install the <a id='dev-prerequisites'>prerequisites</a>: [node](https://nodejs.org/en/download), [go](https://go.dev/doc/install) and [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen). Then run `cd web && npm install`.
- Modify, commit, push and open a pull request against `main` for review.
