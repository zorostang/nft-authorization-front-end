// import http from 'http';
import cors from 'cors';
import express from 'express';
import { verify } from "curve25519-js";
import { SecretNetworkClient } from "secretjs";

const app = express()
const port = 3001
const CHAIN_ID = "pulsar-2";
const GRPC_URL = "https://pulsar-2.api.trivium.network:9091/"
const contractAddress = 'secret1tk808ayrwluck5wk8nssyh6n0fcy23zm96a60m';

//query client
const secretjs = await SecretNetworkClient.create({
  chainId: CHAIN_ID,
  grpcWebUrl: GRPC_URL,
});

app.use(express.static('src'))
  .use(express.urlencoded({ extended: false }))
  .use(cors());

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
  
  const publicMetadataQuery = {
    nft_info: {
      token_id: selected
    }
  }
  
  const { nft_info: { extension: { auth_key: public_key }}} = await secretjs.query.compute.queryContract({
    contractAddress: contractAddress,
    //codeHash: '19ccaec86f94e601ba922f3a74e5d8faa2a332dbad14475382ee255e42e8e2e3',
    query: publicMetadataQuery,
  });

  const uint8key = Uint8Array.from(public_key);
  const message = new Uint8Array([23,65,12,87]);
  const uint8signature = Uint8Array.from(signature.split(','));
  const verified = verify(uint8key, message, uint8signature);
  console.log(verified);

  if (verified) { res.send('Login endpoint!') }
  else { res.send('Invalid!') }
})