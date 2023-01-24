import { beginCell, Dictionary } from "ton-core";
import fs from "fs";
import { contractAddress, Cell  } from "ton-core";
//import { deployAmmMinter } from "../../tonswap-contracts/deploy/deploy-utils";
import { mnemonicToWalletKey } from "ton-crypto";
import { WalletContractV3R2, internal } from "ton";
import { TonClient, SendMode, Address } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"
import dotenv from "dotenv"

dotenv.config()

const netmode = process.env.MODE

async function callGetter() {
  try {
    const mainContract = Address.parse(fs.readFileSync("main.txt").toString());
    const endpoint = await getHttpEndpoint({
      network: (netmode === "testnet" ? "testnet" : "mainnet") // or "testnet", according to your choice
    });
    console.log("contract address ====> " + mainContract);
  
    const client = new TonClient({ endpoint });
    const call = await client.callGetMethod(mainContract, "get_Val"); // mainContract from deploy
    console.log(`val value is ${call.stack.readBigNumber().toString()}`);
  } catch (error) {
    console.log("[getter err]: ", error)
  }
}

callGetter();
