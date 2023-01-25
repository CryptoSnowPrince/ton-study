import { beginCell } from "ton-core";
import fs from "fs";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const netmode = process.env.MODE
const mnemonic: string = process.env.MNEMONIC || ""

async function sendMessage() {
  const endpoint = await getHttpEndpoint({
    network: netmode == 'testnet' ? "testnet" : "mainnet" // or "testnet", according to your choice
  });
  const client = new TonClient({ endpoint });
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV3R2.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  const mainContract = Address.parse(fs.readFileSync("main.txt").toString());
  console.log("contract start ====> " + mainContract);

  const messageBody = beginCell().storeUint(1, 32).storeUint(55, 32).endCell(); // op with value 1 (increment)

  const contract = client.open(wallet);
  const seqno = await contract.getSeqno(); // get the next seqno of our wallet
  // console.log("wallet addess  ====> " + wallet.address + "    no: " + seqno + " , SecretKey: " + key.secretKey.toString());
  
  const transfer = contract.createTransfer({
    seqno,
    messages: [
      internal({
        to: mainContract.toString(),
        value: '0.01',
        bounce: false,
        body: messageBody
      }),
    ],
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATLY+ SendMode.IGNORE_ERRORS,
  });

  await client.sendExternalMessage(wallet, transfer);
}

async function sendMessage2() {
  const endpoint = await getHttpEndpoint({
    network: netmode == 'testnet' ? "testnet" : "mainnet" // or "testnet", according to your choice
  });
  const client = new TonClient({ endpoint });
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV3R2.create({
    publicKey: key.publicKey,
    workchain: 0,
  });

  const mainContract = Address.parse(fs.readFileSync("main.txt").toString());
  console.log("contract start ====> " + mainContract);

  const messageBody = beginCell().storeUint(2, 32).endCell(); // op with value 1 (increment)

  const contract = client.open(wallet);
  const seqno = await contract.getSeqno(); // get the next seqno of our wallet
  
  const transfer = contract.createTransfer({
    seqno,
    messages: [
      internal({
        to: mainContract.toString(),
        value: '0.01',
        bounce: false,
        body: messageBody
      }),
    ],
    secretKey: key.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATLY+ SendMode.IGNORE_ERRORS,
  });

  await client.sendExternalMessage(wallet, transfer);
}

async function main() {
  try {
    await sendMessage();
    console.log("[delay start]")
    await delay(10000)
    console.log("[delay end]")
    await sendMessage2();
  } catch (error) {
    console.log("[sendmsg err]: ", error)
  }
}

main();
