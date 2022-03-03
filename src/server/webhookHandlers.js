const config = require('../../config.js');

function between(minimum, maximum) {
  return Math.floor(
    Math.random() * (maximum - minimum) + minimum
  )
}

module.exports = {
  tokenHandler: function(req, res) {
    console.log("webHookHandlers.tokenHandler()");
    //console.log("auth: " + auth + " config.OKTA_HOOK_AUTH: " + config.OKTA_HOOK_AUTH);
    let auth = req.get("Authorization");
    let results = {}

    if (auth == config.OKTA_HOOK_AUTH) {
      results = {
        "commands": [{
            "type": "com.okta.identity.patch",
            "value": [{
              "op": "add",
              "path": "/claims/account_number",
              "value": "F0" + between(1000, 9999) + "-" + between(1000, 9999)
            }]
          },
          {
            "type": "com.okta.access.patch",
            "value": [{
              "op": "add",
              "path": "/claims/access",
              "value": "GRANTED"
            }]
          }
        ]
      };
    } else {
      results = {
        "success": false,
        "message": "Requires Auth to call this hook."
      }
      res.status(403);
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(results));
  }
}
