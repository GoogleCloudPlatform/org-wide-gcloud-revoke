# Revoke gcloud for all users in your organization

This code sample run in Google Appscript revokes authorization for the gcloud sdk from all users in your Google Workspace or Cloud Identity organization. You might want to revoke gcloud sdk access if you suspect an attacker has compromised your environment and might have stolen OAuth tokens.

## How to use this sample code

For full context of when and why you might need to revoke gcloud tokens, see documentation at [Mitigating the threat of stolen gcloud OAuth tokens](cloud.google.com/architecture/stolen-gcloud-tokens).

For deplopying code in Google Apps Script, review the [Google Apps Script Quickstart](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script) for directions on how to run this code and enable the Admin SDK API.