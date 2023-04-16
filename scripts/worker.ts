import { ethers } from 'ethers'
import { ITransaction } from './interfaces'
import { AvaxBridge, ZateBridge } from '../typechain-types'
import { TIME_IN_BETWEEN_TXS } from '../constants'

const registerWorker = (
  txs: ITransaction[],
  bridgeContracts: {
    avax: AvaxBridge
    zate: ZateBridge
  }
) => {
  setInterval(async () => {
    console.log('worker ran')
    if (txs.length > 0) {
      // In case there is duplicate transactions, remove duplicates
      txs = txs.filter((value, index) => {
        const _value = JSON.stringify(value)
        return (
          index ===
          txs.findIndex((obj) => {
            return JSON.stringify(obj) === _value
          })
        )
      })
      if (txs.length > 0) {
        const { chain, to, amount, nonce } = <ITransaction>txs.shift()
        let tx
        try {
          if (chain === 'avax') {
            tx = await bridgeContracts.avax.release(to, amount, nonce)
          } else if (chain === 'zate') {
            tx = await bridgeContracts.zate.mint(to, amount, nonce)
          } else {
            return
          }
          await tx.wait()
          console.log('transaction minted, token minted or release: ', { chain, to, amount, nonce })
        } catch (err) {
          console.log('error sending transaction: ', { chain, to, amount, nonce })
          console.log(err)
        }
      }
    }
  }, TIME_IN_BETWEEN_TXS)
}

export default registerWorker
