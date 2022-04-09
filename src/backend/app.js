// const http = require('http');
// const cors = require('cors');

import http from 'http';
import cors from 'cors';
import express from 'express';
import { verify } from "curve25519-js";
import { SecretNetworkClient } from "secretjs";


// const express = require('express')
const app = express()
const port = 3001

//query client
const contractAddress = 'secret1tk808ayrwluck5wk8nssyh6n0fcy23zm96a60m';
const secretjs = await SecretNetworkClient.create({
  chainId: "secret-4",
  grpcWebUrl: "https://grpc-web.azure-api.net",
});

app.use(express.static('src'))
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.post('/login', async(req, res) => {
  console.log(req.body);

  const signature = req.body.signature;
  if (signature) console.log(`Signature received`);
    else console.log(`Signature not received`);
  const selected = req.body.nft_id;
  console.log(`Token ID: ${selected}`);

  const message = new Uint8Array([23,65,12,87]);
  
  const publicMetadataQuery = {
    nft_info: {
      token_id: selected
    }
  }
  
  const { nft_info: { extension: { auth_key: pubKey } } } = (await secretjs.query.compute.queryContract({
    contractAddress: contractAddress,
    query: publicMetadataQuery,
  }));
  console.log(pubKey);

  console.log(`Public key: ${pubKey}`);
  // const verified = verify(pubKey, message, signature);

  // if (verified) { res.send('Login endpoint!') }
  // else { res.send('Invalid!')}

  res.send('Login endpoint!')
})

/*
console.log('try:');
console.log('  GET /hello.txt');
console.log('  GET /js/app.js');
console.log('  GET /css/style.css');

*/