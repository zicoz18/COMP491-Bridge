import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { NATIVE_MINTER_ADDRESS } from '../constants'
import { NativeMinterInterface } from '../typechain-types/contracts/Token/INativeMinter.sol/NativeMinterInterface'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { admin } = await getNamedAccounts()

  const bridgeDeploymentResult = await deploy('ZateBridge', {
    from: admin,
    args: [],
    log: true,
  })

  const nativeMinter = (await hre.ethers.getContractAt(
    'NativeMinterInterface',
    NATIVE_MINTER_ADDRESS
  )) as NativeMinterInterface

  const isAllowed = (await nativeMinter.readAllowList(bridgeDeploymentResult.address)).toNumber()
  if (isAllowed === 0) {
    const allowBridgeToNativeMintTx = await nativeMinter.setEnabled(bridgeDeploymentResult.address)
    await allowBridgeToNativeMintTx.wait()
  }
}
export default func
func.tags = ['zateBridge']
