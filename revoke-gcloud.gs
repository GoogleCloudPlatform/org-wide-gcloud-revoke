/**
 * Remove access to the Google Cloud CLI for all users in an organization
 *
 * This script uses the Google Admin SDK Directory API to:
 * 1. List all users in your Google Workspace/Cloud Identity organization
 * 2. For each user, find any OAuth tokens granted to the gcloud CLI
 * 3. Revoke those tokens, effectively removing gcloud CLI access
 *
 * Note: This script provides a centralized, administrative approach to token revocation.
 * For individual revocation, users can also use the `gcloud auth revoke` command locally.
 * This script is particularly valuable in security incidents where you need to revoke
 * access across the entire organization without accessing individual machines.
 *
 * Prerequisites:
 * - Must be run by a Google Workspace/Cloud Identity admin
 * - Admin SDK API must be enabled in the Apps Script project
 * - Script needs Directory API scopes (automatically requested on first run)
 *
 * Feature Functions which you can use:
 * - Dry run mode - Test without making changes
 * - Admin verification - Check permissions before execution
 * - Detailed logging - Complete audit trail
 * - Error handling - Graceful failure recovery
 * - Testing functions - Verify setup before running
 *
 * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/tokens
 * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/users
 * @see https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services
 */

/**
 * Configuration constants
 */
const GCLOUD_CLIENT_ID = "32555940559.apps.googleusercontent.com";
const MAX_USERS_TO_PROCESS = 10; // Safety limit for testing

/**
 * Test basic API connectivity and permissions
 */
function debugApiAccess() {
  Logger.log("=== DEBUG: API ACCESS TEST ===");

  try {
    // Test 1: Check if AdminDirectory service is available
    Logger.log("Test 1: Checking AdminDirectory service availability...");
    if (typeof AdminDirectory === "undefined") {
      Logger.log(
        "❌ AdminDirectory service not found. Please enable Admin SDK API in Services."
      );
      return;
    }
    Logger.log("✓ AdminDirectory service is available");

    // Test 2: Try to get current user info (simpler call)
    Logger.log("Test 2: Attempting to get current user info...");
    try {
      const currentUser = Session.getActiveUser().getEmail();
      Logger.log("✓ Current user: %s", currentUser);
    } catch (e) {
      Logger.log("⚠️ Could not get current user: %s", e.toString());
    }

    // Test 3: Try the users.list call with more detailed error handling
    Logger.log("Test 3: Attempting AdminDirectory.Users.list...");
    const listParams = {
      customer: "my_customer",
      maxResults: 5,
    };
    Logger.log("Using parameters: %s", JSON.stringify(listParams));

    const response = AdminDirectory.Users.list(listParams);
    Logger.log("✓ API call successful!");
    Logger.log("Response type: %s", typeof response);

    if (response.users) {
      Logger.log("✓ Found %s users", response.users.length);
      response.users.forEach((user, index) => {
        Logger.log("  %s. %s", index + 1, user.primaryEmail);
      });
    } else {
      Logger.log("⚠️ No users array in response");
      Logger.log("Full response: %s", JSON.stringify(response));
    }
  } catch (error) {
    Logger.log("❌ Error details:");
    Logger.log("  Error type: %s", error.name);
    Logger.log("  Error message: %s", error.message);
    Logger.log("  Full error: %s", error.toString());

    // Check for specific error types
    if (error.toString().includes("Invalid Input")) {
      Logger.log("");
      Logger.log('TROUBLESHOOTING "Invalid Input" error:');
      Logger.log("1. Verify you are a Google Workspace/Cloud Identity admin");
      Logger.log("2. Check that Admin SDK API is enabled");
      Logger.log("3. Ensure you have the necessary admin privileges");
      Logger.log("4. Try running the script with a super admin account");
    }
  }
}

/**
 * Check admin privileges and permissions
 */
function checkAdminPrivileges() {
  Logger.log("=== DEBUG: ADMIN PRIVILEGES CHECK ===");

  try {
    const currentUser = Session.getActiveUser().getEmail();
    Logger.log("Current user: %s", currentUser);

    // Try to get information about the current user
    const userInfo = AdminDirectory.Users.get(currentUser);
    Logger.log("✓ Can access user info for current user");
    Logger.log("User info: %s", JSON.stringify(userInfo, null, 2));
  } catch (error) {
    Logger.log("❌ Cannot access user info: %s", error.toString());
    Logger.log("This suggests insufficient admin privileges");
  }
}

/**
 * Helper function to just list users without processing tokens (safest test)
 */
function listUsersOnly() {
  Logger.log("=== LISTING USERS ONLY (No token processing) ===");

  try {
    const users = AdminDirectory.Users.list({
      customer: "my_customer",
      maxResults: 10,
    }).users;

    if (!users || users.length === 0) {
      Logger.log("No users found.");
      return;
    }

    Logger.log("Found %s users:", users.length);
    users.forEach((user, index) => {
      Logger.log(
        "%s. %s (%s)",
        index + 1,
        user.primaryEmail,
        user.name?.fullName || "No name"
      );
    });
  } catch (error) {
    Logger.log("Error: %s", error.toString());
  }
}

