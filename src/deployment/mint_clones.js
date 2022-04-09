require('dotenv').config();
const { Wallet, SecretNetworkClient, MsgSend, MsgMultiSend, BroadcastMode } = require("secretjs");

//const textEncoding = require('text-encoding');
//const TextDecoder = textEncoding.TextDecoder;

const contractAddress = 'secret1tk808ayrwluck5wk8nssyh6n0fcy23zm96a60m';

const mintMsg = {
    mint_nft_clones: {
        mint_run_id: "1",
        quantity: 10,
        owner: "secret14fa9jm9g5mjs35yxarh057lesy4zszw5gavcun",
        //owner: process.env.ACCT_ADDRESS,
        public_metadata: {
            extension: {
              name: "MTC Golden Token",
              image: "https://2js4ov65zeljocwwkl6a3xaezxudwlrqaq2tzkltht4rlv5sti.arweave.net/0mXHV93_JFpcK1lL8DdwEzeg7LjAENTypczz5Fdeymo"
            }
        },/*
        private_metadata: {
            extension: {
              name: "MTC Golden Token",
              image: "https://2js4ov65zeljocwwkl6a3xaezxudwlrqaq2tzkltht4rlv5sti.arweave.net/0mXHV93_JFpcK1lL8DdwEzeg7LjAENTypczz5Fdeymo"
            }
        },*/
        //token_id:"Golden Token2",
		/*serial_number: {
			mint_run: 1,
			serial_number: 1,
            quantity_minted_this_run: 100,
		}*/
    }
}  

const main = async () => {
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

    const tx = await secretjs.tx.compute.executeContract({
        sender: myAddress,
        contractAddress: contractAddress,
        //codeHash: process.env.NFT_CODE_HASH,
        msg: mintMsg
    },
    {
        gasLimit: 200_000,
        gasPriceInFeeDenom: 0.25,
        feeDenom: "uscrt",
        broadcastMode: BroadcastMode.Sync
    })

    if (tx.code) throw tx.rawLog;

    // Get the minted IDs from the logs
    const firstMinted = Number(
        tx.arrayLog.find((log) => log.type === "wasm" && log.key === "first_minted")
            .value,
    );
    const lastMinted = Number(
        tx.arrayLog.find((log) => log.type === "wasm" && log.key === "last_minted")
            .value,
    );

    console.log(`
        Minted ${lastMinted-firstMinted+1} NFTs.
        First ID: ${firstMinted}
        Last ID: ${lastMinted}
        Gas Used: ${tx.gasUsed}
    `);
}

main().then(resp => {
    console .log("Done.");
}).catch(err => {
    if (err.message?.toString().includes("timed out waiting for tx to be included in a block")) {
        console.error("ERROR: Timed out waiting for TX to be processed. The TX is in the mempool and will likely be processed soon, check an explorer to confirm.");
    } else {
        console.error(err);
    }
})
