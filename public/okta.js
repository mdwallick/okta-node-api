const oktaApiAuthClient = new OktaAuth({
  issuer: oktaUrl,
  clientId: clientId,
  redirectUri: redirectUri,
  tokenManager: {
    storage: 'sessionStorage'
  }
});

function callOktaAPI(url, method, body, accessToken, callback) {
  console.log("callOktaAPI()", url);

  let fullURL = oktaApiServicesBaseURL + url;
  console.log("fullURL", fullURL);
  console.log("body", body);

  const httpRequest = new XMLHttpRequest();
  httpRequest.open(method, fullURL);

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4) {
      //console.log(httpRequest.responseText);
      callback(httpRequest.responseText);
    }
  }

  httpRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
  httpRequest.setRequestHeader("Content-Type", "application/json");
  httpRequest.responseType = "text";

  if (accessToken) {
    httpRequest.setRequestHeader("Authorization", "Bearer " + accessToken);
  }

  httpRequest.send(JSON.stringify(body));
}

function getOktaApiToken() {
  console.log("getOktaApiToken()");
  // use the oktaApiAuthClient to get an Okta API OAuth token for the current user
  signIn.authClient.session.get()
    .then(function(session) {
      // session exists
      if (session.status == "ACTIVE") {
        oktaApiAuthClient.token.getWithoutPrompt({
            responseType: ['token'],
            scopes: okta_api_scopes
          }).then(function(res) {
            var tokens = res.tokens;
            // Do something with tokens, such as
            oktaApiAuthClient.tokenManager.setTokens(tokens);
            //console.log("API access token", tokens.accessToken);
            showApiAccessToken(tokens.accessToken.accessToken);
          })
          .catch(function(err) {
            console.log(err);
          })
      }
    });
}

function getGroupList() {
  oktaApiAuthClient.tokenManager.get('accessToken').then(function(token) {
    if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
      // Token is valid
      callOktaAPI(`/groups`, "GET", null, token.accessToken, (groupResponse) => {
        //console.log(groupResponse);
        let groups = JSON.parse(groupResponse);
        console.log(groups);
        return groups;
      });
    }
  });
}

function getGroupByName(groupName) {
  oktaApiAuthClient.tokenManager.get('accessToken').then(function(token) {
    if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
      // Token is valid
      callOktaAPI(`/groups?q=${groupName}`, "GET", null, token.accessToken, (groupResponse) => {
        //console.log(groupResponse);
        let groups = JSON.parse(groupResponse);
        console.log(groups);
        return groups[0].id;
      });
    }
  });
}

function createUser() {
  console.log("createUser()");
  hideModal();
  showLoader();

  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid

        // get the group ID by name
        let userProfile = {
          "profile": {
            "login": $("#email_addy").val(),
            "firstName": $("#first_name").val(),
            "lastName": $("#last_name").val(),
            "email": $("#email_addy").val()
          },
          "groupIds": [
            // FIXME make this not be hard coded
            "00gi9cepczyex44cK696"
          ]
        }

        callOktaAPI("/users?activate=false", "POST", userProfile, token.accessToken, (userResponse) => {
          //console.log("userResponse", userResponse);
          let userProfile = JSON.parse(userResponse);
          if (userProfile.errorSummary) {
            alert(userProfile.errorSummary);
            hideLoader();
          } else {
            loadUserList();
            hideLoader();
            alert("User Create Completed");
          }
        });
      }
    });
}

function updateUser() {
  let user_id = $('#userId').val();
  console.log("updateUser()", user_id);
  hideModal();
  showLoader();
  let userProfile = {
    "profile": {
      "login": $("#email_addy").val(),
      "firstName": $("#first_name").val(),
      "lastName": $("#last_name").val(),
      "email": $("#email_addy").val(),
      "mobilePhone": $("#phone").val()
    }
  }

  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI(`/users/${user_id}`, "POST", userProfile, token.accessToken, (userResponse) => {
          //console.log("userResponse", userResponse);
          let userProfile = JSON.parse(userResponse);
          if (userResponse.errorSummary) {
            alert(userProfile.errorSummary);
          } else {
            loadUserList();
            hideLoader();
            alert("User Update Completed");
          }
        });
      } else {
        // token has expired

      }
    });
}

