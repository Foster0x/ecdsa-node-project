const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes }= require("ethereum-cryptography/utils");
const { raw } = require("express");

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  // TODO: get a signature from the client-side application
  // recover the public address from the signature--will be the sender

  const { sender, recipient, amount } = req.body;

  let sendDetailsError = await validateSendDetails(req.body);
  if (sendDetailsError) {
    res.status(400).send(sendDetailsError);
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

async function validateSendDetails(body) {
  const { sender, recipient, amount, signature, messageHash, publicKey } = body;
  if (!isSignatureVerified(signature, messageHash, publicKey)) {
    return { message: "Not a verified signature" };
  }

  if (await doesSendDetailsmatchMessagehash(sender, amount, recipient, messageHash)) {
    return { message: "Send details do not match message hash" };
  }

  return null;
}

function isSignatureVerified(signature, messageHash, publicKey) {
  return secp.verify(signature, messageHash, publicKey);
}

async function doesSendDetailsmatchMessagehash(sender, amount, recipient, messageHash) {
  let rawMessagehash = await secp.utils.sha256(utf8ToBytes(JSON.stringify({
    sender, amount, recipient
  })));
  return messageHash !== toHex(rawMessagehash);
}

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
