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
        uses: actions/checkout@v2

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