function changePassword() {
  console.log("changePassword()");
  let password = prompt("Enter your new password");
  if (password) {
    let userProfile = {
      "profile": {},
      "credentials": {
        "password": { "value": password }
      }
    }

    showLoader();
    oktaApiAuthClient.tokenManager.get('accessToken')
      .then(function(token) {
        if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
          // Token is valid
          callOktaAPI("/users", "POST", userProfile, token.accessToken, (userResponse) => {
            //console.log("userResponse", userResponse);
            let userProfile = JSON.parse(userResponse);
            //console.log("userProfile", userProfile);
            marhsalToUserForm(userProfile);
            hideLoader();
            alert("User Password Update Completed");
          });
        }
      });
  }
}

function loadUserList() {
  console.log("loadUserList()");
  $('#userListTable').empty()
  showLoader();

  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      //console.log("Got API access token");
      //console.log(token.accessToken);
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI("/users", "GET", null, token.accessToken, (userResponse) => {
          //console.log("userResponse", userResponse);
          let userList = JSON.parse(userResponse);
          marshalToUserList(userList);
          hideLoader();
        });
      } else {
        console.log("No valid Okta API access token in storage");
        hideLoader();
      }
    }).catch(function(err) {
      console.log("Error", err);
      hideLoader();
    });
}

function getUser() {
  let user_id = $(this).data('id');
  console.log("getUser", user_id);
  showLoader();

  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI(`/users/${user_id}`, "GET", null, token.accessToken, (userResponse) => {
          //console.log("userResponse", userResponse);
          let userProfile = JSON.parse(userResponse);
          marhsalToUserForm(userProfile);
          showModal('editUserModal');
          hideLoader();
        });
      } else {
        hideLoader();
      }
    }).catch(function(err) {
      console.log("Error", err);
      hideLoader();
    });
}

function activateUser() {
  let user_id = $(this).data('id');
  console.log("activateUser()", user_id);
  showLoader();
  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI(`/users/${user_id}/lifecycle/activate`, "POST", null, token.accessToken, (userResponse) => {
          console.log("userResponse", userResponse);
          loadUserList();
          hideLoader();
        });
      } else {
        hideLoader();
      }
    }).catch(function(err) {
      console.log("Error", err);
      hideLoader();
    });
}

function resetPassword() {
  let user_id = $(this).data('id');
  console.log("resetPassword()", user_id);
  showLoader();
  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI(`/users/${user_id}/lifecycle/reset_password`, "POST", null, token.accessToken, (userResponse) => {
          console.log("userResponse", userResponse);
          loadUserList();
          hideLoader();
        });
      } else {
        hideLoader();
      }
    }).catch(function(err) {
      console.log("Error", err);
      hideLoader();
    });
}

function suspendUser() {
  let user_id = $(this).data('id');
  console.log("suspendUser()", user_id);
  showLoader();
  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI(`/users/${user_id}/lifecycle/suspend`, "POST", null, token.accessToken, (userResponse) => {
          console.log("userResponse", userResponse);
          loadUserList();
          hideLoader();
        });
      } else {
        hideLoader();
      }
    }).catch(function(err) {
      console.log("Error", err);
      hideLoader();
    });
}

function unsuspendUser() {
  let user_id = $(this).data('id');
  console.log("unsuspendUser()", user_id);
  showLoader();
  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI(`/users/${user_id}/lifecycle/unsuspend`, "POST", null, token.accessToken, (userResponse) => {
          console.log("userResponse", userResponse);
          loadUserList();
          hideLoader();
        });
      } else {
        hideLoader();
      }
    }).catch(function(err) {
      console.log("Error", err);
      hideLoader();
    });
}

