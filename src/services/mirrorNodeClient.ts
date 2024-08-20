import { AccountId } from "@hashgraph/sdk";
import { NetworkConfig } from "../config";


export interface PublicKey {
  key: string;
  _type: string;
}

export interface TokenBalance {
  token_id: string,
  balance: string,
}

export interface AccountBalance {
  balance: string,
  tokens: TokenBalance[],
}

export interface AccountDetails {
  key: PublicKey,
  evm_address: string,
  balance: AccountBalance,
}

export class MirrorNodeClient {
  url: string;

  constructor(networkConfig: NetworkConfig) {
    this.url = networkConfig.mirrorNodeUrl;
  }

  async getAccountDetails(accountId: AccountId): Promise<AccountDetails> {
    const accountDetails = await fetch(
      `${this.url}/api/v1/accounts/${accountId}`,
      {method: "GET"}
    );
    return await accountDetails.json() as AccountDetails;
  }
}