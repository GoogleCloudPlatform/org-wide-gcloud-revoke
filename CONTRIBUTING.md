# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution;
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code Reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Linting and Formatting

Many of the files in the repository are checked against linting tools and static
code analysis for secure coding practices. This workflow is triggered by
[.github/workflows/lint.yaml](.github/workflows/lint.yaml), running multiple
lint libraries in [Super-Linter](https://github.com/super-linter/super-linter)
with the settings configured in
[.github/linters/super-linter.env](.github/linters/super-linter.env)

1.  To validate that your code passes these checks, use the following methods
    depending on your environment:

    1.  **GitHub Actions**: GitHub Actions will automatically run all configured
        checks when a PR is created or modified.

    1.  **Local**: You can manually trigger the tests in a docker container from
        your local environment with the following command:

        ```bash
            docker run --rm \
            -e RUN_LOCAL=true \
            --env-file ".github/linters/super-linter.env" \
            -v "$(pwd)":/tmp/lint \
            ghcr.io/super-linter/super-linter:latest
        ```

## Community Guidelines

This project follows [Google's Open Source Community
Guidelines](https://opensource.google/conduct/).
