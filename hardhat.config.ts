import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

const PRIVATE_KEYS = [
  process.env.ADMIN_PRIVATE_KEY,
  process.env.USER_PRIVATE_KEY,
  process.env.USER_2_PRIVATE_KEY,
] as string[]

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  namedAccounts: {
    admin: {
      default: '0x3A17045d7db4d825477CeF64cbb9b9a903F93031',
    },
    user: {
      default: '0x58C4de90C4E4256f33919b79856db2BB6CBB52F4',
    },
  },
  networks: {
    fuji: {
      url: process.env.FUJI_RPC_URL,
      chainId: 43113,
      accounts: PRIVATE_KEYS,
      live: true,
      saveDeployments: true,
      // tags: ['staging'],
    },
    zate: {
      url: process.env.ZATE_RPC_URL,
      chainId: 161718,
      accounts: PRIVATE_KEYS,
      live: true,
      saveDeployments: true,
      // tags: ['staging'],
    },
  },
}

export default config
