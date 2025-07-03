# Revoke gcloud authorization for all users in your organization

This code sample run in Google Appscript revokes authorization for the gcloud CLI from all users in your Google Workspace or Cloud Identity organization. You might want to revoke gcloud cli access if you suspect an attacker has compromised your environment and copied OAuth access tokens.

## Available Scripts

### Basic Version (`Code.gs`)

Simple implementation for documentation and learning purposes.

### Production Version (`revoke-gcloud-production.gs`)

Production-ready script with safety features:

- **Dry run mode** - Test without making changes
- **Admin verification** - Check permissions before execution
- **Detailed logging** - Complete audit trail
- **Error handling** - Graceful failure recovery
- **Testing functions** - Verify setup before running

## How to use

For full context of when and why you might need to revoke gcloud tokens, see [Best practices for mitigating compromised OAuth tokens for Google Cloud CLI](https://cloud.google.com/architecture/bps-for-mitigating-gcloud-oauth-tokens).

To deploy code in Google Apps Script, review the [Google Apps Script Quickstart](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script) for directions to run this code and enable the Admin SDK API.

## Using the Production Script

### Setup

1. Create new Google Apps Script project
2. Copy contents of `revoke-gcloud-production.gs`
3. Enable Admin SDK API in Services
4. Run as Google Workspace/Cloud Identity admin

### Safe Usage

```javascript
// 1. Test API access first
debugApiAccess();

// 2. Always start with dry run
dryRun();

// 3. Run live with small batches
listUsersAndInvalidate(false, 10); // 10 users max

// For all employees: listUsersAndInvalidate(false, 1000) - if your company has 1000 people
```

⚠️ **Warning**: This immediately revokes gcloud access. Users need `gcloud auth login` to regain access.
