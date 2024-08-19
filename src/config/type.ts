export type NetworkName = "testnet";
export type ChainId = '0x128';
export type NetworkConfig = {
    network: NetworkName,
    jsonRpcUrl: string,
    mirrorNodeUrl: string,
    chainId: ChainId,
}

// purpose of this file is to define the type of the config object
export type NetworkConfigs = {
    [key in NetworkName]: {
        network: NetworkName,
        jsonRpcUrl: string,
        mirrorNodeUrl: string,
        chainId: ChainId,
    }
};

export type UserConfig = {
    name: string,
    accountId: string,
    publicKey: string,
    avatarImagePath: string,
    workReviewImagePath: string
    isDisputeWon: boolean
}

export type Users = "frodo" | "gollum";

export type AppConfig = {
    networks: NetworkConfigs,
    users: Record<Users, UserConfig>
}
