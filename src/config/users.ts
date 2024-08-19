import { UserConfig, Users } from "./type";
import FrodoAvatar from "../assets/frodo.jpeg";
import FrodoWorkReview from "../assets/frodo-work-review.jpeg";
import GollumAvatar from "../assets/gollum.jpeg";
import GollumWorkReview from "../assets/gollum-work-review.jpeg";


export const userConfigs: Record<Users, UserConfig> = {
  frodo: {
    name: "Frodo Baggins",
    accountId: "0.0.4689042",
    publicKey: "302d300706052b8104000a0322000290a4170e0f33e0aa8b43bb541e48eeaf5425235b194b351e7603801efabd168e",
    avatarImagePath: FrodoAvatar,
    workReviewImagePath: FrodoWorkReview,
    isDisputeWon: true
  },
  gollum: {
    name: "Gollum (Sméagol)",
    accountId: "0.0.4689041",
    publicKey: "302d300706052b8104000a03220002c2bed787dac591ad4756a61a13479ee6a2ee76806e1d4000cf4ecc1868f6481e",
    avatarImagePath: GollumAvatar,
    workReviewImagePath: GollumWorkReview,
    isDisputeWon: false
  }
};
