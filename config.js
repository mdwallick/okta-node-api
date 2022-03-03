const config = {
    AUDIENCE:        `${process.env.AUDIENCE}`,        // This is the Audience in your Okta Authorization Server
    ISSUER:          `${process.env.ISSUER}`,          // This is the Issuer in your Okta Authorization Server
    CLIENT_ID:       `${process.env.CLIENT_ID}`,       // This is the client ID of your application in Okta
    OKTA_ORG_URL:    `${process.env.OKTA_ORG_URL}`,    // The Okta org base URL
    OKTA_API_SCOPES: `${process.env.OKTA_API_SCOPES}`, // The Okta API scopes that you wish to use
    OKTA_HOOK_AUTH:  `${process.env.OKTA_HOOK_AUTH}`   // Set this as the 'Authentication secret' in your Okta Token Hook
  }
  
  module.exports = config;
  