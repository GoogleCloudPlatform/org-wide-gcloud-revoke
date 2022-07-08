/**
 * Remove access to the Google Cloud SDK for all users in an organization
 * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/tokens
 * @see https://developers.google.com/admin-sdk/directory/reference/rest/v1/users
 * @see https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services
 */

function listUsersAndInvalidate() {
  const users = AdminDirectory.Users.list({
    customer: 'my_customer' // alias to represent your account's customerId
    }).users;
  if (!users || users.length === 0) {
    Logger.log('No users found.');
    return;
  }
  for (const user of users){
    let tokens = AdminDirectory.Tokens.list(user.primaryEmail).items
    if (!tokens || tokens.length === 0) {
      continue;
    }
    for (const token of tokens) {
      if (token.clientId === "32555940559.apps.googleusercontent.com") {
        AdminDirectory.Tokens.remove(user.primaryEmail, token.clientId)
        Logger.log('Invalidated the tokens granted to gcloud for user %s', user.primaryEmail)
      }
    }
  }
}