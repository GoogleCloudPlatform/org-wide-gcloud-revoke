# Revoke gcloud authorization for all users in your organization

This code sample run in Google Appscript revokes authorization for the gcloud CLI from all users in your Google Workspace or Cloud Identity organization. You might want to revoke gcloud cli access if you suspect an attacker has compromised your environment and copied OAuth access tokens.

## How to use this sample code

For full context of when and why you might need to revoke gcloud tokens, see documentation at [Best practices for mitigating compromised OAuth tokens for Google Cloud CLI](https://cloud.google.com/architecture/bps-for-mitigating-gcloud-oauth-tokens).

To deploy code in Google Apps Script, review the [Google Apps Script Quickstart](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script) for directions to run this code and enable the Admin SDK API.
