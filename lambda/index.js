exports.handler = async (event) => {
    const speakeasy = require("speakeasy");
    const options = {
        length: 64
    }
    let shared_secret = speakeasy.generateSecret(options);
    console.log("shared secret", shared_secret.base32);
    let body = {
        "shared_secret": shared_secret.base32
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify(body),
    };
    return response;
};
