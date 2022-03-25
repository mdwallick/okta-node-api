# okta-node-api

Simple Node API with a basic Javascript front end. This illustrates how to
integrate with Okta using the [Okta Sign-in Widget](https://github.com/okta/okta-signin-widget).
There are several Okta features showcased here.

* Integration with the Okta Sign-In Widget
* A [custom TOTP authenticator](https://developer.okta.com/docs/reference/api/factors/#enroll-custom-hotp-factor) providing a multi-branded email OTP experience
* Okta API access via [OAuth for Okta](https://developer.okta.com/docs/guides/implement-oauth-for-okta/main/) using user-scoped tokens
* Basic user management to demonstrate [custom administrator roles](https://help.okta.com/en/prod/Content/Topics/Security/custom-admin-role/custom-admin-roles.htm)
* Backend API protection with [API Access Management](https://developer.okta.com/docs/concepts/api-access-management/) and token inline hooks

This example app is based on Shawn Recinto's [FunAuth lab](https://funauth.io/).

## Setup

There are a handful of things to set up to get this demo up and running.

1. Go get a free forever [Okta developer](https://developer.okta.com/signup/) tenant if you don't already have one
2. Set up the OIDC application
3. Set up the OAuth authorization server
4. Set up the AWS Lambda function that generates shared secrets for the custom
TOTP authenticator (this is part of the workflow)
5. Set up the workflow that enrolls new users in the custom TOTP authenticator

The rest of this README is a work in progress.
