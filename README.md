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
