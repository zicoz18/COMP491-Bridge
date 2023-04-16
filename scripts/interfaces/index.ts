import { BigNumber } from 'ethers'

export interface IBridgeTransfer {
  from: string
  to: string
  amount: BigNumber
  nonce: BigNumber
  transferType: BigNumber
}

export interface ITransaction {
  chain: string
  to: string
  amount: BigNumber
  nonce: BigNumber
}
