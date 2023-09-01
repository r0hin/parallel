const fs = require("fs");
const jwt = require("jsonwebtoken");

const privateKey = fs.readFileSync("key.p8").toString();
const teamId = "Z2DNYB8D62";
const keyId = "X9B3LH4THP";


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