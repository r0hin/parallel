const fs = require("fs");
const jwt = require("jsonwebtoken");

const privateKey = fs.readFileSync("key.p8").toString();
const teamId = "AJ39KS78CS";
const keyId = "9HA7FC7WM4";


const jwtToken = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  issuer: teamId,
  header: {
    alg: "ES256",
    kid: keyId
  }
});

console.log(jwtToken);