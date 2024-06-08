const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

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

} catch (error) {
  core.setFailed(`Action failed with error: ${error.message}`);
}
