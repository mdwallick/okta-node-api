const config = {
    AUDIENCE:               `${process.env.AUDIENCE}`,          // This is the Audience in your Okta Authorization Server
    ISSUER:                 `${process.env.ISSUER}`,            // This is the Issuer in your Okta Authorization Server
    CLIENT_ID:              `${process.env.CLIENT_ID}`,         // This is the client ID of your application in Okta
    OKTA_ORG_URL:           `${process.env.OKTA_ORG_URL}`,      // The Okta org base URL
    OKTA_WORKFLOW_URL:      `${process.env.OKTA_WORKFLOW_URL}`,
    OKTA_API_SCOPES:        `${process.env.OKTA_API_SCOPES}`,   // The Okta API scopes that you wish to use
    OKTA_HOOK_AUTH:         `${process.env.OKTA_HOOK_AUTH}`,    // Set this as the 'Authentication secret' in your Okta Token Hook
    EMAIL_API_KEY:          `${process.env.EMAIL_API_KEY}`,
    EMAIL_FROM:             `${process.env.EMAIL_FROM}`,
    OTP_TEMPLATE_ID:        `${process.env.OTP_TEMPLATE_ID}`,
    ACTIVATION_TEMPLATE_ID: `${process.env.ACTIVATION_TEMPLATE_ID}`,
    SSPR_TEMPLATE_ID:       `${process.env.SSPR_TEMPLATE_ID}`
  }
  
  module.exports = config;
  