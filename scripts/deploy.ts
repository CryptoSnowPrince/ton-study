import { beginCell, Dictionary } from "ton-core";
import fs from "fs";
import { contractAddress, Cell, } from "ton-core";
//import { deployAmmMinter } from "../../tonswap-contracts/deploy/deploy-utils";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address, } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function initData(init_value: number) {
  return beginCell()
    .storeUint(init_value, 32)
    .endCell();
}

const netmode = process.env.MODE
const mnemonic: string = process.env.MNEMONIC || ""

async function deployMain() {
  try {
    const key = await mnemonicToWalletKey(mnemonic.toString().split(" "));
    const wallet = WalletContractV3R2.create({
      publicKey: key.publicKey,
      workchain: 0,
    });
    const endpoint = await getHttpEndpoint({
      network: netmode == 'testnet' ? "testnet" : "mainnet"
    });
    const client = new TonClient({ endpoint });
    console.log("wallet start ====> " + wallet.address);
  
    const initDataCell = initData(5); // the function we've implemented just now
    const initCodeCell = Cell.fromBoc(fs.readFileSync("./contracts/main.cell"))[0]; // compilation output from step 6
  
    const mainContract = contractAddress(0, { code: initCodeCell, data: initDataCell });
    console.log(`main contract start ====> ${netmode} : ${mainContract}`);
    fs.writeFileSync("main.txt", mainContract.toString());
  
    const contract = client.open(wallet);
  
    console.log("contract opened ====> " + contract.address);
  
    const seqno = await contract.getSeqno(); // get the next seqno of our wallet
  
    console.log("getSeqno ====> " + seqno);
  
    const transfer = contract.createTransfer({
      seqno,
      messages: [
        internal({
          to: mainContract.toString(),
          value: '0.01',
          init: { data: initDataCell, code: initCodeCell },
          bounce: false,
        }),
      ],
      secretKey: key.secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
    });
  
    await client.sendExternalMessage(wallet, transfer);
  
    console.log("main contract end ====> ");
  } catch (error) {
    console.log("[deploy err]: ", error)
  }
}

async function deployCalled() {
  try {
    const key = await mnemonicToWalletKey(mnemonic.toString().split(" "));
    const wallet = WalletContractV3R2.create({
      publicKey: key.publicKey,
      workchain: 0,
    });
    const endpoint = await getHttpEndpoint({
      network: netmode == 'testnet' ? "testnet" : "mainnet"
    });
    const client = new TonClient({ endpoint });
    console.log("wallet start ====> " + wallet.address);
  
    const initDataCell = initData(5); // the function we've implemented just now
    const initCodeCell = Cell.fromBoc(fs.readFileSync("./contracts/called.cell"))[0]; // compilation output from step 6
  
    const calledContract = contractAddress(0, { code: initCodeCell, data: initDataCell });
    console.log(`called contract start ====> ${netmode} : ${calledContract}`);
    fs.writeFileSync("called.txt", calledContract.toString());
  
    const contract = client.open(wallet);
  
    console.log("contract opened ====> " + contract.address);
  
    const seqno = await contract.getSeqno(); // get the next seqno of our wallet
  
    console.log("getSeqno ====> " + seqno);
  
    const transfer = contract.createTransfer({
      seqno,
      messages: [
        internal({
          to: calledContract.toString(),
          value: '0.01',
          init: { data: initDataCell, code: initCodeCell },
          bounce: false,
        }),
      ],
      secretKey: key.secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
    });
  
    await client.sendExternalMessage(wallet, transfer);
  
    console.log("called contract end ====> ");
  } catch (error) {
    console.log("[deploy err]: ", error)
  }
}

async function main() {
  try {
    await deployMain()
    console.log("[delay start]")
    await delay(10000)
    console.log("[delay end]")
    await deployCalled()
  } catch (error) {
    console.log("[deploy err]: ", error)
  }
}

main()