function deleteUser() {
  let user_id = $(this).data('id');
  console.log("deleteUser()", user_id);
  showLoader();
  oktaApiAuthClient.tokenManager.get('accessToken')
    .then(function(token) {
      if (token && !oktaApiAuthClient.tokenManager.hasExpired(token)) {
        // Token is valid
        callOktaAPI(`/users/${user_id}`, "DELETE", null, token.accessToken, (userResponse) => {
          console.log("userResponse", userResponse);
          loadUserList();
          hideLoader();
        });
      } else {
        hideLoader();
      }
    }).catch(function(err) {
      console.log("Error", err);
      hideLoader();
    });
}

function marhsalToUserForm(userProfile) {
  console.log("marhsalToUserForm()");

  if (userProfile.status == "failed") {
    //alert(userProfile.message);
    console.log("Failed!", userProfile.message);
  } else if (userProfile.errorSummary) {
    //alert(userProfile.errorSummary);
    console.log("Failed!", userProfile.errorSummary);
  } else {
    $("#userId").val(userProfile.id);
    $("#username").val(userProfile.profile.login);
    $("#firstName").val(userProfile.profile.firstName);
    $("#lastName").val(userProfile.profile.lastName);
    $("#email").val(userProfile.profile.email);
    $("#phone").val(userProfile.profile.mobilePhone);
  }
}

function marshalToUserList(userList) {
  console.log("marshalToUserList()");
  //console.log("userList", userList);
  buildHtmlTable(userList, '#userListTable');
}

// Builds the HTML Table out of data.
function buildHtmlTable(data, selector) {
  addAllColumnHeaders(data, selector);
  var currentUserId = $('#currentUserId').val();

  for (var i = 0; i < data.length; i++) {
    //console.log("data", data[i]);
    var row$ = $('<tr/>');
    var user_id = data[i].id;
    var user_status = data[i].status;
    var full_name = data[i].profile.firstName + ' ' + data[i].profile.lastName;
    var email = data[i].profile.email;
    var phone = data[i].profile.mobilePhone;

    var edit_link = $('<a/>').attr('href', '#').attr('data-id', user_id).text(full_name).click(getUser);
    var activate_button = $('<button/>').attr('class', 'activate').attr('data-id', user_id).text('Activate').click(activateUser);
    var reset_password_button = $('<button/>').attr('class', 'resetpw').attr('data-id', user_id).text('Reset Password').click(resetPassword);
    var suspend_button = $('<button/>').attr('class', 'suspend').attr('data-id', user_id).text('Suspend').click(suspendUser);
    var unsuspend_button = $('<button/>').attr('class', 'unsuspend').attr('data-id', user_id).text('UnSuspend').click(unsuspendUser);
    // var delete_button = $('<button/>').attr('class', 'delete').attr('data-id', user_id).text('Delete').click(deleteUser);

    row$.append($('<td/>').html(edit_link));
    row$.append($('<td/>').html(email));
    row$.append($('<td/>').html(phone));
    row$.append($('<td/>').html(user_status));

    cell$ = $("<td/>");
    if (currentUserId != user_id) {
      switch (user_status) {
        case "ACTIVE":
          cell$.append(reset_password_button).append(suspend_button);
          break;
        case "SUSPENDED":
          cell$.append(unsuspend_button);
          break;
        case "STAGED":
          cell$.append(activate_button);
          break;
      }
    } else {
      cell$.append(reset_password_button);
    }
    row$.append(cell$);
    $(selector).append(row$);
  }
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(data, selector) {
  var columnSet = [];
  var headerTr$ = $('<tr/>');
  headerTr$.append($('<th/>').html('Name'));
  headerTr$.append($('<th/>').html('Email'));
  headerTr$.append($('<th/>').html('Phone'));
  headerTr$.append($('<th/>').html('Status'));
  headerTr$.append($('<th/>').html('Actions'));
  $(selector).append(headerTr$);
  //return columnSet;
}
