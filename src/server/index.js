const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const queryString = require('query-string');
const XMLHttpRequest = require("xhr2").XMLHttpRequest;

const config = require('../../config.js');
const endpointHandlers = require('./endpointHandlers.js');
const webHookHandlers = require('./webHookHandlers.js');

const app = express();
app.use(cors());
app.use(express.json());

console.log(`Issuer: ${config.ISSUER}`);

app.get('/', (req, res) => {
  res.send('This is the funAuth API');
});

app.get('/api/public', (req, res) => {
  endpointHandlers.handlePublic(req, res);
});

app.get('/api/private', (req, res) => {
  endpointHandlers.handlePrivate(req, res);
});

app.get('/api/access', (req, res) => {
  endpointHandlers.handleAccess(req, res);
});

app.post('/api/access-hook', (req, res) => {
  webHookHandlers.tokenHandler(req, res);
});

app.post('/api/send-email-challenge', (req, res) => {
  console.log("/api/send-email-challenge");
  res.setHeader('Content-Type', 'application/json');

  let userId = req.body.userId;
  console.log("Getting userId", userId);
  getUser(userId, (response) => {
    let user = JSON.parse(response);
    //console.log(user);
    let user_name = user.profile.login;
    let shared_secret = user.profile.otp_shared_secret;
    // send the email OTP via Sendgrid
    sendEmail(user_name, shared_secret, (response) => {
      //console.log(response);
      res.end(JSON.stringify(response));
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`funAuth app listening on port ${port}!`));

//////////////////////
// helper functions //
//////////////////////
function sendEmail(user_name, shared_secret, callback) {
  const mailer = require('@sendgrid/mail');
  mailer.setApiKey(config.SENDGRID_API_KEY);

  let token = generateOTP(shared_secret);
  let msg = {
    from: `noreply@${config.SENDGRID_FROM_DOMAIN}`,
    template_id: config.SENDGRID_TEMPLATE_ID,
    personalizations: [{
      to: { email: user_name },
      dynamic_template_data: {
        verificationToken: token
      }
    }]
  };

  mailer.send(msg).then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
      callback(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

function generateOTP(shared_secret) {
  let totp = require("totp-generator");
  let params = { algorithm: "SHA-512", period: 30 };
  let token = totp(shared_secret, params);
  return token;
}

/////////////////////////////////////
// Okta API stuff, not user-scoped //
/////////////////////////////////////
const OKTA_API_HEADERS = [
  { "key": "Content-Type", "value": "application/json" },
  { "key": "Accept", "value": "application/json" },
  { "key": "Authorization", "value": "Bearer " }
];

const OKTA_OAUTH_HEADERS = [
  { "key": "Content-Type", "value": "application/x-www-form-urlencoded" },
  { "key": "Accept", "value": "application/json" }
];

function getUser(userId, callback) {
  console.log("getUser()");
  let okta_url = process.env.OKTA_ORG_URL;
  let url = `${okta_url}/api/v1/users/${userId}`;
  callOktaAPI(url, "GET", null, callback);
}

function callOktaAPI(url, method, body, callback) {
  console.log("callOktaAPI()", url);
  let scopes = 'okta.users.read okta.apps.read';
  getOktaAPIOAuthToken(scopes, (oAuthResponse) => {
    OKTA_API_HEADERS[2].value = `Bearer ${oAuthResponse}`;
    httpCaller(url, method, body, OKTA_API_HEADERS, callback);
  });
}

// May want to adjust this to cache the token and refresh it when expired...
// no need to always get a token for every request
function getOktaAPIOAuthToken(scopes, callBack) {
  console.log("getOktaAPIOAuthToken");
  let signedJwt = createClientCredentialJwt();
  let url = `${process.env.OKTA_ORG_URL}/oauth2/v1/token`;
  let body = {
    "grant_type": "client_credentials",
    "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    "client_assertion": signedJwt,
    "scope": scopes
  }
  body = queryString.stringify(body);

  httpCaller(url, "POST", body, OKTA_OAUTH_HEADERS, (oAuthResponse) => {
    //console.log("oAuthResponse", oAuthResponse);
    let accessToken = JSON.parse(oAuthResponse).access_token
    callBack(accessToken);
  });
}

function createClientCredentialJwt() {
  let signedJwtPayload = {
    "aud": `${process.env.OKTA_ORG_URL}/oauth2/v1/token`,
    "iss": process.env.OKTA_API_CLIENT_ID,
    "sub": process.env.OKTA_API_CLIENT_ID,
    "exp": Math.floor(Date.now() / 1000) + (60 * 60)
  }
  let privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
  let signedJwt = jwt.sign(signedJwtPayload, privateKey, { algorithm: 'RS256' });
  return signedJwt;
}

function httpCaller(url, method, body, headers, callback) {
  console.log("httpCaller()", url);
  const httpRequest = new XMLHttpRequest();
  httpRequest.open(method, url);

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4) {
      //console.log("httpRequest.responseText", httpRequest.responseText);
      callback(httpRequest.responseText);
    }
  }

  if (headers) {
    for (let itemIndex in headers) {
      httpRequest.setRequestHeader(headers[itemIndex].key, headers[itemIndex].value);
    }
  }

  httpRequest.responseType = "text";

  if (body) {
    httpRequest.send(body);
  } else {
    httpRequest.send();
  }
}
