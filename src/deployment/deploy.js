
const fs = require("fs");
const secureRandom = require("secure-random");
const { Wallet, SecretNetworkClient, MsgSend, MsgMultiSend, BroadcastMode } = require("secretjs");

require('dotenv').config();

const label = Buffer.from(secureRandom(8, { type: "Uint8Array" })).toString("base64")

const initMsg = {
    name: "MTC Golden Tickets",
    symbol: "MTCGT",
    entropy: Buffer.from(secureRandom(32, { type: "Uint8Array" })).toString("base64"),
    royalty_info: {
        decimal_places_in_rates: 2,
        royalties: [{
                recipient: "secret1yalnnp3sv2wn4ms59ts2w0hwuzyrj24uld2dwc",
                rate: 05
            }
        ]
    },
    config: {
        public_token_supply: true,
        public_owner: false,
        enable_sealed_metadata: false,
        unwrapped_metadata_is_private: true,
        minter_may_update_metadata: false,
        owner_may_update_metadata: false,
        enable_burn: false
    }
};

main = async() => {
    const wallet = new Wallet(process.env.MNEMONIC);
    const myAddress = wallet.address;
    console.log("Wallet Address: ", myAddress);

    // To create a signer secret.js client, also pass in a wallet
    const secretjs = await SecretNetworkClient.create({
        grpcWebUrl: process.env.GRPC_URL,
        chainId: process.env.CHAIN_ID,
        wallet: wallet,
        walletAddress: myAddress,
    });

    const storeTx = await secretjs.tx.compute.storeCode(
        {
          sender: myAddress,
          wasmByteCode: fs.readFileSync(
            `${__dirname}/contracts/nftauth.wasm.gz`,
          ),
          source: "https://github.com/zorostang/nft-authorization",
          builder: "enigmampc/secret-contract-optimizer:1.0.6",
        },
        {
          gasLimit: 5_000_000,
          broadcastMode: BroadcastMode.Sync
        },
    );

    if (storeTx.code) throw storeTx.rawLog;
      
    // Get the code ID from the logs
    const codeId = Number(
        storeTx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
          .value,
    );

    const codeHash = await secretjs.query.compute.codeHash(codeId)

    console.log('Code ID: ', codeId)
    console.log('Code Hash: ', codeHash)

    //instantiate NFT contract
    console.log('Instantiating NFT contract...')
    const instantiateTx = await secretjs.tx.compute.instantiateContract(
      {
        sender: myAddress,
        codeId: codeId,
        codeHash: codeHash, // optional but way faster
        initMsg: initMsg,
        label: label,
      },
      {
        gasLimit: 100_000,
        gasPriceInFeeDenom: 0.25,
        feeDenom: "uscrt",
        broadcastMode: BroadcastMode.Sync
      },
    );
      
    if (instantiateTx.code) throw storeTx.rawLog;

    const contractAddress = instantiateTx.arrayLog.find(
      (log) => log.type === "message" && log.key === "contract_address",
    ).value;

    console.log('Contract Address: ', contractAddress)


}

main();
