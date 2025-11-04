import moduleManifest from "../module.json" with { type: "json" };
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { create } from "domain";
import path from "path";

const args = process.argv.slice(2);
const { version: currentVersion, url: githubRepository }= moduleManifest.version;

function getArguments() {
  const releaseType = args.find(arg => arg.startsWith('--type='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  if (!releaseType) {
    console.error('Usage: node release.mjs --type=<major|minor|patch>');
    process.exit(1);
  }
  if (!['major', 'minor', 'patch'].includes(releaseType)) {
    console.error('Release type must be major, minor, or patch');
    process.exit(1);
  }
  return {
    releaseType,
    dryRun
  };
}

function getNewVersion(currentVersion, releaseType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  // Increment version based on type
  let newVersion;
  switch (releaseType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  return newVersion;
}

// Update manifest and write back to file
function updateManifest(newVersion) {
  console.log(`Updating manifest version version: ${newVersion}`);
  
  moduleManifest.version = newVersion;
  moduleManifest.manifest = `${moduleManifest.url}/releases/download/${newVersion}/module.json`;
  moduleManifest.download = `${moduleManifest.url}/releases/download/${newVersion}/module.zip`;
  if (dryRun) {
    console.log("New module.json:", JSON.stringify(moduleManifest, null, 2));
    return
  }
  writeFileSync('./module.json', JSON.stringify(moduleManifest, null, 2) + '\n');
  console.log(`Version updated from ${currentVersion} to ${newVersion}`);
}

function abortIfGitDirty() {
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    console.error('Error: Git working directory is dirty. Please commit or stash changes before releasing.');
    process.exit(1);
  }
}

function buildDist() {
  console.log('Building distribution files...');
  if (dryRun) return;
  execSync('pnpm build', { stdio: 'inherit' });
}

function commitRelease(newVersion) {
  const message = `Manifest updated for version ${newVersion}`
  console.log(`Committing changes: "${message}"`)
  if (dryRun) return
  execSync(`git add -A && git commit -m "${message}" && git push origin`, { stdio: 'inherit' });
}

// Check if GitHub CLI is available
function ensureGithubCLI() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: GitHub CLI (gh) is not installed or not available in PATH');
    console.error('Please install GitHub CLI: https://cli.github.com/');
    process.exit(1);
  }
}

function buildArchive(tag) {
  const cmd = `zip -r build/module.zip module.json dist/ lang/ templates/ README.md`;
  console.log(`Building archive for version ${tag}...`);
  execSync(cmd, { stdio: 'inherit' });
}

function createGithubRelease(tag) {
  const cmd = `gh release create ${tag} --title "${tag}" --generate-notes build/module.zip \
    && git fetch --tags origin`;
  console.log(`Creating GitHub release with command: ${cmd}`);
  if (dryRun) return;
  execSync(cmd, { stdio: 'inherit' });
}
  
// Parse release type from arguments
const { releaseType, dryRun } = getArguments();
const newVersion = getNewVersion(moduleManifest.version, releaseType)

abortIfGitDirty()
ensureGithubCLI()
updateManifest(newVersion)
buildDist()
commitRelease(newVersion)
createGithubRelease(newVersion)

if (dryRun) {
  console.log('Dry run mode - no changes will be made.');
  process.exit(0);
}
