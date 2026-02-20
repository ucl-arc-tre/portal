# Services Development + Maintenance

We encourage service teams to maintain their portions of code within the codebase and trust them not to edit other services' code. This is enforced by [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

### Development

You may find it helpful to review the [project structure](../README.md)

- Fork this repository and create a branch, or Clone it if you're on the project team.
- Run `pre-commit install` to install [pre-commit](https://pre-commit.com/).
- If not already present, install the <a id='dev-prerequisites'>prerequisites</a>: [node](https://nodejs.org/en/download), [go](https://go.dev/doc/install) and [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen). Then run `cd web && npm install`.
- If not already present, install Docker Desktop. Then open Docker Desktop app and make sure the app is running.
- Create deploy/dev/oauth2-proxy.cfg from [deploy/dev/oauth2-proxy.sample.cfg](../deploy/dev/oauth2-proxy.sample.cfg)
- Create deploy/dev/config.yaml from [deploy/dev/config.sample.yaml](../deploy/dev/config.sample.yaml)
- Spin up the dev environment with `make dev`. You can find other commands in the [docs](../README.md)
- Modify, commit, push and open a pull request against `main` for review.
