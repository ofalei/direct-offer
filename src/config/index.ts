import { networkConfig } from "./networks";
import { userConfigs } from "./users";
import { AppConfig } from "./type";
import * as constants from "./constants";

export * from "./type";

export const appConfig: AppConfig & {
  constants: typeof constants
} = {
  networks: networkConfig,
  users: userConfigs,
  constants
}
