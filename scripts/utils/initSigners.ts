// import { ethers } from 'hardhat'
import * as ethers from 'ethers'
import { config } from 'dotenv'
import { JsonRpcProvider } from '@ethersproject/providers'
config()

export const getSigners = (providers: { avax: JsonRpcProvider; zate: JsonRpcProvider }) => {
  const avaxAdminSigner = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY as string, providers.avax)
  const zateAdminSigner = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY as string, providers.zate)
  return {
    avax: avaxAdminSigner,
    zate: zateAdminSigner,
  }
}
