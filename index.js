const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');
const semver = require('semver');

try {
  // Set APP_NAME
  const repo = github.context.repo.repo;
  const appName = repo.replace('-container', '').toLowerCase();
  core.exportVariable('APP_NAME', appName);

  // Set SAFE_BASENAME
  const imageBase = core.getInput('image_base');
  const safeBaseName = imageBase.replace(/\//g, '-').replace(/-$/, '');
  core.exportVariable('SAFE_BASENAME', safeBaseName);

  // Set BUILDER_IMAGE_VERSION
  const ref = github.context.ref;
  const eventName = github.context.eventName;
  const imageVersion = core.getInput('image_version');
  let builderImageVersion;

  if (ref.startsWith('refs/heads/feature/')) {
    builderImageVersion = imageVersion.replace('-base-', '-devel-');
  } else if (
    eventName === 'pull_request' &&
    (github.context.payload.pull_request.head.ref.startsWith('hotfix/') ||
      github.context.payload.pull_request.head.ref.startsWith('bugfix/') ||
      github.context.payload.pull_request.head.ref.startsWith('release/'))
  ) {
    builderImageVersion = imageVersion.replace('-base-', '-runtime-');
  } else {
    builderImageVersion = imageVersion;
  }
  core.exportVariable('BUILDER_IMAGE_VERSION', builderImageVersion);

  // Set BUILD_ID
  const branch = github.context.ref.replace(/\//g, '-').toLowerCase();
  const shortSha = github.context.sha.substring(0, 7);
  const imageTag = `${shortSha}-${github.context.runId}-${github.context.runNumber}-${github.context.runAttempt}-${safeBaseName}-${builderImageVersion}`;
  core.exportVariable('BUILD_ID', imageTag);

  // Set BUILDER_ID
  const prefix = core.getInput('prefix');
  const builderId = `${prefix}-${imageTag}`;
  core.exportVariable('BUILDER_ID', builderId);

  // Set ARTIFACT_DIR
  const jobType = core.getInput('job_type');
  const artifactDir = `artifacts/${new Date().toISOString().split('T')[0]}/${github.context.runId}/${safeBaseName}/${builderImageVersion}/${jobType}`;
  core.exportVariable('ARTIFACT_DIR', artifactDir);

  // Create Artifact Storage
  execSync(`mkdir -p ${artifactDir}`);
  core.info(`Artifact storage created at ${artifactDir}`);

  // Determine NEXT_VERSION
  let latestTag;
  try {
    latestTag = execSync('git describe --tags $(git rev-list --tags --max-count=1)').toString().trim();
  } catch (error) {
    core.info('No tags found in the repository.');
  }

  let nextVersion = 'v0.0.1'; // Default version if no tags are found
  if (latestTag) {
    let currentVersion = latestTag.startsWith('v') ? latestTag.substring(1) : latestTag;
    
    // Normalize partial versions to full semver
    const parts = currentVersion.split('.');
    if (parts.length === 1) {
      currentVersion = `${currentVersion}.0.0`;
    } else if (parts.length === 2) {
      currentVersion = `${currentVersion}.0`;
    }

    currentVersion = semver.parse(currentVersion);
    if (currentVersion) {
      const commitMessage = github.context.payload.head_commit.message.toLowerCase();
      if (commitMessage.startsWith('breaking')) {
        nextVersion = `v${currentVersion.major + 1}.0.0`;
      } else if (commitMessage.startsWith('feature') || commitMessage.startsWith('feat')) {
        nextVersion = `v${currentVersion.major}.${currentVersion.minor + 1}.0`;
      } else if (commitMessage.startsWith('bugfix') || commitMessage.startsWith('hotfix')) {
        nextVersion = `v${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch + 1}`;
      } else {
        nextVersion = `v${semver.inc(currentVersion.version, 'patch')}`; // Default to patch increment
      }
    }
  }

  core.exportVariable('NEXT_VERSION', nextVersion);

} catch (error) {
  core.setFailed(`Action failed with error: ${error.message}`);
}