/**
 * Main function to revoke gcloud CLI access tokens
 * @param {boolean} dryRun If true, only logs actions without actually revoking tokens
 * @param {number} maxUsers Maximum number of users to process (for testing)
 */
function listUsersAndInvalidate(
  dryRun = false,
  maxUsers = MAX_USERS_TO_PROCESS
) {
  const startTime = new Date();

  // Log execution details
  Logger.log("=== gcloud Token Revocation Script ===");
  Logger.log("Start time: %s", startTime.toISOString());
  Logger.log(
    "Mode: %s",
    dryRun ? "DRY RUN (no actual revocation)" : "LIVE (will revoke tokens)"
  );
  Logger.log("Max users to process: %s", maxUsers);
  Logger.log("");

  // Track statistics for reporting
  let stats = {
    totalUsers: 0,
    usersProcessed: 0,
    usersWithGcloudTokens: 0,
    tokensRevoked: 0,
    errors: 0,
    userDetails: [],
  };

  try {
    // Get all users in the organization
    Logger.log("Fetching users from organization...");
    const users = AdminDirectory.Users.list({
      customer: "my_customer", // alias for your organization's customer ID
      maxResults: maxUsers, // Limit for testing
    }).users;

    // Check if any users were found
    if (!users || users.length === 0) {
      Logger.log("No users found in the organization.");
      return stats;
    }

    stats.totalUsers = users.length;
    Logger.log("Found %s users in the organization", users.length);
    Logger.log("");

    // Process each user
    for (let i = 0; i < users.length && i < maxUsers; i++) {
      const user = users[i];
      stats.usersProcessed++;

      Logger.log(
        "Processing user %s/%s: %s",
        i + 1,
        Math.min(users.length, maxUsers),
        user.primaryEmail
      );

      try {
        // Get all OAuth tokens for this user
        const tokensResponse = AdminDirectory.Tokens.list(user.primaryEmail);
        const tokens = tokensResponse.items;

        // Log token information for this user
        if (!tokens || tokens.length === 0) {
          Logger.log("  No OAuth tokens found for user: %s", user.primaryEmail);
          continue;
        }

        Logger.log(
          "  Found %s OAuth token(s) for user: %s",
          tokens.length,
          user.primaryEmail
        );

        let userHasGcloudToken = false;
        let gcloudTokensCount = 0;

        // Check each token to find gcloud CLI tokens
        for (const token of tokens) {
          Logger.log("  Token client ID: %s", token.clientId);

          // Check if this is a gcloud CLI token
          if (token.clientId === GCLOUD_CLIENT_ID) {
            userHasGcloudToken = true;
            gcloudTokensCount++;

            if (dryRun) {
              Logger.log(
                "  [DRY RUN] Would revoke gcloud token for: %s",
                user.primaryEmail
              );
            } else {
              // Actually revoke the token
              AdminDirectory.Tokens.remove(user.primaryEmail, token.clientId);
              Logger.log("  ✓ Revoked gcloud token for: %s", user.primaryEmail);
              stats.tokensRevoked++;
            }
          }
        }

        if (userHasGcloudToken) {
          stats.usersWithGcloudTokens++;
          stats.userDetails.push({
            email: user.primaryEmail,
            gcloudTokensCount: gcloudTokensCount,
          });
        } else {
          Logger.log(
            "  No gcloud tokens found for user: %s",
            user.primaryEmail
          );
        }
      } catch (userError) {
        stats.errors++;
        Logger.log(
          "  ❌ Error processing user %s: %s",
          user.primaryEmail,
          userError.toString()
        );
      }

      Logger.log(""); // Empty line for readability
    }
  } catch (error) {
    Logger.log("❌ Fatal error: %s", error.toString());
    stats.errors++;
    return stats;
  }

  // Log summary statistics
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;

  Logger.log("=== EXECUTION SUMMARY ===");
  Logger.log("Execution time: %s seconds", duration);
  Logger.log("Total users in org: %s", stats.totalUsers);
  Logger.log("Users processed: %s", stats.usersProcessed);
  Logger.log("Users with gcloud tokens: %s", stats.usersWithGcloudTokens);

  if (stats.usersWithGcloudTokens > 0) {
    Logger.log("Users with gcloud tokens:");
    stats.userDetails.forEach((user) => {
      Logger.log("  - %s (%s token(s))", user.email, user.gcloudTokensCount);
    });
  }

  if (!dryRun) {
    Logger.log("Tokens successfully revoked: %s", stats.tokensRevoked);
  } else {
    Logger.log("Tokens that would be revoked: %s", stats.usersWithGcloudTokens);
  }

  Logger.log("Errors encountered: %s", stats.errors);
  Logger.log("End time: %s", endTime.toISOString());

  return stats;
}

/**
 * Helper function to run in dry run mode (safe testing)
 */
function dryRun() {
  return listUsersAndInvalidate(true, 5); // Process only 5 users in dry run
}
