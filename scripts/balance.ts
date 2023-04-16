import { deployments, getChainId, ethers, getNamedAccounts } from 'hardhat'
import { AvaxERC20 } from '../typechain-types'

const main = async () => {
  const chainId = await getChainId()
  const accounts = await getNamedAccounts()
  if (chainId === '43113') {
    const avaxERC20Deployment = await deployments.get('AvaxERC20')
    const avaxERC20 = (await ethers.getContractAt(
      'AvaxERC20',
      avaxERC20Deployment.address
    )) as AvaxERC20

    const userBalance = ethers.utils.formatEther(await avaxERC20.balanceOf(accounts.user))
    console.log(`User's balance of AvaxERC20 on FUJI: ${userBalance}`)
  } else if (chainId === '161718') {
    const signers = await ethers.getSigners()
    const userSigner = signers.filter((signer) => signer.address === accounts.user)[0]

    const userBalance = ethers.utils.formatEther((await userSigner.getBalance()).toString())
    console.log(`Native balance of user on ZATE: ${userBalance}`)
  }
}
main()
