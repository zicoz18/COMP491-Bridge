import { deployments, getChainId, ethers, getNamedAccounts } from 'hardhat'
import { AvaxERC20 } from '../typechain-types'

const main = async () => {
  const chainId = await getChainId()
  const accounts = await getNamedAccounts()
  const signers = await ethers.getSigners()
  const adminSigner = signers.filter((signer) => signer.address === accounts.admin)[0]
  const userSigner = signers.filter((signer) => signer.address === accounts.user)[0]

  const amount = ethers.utils.parseEther('3')

  if (chainId === '43113') {
    const avaxERC20Deployment = await deployments.get('AvaxERC20')
    const avaxERC20 = (await ethers.getContractAt(
      'AvaxERC20',
      avaxERC20Deployment.address,
      userSigner
    )) as AvaxERC20

    const initUserBalance = ethers.utils.formatEther(await avaxERC20.balanceOf(accounts.user))
    console.log(`INITIAL: User's balance of AvaxERC20 on FUJI: ${initUserBalance}`)

    const avaxBridgeDeployment = await deployments.get('AvaxBridge')
    const avaxBridge = await ethers.getContractAt(
      'AvaxBridge',
      avaxBridgeDeployment.address,
      userSigner
    )

    const approveTx = await avaxERC20.approve(avaxBridgeDeployment.address, amount)
    await approveTx.wait()

    const lockTx = await avaxBridge.lock(userSigner.address, amount)
    const minedTx = await lockTx.wait()

    console.log(`LOCKED at blockNumber: ${minedTx.blockNumber}`)

    const afterUserBalance = ethers.utils.formatEther(await avaxERC20.balanceOf(accounts.user))
    const afterBridgeBalance = ethers.utils.formatEther(
      await avaxERC20.balanceOf(avaxBridge.address)
    )
    console.log(`AFTER: User's balance of AvaxERC20 on FUJI: ${afterUserBalance}`)
    console.log(`AFTER: Bridge's balance of AvaxERC20 on FUJI: ${afterBridgeBalance}`)
  } else if (chainId === '161718') {
    const initUserBalance = ethers.utils.formatEther((await userSigner.getBalance()).toString())
    console.log(`INITIAL: User's balance of ZATE on ZATE: ${initUserBalance}`)

    const zateBridgeDeployment = await deployments.get('ZateBridge')
    const zateBridge = await ethers.getContractAt(
      'ZateBridge',
      zateBridgeDeployment.address,
      userSigner
    )

    const burnTx = await zateBridge.burn(userSigner.address, {
      value: amount,
    })
    const minedTx = await burnTx.wait()
    console.log(`BURNED at blockNumber: ${minedTx.blockNumber}`)

    const afterUserBalance = ethers.utils.formatEther((await userSigner.getBalance()).toString())
    console.log(`AFTER: User's balance of ZATE on ZATE: ${afterUserBalance}`)
  }
}
main()
