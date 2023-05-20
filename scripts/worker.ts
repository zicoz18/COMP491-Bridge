// import { ethers } from 'ethers'
// import { ITransaction } from './interfaces'
// import { AvaxBridge, ZateBridge } from '../typechain-types'
// import { TIME_IN_BETWEEN_TXS } from '../constants'

// const registerWorker = (
//   txs: ITransaction[],
//   bridgeContracts: {
//     avax: AvaxBridge
//     zate: ZateBridge
//   }
// ) => {
//   setInterval(async () => {
//     console.log('worker ran')
//     console.log(txs)
//     if (txs.length > 0) {
//       // In case there is duplicate transactions, remove duplicates
//       txs = txs.filter((value, index) => {
//         const _value = JSON.stringify(value)
//         return (
//           index ===
//           txs.findIndex((obj) => {
//             return JSON.stringify(obj) === _value
//           })
//         )
//       })
//       console.log('txs after deleting duplicates')
//       console.log(txs)
//       if (txs.length > 0) {
//         const { chain, to, amount, nonce } = <ITransaction>txs.shift()
//         let tx
//         try {
//           if (chain === 'avax') {
//             console.log('sending transaction to fuji chain to release')
//             tx = await bridgeContracts.avax.release(to, amount, nonce)
//           } else if (chain === 'zate') {
//             console.log('sending transaction to zate chain to mint')
//             tx = await bridgeContracts.zate.mint(to, amount, nonce)
//           } else {
//             console.log('invalid transactions to process')
//             return
//           }
//           await tx.wait()
//           console.log('transaction included in the blockchain, token minted or release: ', {
//             chain,
//             to,
//             amount,
//             nonce,
//           })
//         } catch (err) {
//           console.log('error sending transaction: ', { chain, to, amount, nonce })
//           console.log(err)
//         }
//       }
//     }
//   }, TIME_IN_BETWEEN_TXS)
// }

// export default registerWorker
