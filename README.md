# UCL ARC Services Portal

Management portal for [UCL ARC](https://www.ucl.ac.uk/advanced-research-computing/) services.

The Service Portal aims to serve as a single entry point for researchers and other users to manage and engage with the various services and platforms supported by ARC, e.g. [TRE](https://www.ucl.ac.uk/advanced-research-computing/sensitive-data-and-trusted-research-environments), [DSH](https://www.ucl.ac.uk/isd/services/file-storage-sharing/data-safe-haven-dsh).

Currently, the entities within the portal have the following relationships:

<p align="center">
  <img src="web/public/entity_diagram.drawio.svg" alt="entity diagram"/>
</p>

# Local development

1. Fork this repository and create a branch, or Clone it if you're on the project team.
2. Install [pre-commit](https://pre-commit.com/) (e.g. `pip install pre-commit` or `brew install pre-commit`), then run `pre-commit install` to set up the git hooks.
3. Install the prerequisites: [node](https://nodejs.org/en/download), [go](https://go.dev/doc/install) and [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen). Then run `cd web && npm install`.
4. Install [Docker](https://docs.docker.com/get-started/get-docker/).
5. Create `deploy/dev/oauth2-proxy.cfg` from [deploy/dev/oauth2-proxy.sample.cfg](./deploy/dev/oauth2-proxy.sample.cfg).
6. Create `deploy/dev/config.yaml` from [deploy/dev/config.sample.yaml](./deploy/dev/config.sample.yaml).
7. Spin up a development environment by running `make dev`.

Then go to http://localhost:8000. To destroy it run `make dev-destroy`. To see other commands run `make help`.

Modify, commit, push and open a pull request against `main` for review.

Note that you will need entra credentials to allow logging in to the portal as different users. Speak to a senior member of the team to set these up.

# Deployment

## Staging

[Staging](https://portal.ucl-arc.dev/) is deployed automatically approximately 1 hour after merging into `main`.

## Production

[Production](https://portal.arc.ucl.ac.uk) is deployed manually by a senior member of the team. This is done by updating the portal version in a separate deployment repository to the desired commit. Production deployments are done at the team's discretion — typically once a set of changes has been verified on staging.

For more information on production deployments, refer to the project Slack channel docs.

# Contact

If you are part of a service team, check our [services documentation](docs/services.md). Otherwise, get in touch with [the portal team](mailto:arc.portal@ucl.ac.uk).
