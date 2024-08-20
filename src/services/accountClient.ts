import { Client, TokenId, TransferTransaction } from "@hashgraph/sdk";

export class AccountClient {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async transferNonFungibleToken(client: Client, tokenId: string, from: string, to: string, amount: number) {
    const transferTransactionResponse = await new TransferTransaction()
      .addTokenTransfer(
        TokenId.fromString(tokenId),
        from,
        -amount
      )
      .addTokenTransfer(
        TokenId.fromString(tokenId),
        to,
        amount
      )
      .execute(client);
    const receipt = await transferTransactionResponse.getReceipt(client);
    console.log(
      "Token transfer status:",
      receipt.status.toString()
    );
  }
}