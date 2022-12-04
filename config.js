import { ethers } from "ethers";

// Create a Signer and connect it to a Provider on the sending chain

const privateKey = "5764bccf39a0b4c2bdaa0cd2887bf19b29d506fac7049404fa9288cdd6150ca8";
let signer = new ethers.Wallet(privateKey);
const provider = new ethers.providers.JsonRpcProvider("https://opt-goerli.g.alchemy.com/v2/7pr7BHhHpk1Xu95R1mrCtqCCmbzQAlA-");
console.log((await provider.getGasPrice()).toNumber());
signer = signer.connect(provider);
const signerAddress = await signer.getAddress();

const nxtpConfig = {
  logLevel: "error",
  signerAddress: signerAddress,
  chains: {
    // Goerli
    "1735353714": {
      providers: ["https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
      assets: [
        {
          name: "TEST",
          symbol: "TEST",
          address: "0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1",
        },
      ],
    },
    // Optimism-Goerli
    "1735356532": {
      providers: ["https://opt-goerli.g.alchemy.com/v2/7pr7BHhHpk1Xu95R1mrCtqCCmbzQAlA-"],
      assets: [
        {
          name: "TEST",
          symbol: "TEST",
          address: "0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF",
        },
      ],
    },
    // Polygon-Mumbai
    "9991": {
      providers: ["https://rpc.ankr.com/polygon_mumbai"],
      assets: [
        {
          name: "TEST",
          symbol: "TEST",
          address: "0xeDb95D8037f769B72AAab41deeC92903A98C9E16",
        },
      ],
    },
  },
};

export { signer, nxtpConfig };
