import { ethers, BigNumber } from "ethers";
import { create } from "@connext/nxtp-sdk";
import { signer, nxtpConfig } from "./config.js";
import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json())
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
const port = 2000;
const tokenABI = [
  "function mint(address account, uint256 amount)",
  "function approve(address spender, uint256 amount)",
];

const contractABI = [
  "function finishGame(address _winner, uint232 destinationDomain)",
];
// const mintTokens = async () => {
//   const provider = new ethers.providers.JsonRpcProvider(
//     "https://goerli.optimism.io"
//   );
//   const wallet = new ethers.Wallet(
//     "5764bccf39a0b4c2bdaa0cd2887bf19b29d506fac7049404fa9288cdd6150ca8",
//     provider
//   );
//   const TEST_ERC20 = "0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF";
//   const amount = BigNumber.from("15000500300000000000");
//   const token = new ethers.Contract(TEST_ERC20, tokenABI, wallet);

//   async function mint() {
//     let unsignedTx = await token.populateTransaction.mint(
//       wallet.address,
//       amount
//     );
//     let txResponse = await wallet.sendTransaction(unsignedTx);
//     return await txResponse.wait();
//   }

//   let minted = await mint();
//   console.log(minted.status == 1 ? "Successful mint" : "Failed mint");
// };

// const finishGame = async () => {
//   const targetprovider = new ethers.providers.JsonRpcProvider(
//     "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
//   );
//   const admin = new ethers.Wallet(
//     "5764bccf39a0b4c2bdaa0cd2887bf19b29d506fac7049404fa9288cdd6150ca8",
//     targetprovider
//   );
//   const contract = new ethers.Contract(
//     "0xF695f464540930636d1FA50346479c18b88321D8",
//     contractABI,
//     admin
//   );
//   async function finish() {
//     let unsignedTx = await contract.populateTransaction.finishGame(
//       admin.address,
//       "1735356532"
//     );
//     unsignedTx.gasLimit = 2000000;
//     let txResponse = await admin.sendTransaction(unsignedTx);
//     return await txResponse.wait();
//   }

//   let finished = await finish();
//   console.log(finished.status == 1 ? "Successful Done" : "Failed");
// };

// finishGame();
// mintTokens();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/game", async (req, res) => {
  const { nxtpSdkBase } = await create(nxtpConfig);
  console.log(req.body);
  const { signerAddress, origin, contract } = req.body;

  // Address of the TEST token
  const asset = nxtpConfig.chains[origin].assets[0].address;

  // Send 5 TEST
  const amount = "5000000000000000000";

  const abi = ethers.utils.defaultAbiCoder;
  const params = abi.encode(["address"], [signerAddress]);
  console.log(params);
  // Prepare the xcall params
  const xcallParams = {
    origin: origin.toString(), // send from
    destination: "1735353714", // to
    to: contract, // the address that should receive the funds on destination
    asset: asset, // address of the token contract
    delegate: signerAddress, // address allowed to execute transaction on destination side in addition to relayers
    amount: amount, // amount of tokens to transfer
    slippage: "30", // the maximum amount of slippage the user will accept in BPS, 0.3% in this case
    callData: params, // empty calldata for a simple transfer
    relayerFee: "0", // fee paid to relayers; relayers don't take any fees on testnet
  };

  const approveTxReq = await nxtpSdkBase.approveIfNeeded(
    xcallParams.origin,
    xcallParams.asset,
    xcallParams.amount
  );
  const approveTxReceipt = await signer.sendTransaction(approveTxReq);
  await approveTxReceipt.wait();

  // Send the xcall
  const xcallTxReq = await nxtpSdkBase.xcall(xcallParams);
  const xcallTxReceipt = await signer.sendTransaction(xcallTxReq);
  console.log(xcallTxReceipt);
  const xcallResult = await xcallTxReceipt.wait();
  res.send(xcallResult);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
