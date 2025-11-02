# Re-Actor Sheet

An alternative Old School Essentials character sheet, built with React.

## Release Process

1. Build the code `pnpm build`
2. Run the release script `pnpm release --type=<patch|minor|major> (--dry-run optional)`

Release script will:

- Build the package to dist/
- Update the version in module.json based on type argument
- Commit the changes and push to origin
- Create a relase (and tag) on GitHub for the new version

## Foundry React Application Framework

Components

- ReactApplication - mounts a React app to a Foundry Application window
- ContextConnector - event emitter to allow React app to receive lifecycle events from Foundry Application (aka document changes).

Development Tools:

- main.js - contains a development-only adapter to enable React fast refresh and HMR in Foundry.
- \_main.js - the actual module entry point.
- Vite config:
  - Dev server and proxy to local foundry instance
  - Build config for building app to dist/
  - Uses main.js as entry point for dev and \_main.js for production build
- tools/release.mjs - release script to automate module versioning and GitHub releases/tags
