// TODO: Connect to both networks
// TODO: Listen to events from both bridge contracts
// TODO: Whenever

import { TransferEvent } from '../typechain-types/contracts/Bridge/AvaxBridge'
import { IBridgeTransfer, ITransaction } from './interfaces'
import { getBridgeContracts } from './utils/initBridgeContracts'
import { getProviders } from './utils/initProviders'
import { getSigners } from './utils/initSigners'
import registerWorker from './worker'

// TODO: Start listening to events

const txs = [] as ITransaction[]

// const processEvents = (logs: TransferEvent[]) => {
//   logs.map((log) => log.args as unknown as IBridgeTransfer).map((transfer) => transfer.nonce)
// }

const main = async () => {
  // Connect to smart contracts on both blockchains
  const providers = getProviders()
  const signers = getSigners(providers)
  const bridgeContracts = getBridgeContracts(signers)

  const filter = await bridgeContracts.zate.filters.Transfer()

  // const startFromBlockNumber = 0
  // const latestBlockNumber = 25 // await providers.zate.getBlockNumber()
  // const count = Math.floor(
  //   (latestBlockNumber - startFromBlockNumber) / MAX_BLOCK_NUMBER_FOR_ONE_REQUEST
  // )
  // console.log(count)
  // for (let i = 0; i < count; i++) {
  //   console.log(`For i: ${i}`)
  //   console.log(`Starts from: ${startFromBlockNumber + i * MAX_BLOCK_NUMBER_FOR_ONE_REQUEST}`)
  //   console.log(`Ends at: ${startFromBlockNumber + (i + 1) * MAX_BLOCK_NUMBER_FOR_ONE_REQUEST}`)
  //   const logs = await bridgeContracts.zate.queryFilter(
  //     filter,
  //     startFromBlockNumber + i * MAX_BLOCK_NUMBER_FOR_ONE_REQUEST,
  //     startFromBlockNumber + (i + 1) * MAX_BLOCK_NUMBER_FOR_ONE_REQUEST
  //   )
  //   // processEvents(logs)
  // }
  // console.log(`Last iteration: `)
  // console.log(`For i: ${count}`)
  // console.log(`Starts from: ${startFromBlockNumber + count * MAX_BLOCK_NUMBER_FOR_ONE_REQUEST}`)
  // console.log(`Ends at: ${latestBlockNumber}`)
  // const logs = await bridgeContracts.zate.queryFilter(
  //   filter,
  //   startFromBlockNumber + count * MAX_BLOCK_NUMBER_FOR_ONE_REQUEST,
  //   latestBlockNumber
  // )
  // // processEvents(logs)

  bridgeContracts.zate.on(filter, (from, to, amount, date, nonce, type) => {
    console.log('zate running for an event')
    console.log(from)
    console.log(to)
    console.log(amount.toString())
    console.log(date.toString())
    console.log(nonce.toString())
    console.log(type.toString())
    txs.push({ chain: 'avax', to, amount, nonce })
  })

  bridgeContracts.avax.on(filter, (from, to, amount, date, nonce, type) => {
    console.log('avax running for an event')
    console.log(from)
    console.log(to)
    console.log(amount.toString())
    console.log(date.toString())
    console.log(nonce.toString())
    console.log(type.toString())
    txs.push({ chain: 'zate', to, amount, nonce })
  })

  registerWorker(txs, bridgeContracts)
}
main()
