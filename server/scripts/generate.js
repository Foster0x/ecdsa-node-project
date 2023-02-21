const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();
// the private key displayed is in hex
console.log('private key:', toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);
// the public key displayed is in hex
console.log('public key:', toHex(publicKey));