// import { ethers } from 'hardhat'
import * as ethers from 'ethers'
import { config } from 'dotenv'
config()

export const getProviders = () => {
  /* Create providers for both chains */
  const avaxProvider = new ethers.providers.JsonRpcProvider(process.env.FUJI_RPC_URL)
  const zateProvider = new ethers.providers.JsonRpcProvider(process.env.ZATE_RPC_URL)
  return { avax: avaxProvider, zate: zateProvider }
}
