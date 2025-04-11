# UIKit - React

UIKit is a React component library that implements the [UCL Design System](https://design-system.ucl.ac.uk/), for use in UCL React frontend applications.

[Explore the components in Storybook](https://improved-dollop-nvkw6wv.pages.github.io/?path=/docs/components-footer--docs)

The library is still a work in progress.

## Usage

Log in to your ISD jFrog account

```
npm login --registry=https://uclisd.jfrog.io/artifactory/api/npm/isd-npm/ --auth-type=web --scope=@dev-and-test
```

Add the jFrog npm registry to your npm config

```
npm config set @dev-and-test:registry https://uclisd.jfrog.io/artifactory/api/npm/isd-npm/
```

From your React project, install uikit-react

```
npm install @dev-and-test/uikit-react
```

## Library Development

If you would like to [contribute](./CONTRIBUTING.md) and would like to build the library locally:

1. Install prerequisites
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install node --default

nvm --version
node --version

```

2. Clone the project repo, build, and start dev server
```
git clone git@github.com:ucl-isd/uikit-react.git
cd uikit-react
npm install
npm run dev

```

3. Open in browser and start editing

Open http://localhost:5173/ in your browser

Edit .tsx files, save, and see those changes in your browser.

## Lint, check typings, run unit tests

```
npm run lint
npm run typecheck
npm run test

```

## Publish

```
npm login --registry=https://uclisd.jfrog.io/artifactory/api/npm/isd-npm-local/ --auth-type=web --scope=@dev-and-test
```

```
npm publish
```

## Storybook Deployment

The storybook instance for this repository is currently deployed via [GitHub Pages](https://pages.github.com/), at [improved-dollop-nvkw6wv.pages.github.io](https://improved-dollop-nvkw6wv.pages.github.io/)

To check or change GitHub Pages deployment settings, go to [github.com/ucl-isd/uikit-react/settings/pages](https://github.com/ucl-isd/uikit-react/settings/pages)

The GitHub Pages site is deployed from the git branch `gh-pages`. This branch only contains built application code for the Storybook instance. This branch is handled entirely by the `gh-pages` npm dependency.  

More information on Storybook can be found at [storybook.js.org](https://storybook.js.org/)

### Deployment workflow

Developers who want to add their work to the deployed storybook instance should run the following terminal command from their local machine: 

```bash
npm run deploy
```

This will trigger the entire deployment process on your local machine. Only this command needs to be run to take ['component stories'](https://storybook.js.org/docs/get-started/whats-a-story) on your current branch (the `component.stories.tsx` files available on your local machine at the point that you run the command) and deploy them to GitHub Pages. 

⚠️ *Note:* The storybook deployment will overwrite the contents of branch `gh-pages` *every time*; therefore, if you do not have a particular component story on your current branch, it will not be included in the deployment. For example, work left on a separate development branch and not yet merged into `main` may not be included if another developer deploys from their own development branch. 

# Yarn

Yarn is a good alernative to npm.

Install
```
npm install --global yarn
yarn --version
```

Usage
```
yarn
yarn lint
yarn typecheck
yarn test
```

## Support

More support options to be added.

For now, please contact Jason Wilson (ccaeilc) on Teams or by email:

ccaeilc@ucl.ac.uk

## Documentation

- [Original Vite Readme](./docs/vite-README.md)
