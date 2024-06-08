# save-and-store-env-vars

## Overview

Hello, amazing developer! 🤖 `save-and-store-env-vars` is a GitHub Action that helps you save and store global environment variables for use in your CI/CD pipelines. This action processes various inputs to generate and export several environment variables essential for your workflows.

## Usage

### Workflow Example

To use this action, add the following step to your GitHub Actions workflow:

```yaml
name: Test Save and Store Environment Variables

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run Save and Store Environment Variables Action
        uses: brainxio/save-and-store-env-vars@v1
        with:
          image_base: 'nodejs-base'
          image_version: 'v1-base'
          job_type: 'build'
          prefix: 'custom-prefix'

      - name: Print Environment Variables
        run: |
          echo "APP_NAME=${{ env.APP_NAME }}"
          echo "SAFE_BASENAME=${{ env.SAFE_BASENAME }}"
          echo "BUILDER_IMAGE_VERSION=${{ env.BUILDER_IMAGE_VERSION }}"
          echo "BUILD_ID=${{ env.BUILD_ID }}"
          echo "BUILDER_ID=${{ env.BUILDER_ID }}"
          echo "ARTIFACT_DIR=${{ env.ARTIFACT_DIR }}"
          echo "NEXT_VERSION=${{ env.NEXT_VERSION }}"
```

### Inputs

- `image_base`: The base image used for the build. (Required)
- `image_version`: The version of the image used for the build. (Required)
- `job_type`: The type of job being run. (Required)
- `prefix`: The prefix for the builder ID. (Required)

### Outputs

This action does not produce direct outputs, but it sets the following environment variables:

- `APP_NAME`: The name of the application, derived from the repository name.
- `SAFE_BASENAME`: A sanitized version of the base image name.
- `BUILDER_IMAGE_VERSION`: The version of the builder image, modified based on branch or event context.
- `BUILD_ID`: A unique identifier for the build.
- `BUILDER_ID`: A prefixed version of the build ID.
- `ARTIFACT_DIR`: The directory path for storing artifacts.
- `NEXT_VERSION`: The next semantic version based on the latest Git tag and commit message.

### Security and Best Practices

**Environment Variables**: Ensure all necessary environment variables are set correctly.

**File Paths**

: Validate and sanitize file paths to prevent security vulnerabilities.

**Error Handling**: Properly handle errors to avoid unexpected failures.

## Contributing

We welcome contributions to improve this action. Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the Unlicense License. See the [LICENSE](LICENSE) file for details.