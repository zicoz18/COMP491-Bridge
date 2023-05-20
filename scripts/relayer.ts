import { TIME_IN_BETWEEN_TXS } from '../constants'
import { ITransaction } from './interfaces'
import { getBridgeContracts } from './utils/initBridgeContracts'
import { getProviders } from './utils/initProviders'
import { getSigners } from './utils/initSigners'

let txs = [] as ITransaction[]

const main = async () => {
  // Connect to smart contracts on both blockchains
  const providers = getProviders()
  const signers = getSigners(providers)
  const bridgeContracts = getBridgeContracts(signers)

  const filter = await bridgeContracts.zate.filters.Transfer()

  bridgeContracts.zate.on(filter, async (from, to, amount, date, nonce, type) => {
    if (type === 1) {
      console.log('zate burn event emitted')
      const isProcessed = await bridgeContracts.avax.nonceToIsProcessed(nonce)
      if (!isProcessed) {
        txs.push({ chain: 'avax', to, amount, nonce })
      } else {
        console.log('already processed')
      }
    } else {
      console.log('zate mint event emitted')
    }
  })

  bridgeContracts.avax.on(filter, async (from, to, amount, date, nonce, type) => {
    if (type === 1) {
      console.log('avax lock event emitted')
      const isProcessed = await bridgeContracts.zate.nonceToIsProcessed(nonce)
      if (!isProcessed) {
        txs.push({ chain: 'zate', to, amount, nonce })
      } else {
        console.log('already processed')
      }
    } else {
      console.log('avax release event emitted')
    }
  })

  setInterval(async () => {
    console.log('worker ran')
    console.log(txs)

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
            console.log('sending transaction to fuji chain to release')
            tx = await bridgeContracts.avax.release(to, amount, nonce)
          } else if (chain === 'zate') {
            console.log('sending transaction to zate chain to mint')
            tx = await bridgeContracts.zate.mint(to, amount, nonce)
          } else {
            console.log('invalid transactions to process')
            return
          }
          await tx.wait()
          console.log('transaction included in the blockchain, token minted or release: ', {
            chain,
            to,
            amount,
            nonce,
          })
        } catch (err) {
          console.log('error sending transaction: ', { chain, to, amount, nonce })
          console.log(err)
        }
      }
    }
  }, TIME_IN_BETWEEN_TXS)
}
main()
