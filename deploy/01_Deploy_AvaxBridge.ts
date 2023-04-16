import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments

  const { admin } = await getNamedAccounts()
  const avaxERC20 = await get('AvaxERC20')

  await deploy('AvaxBridge', {
    from: admin,
    args: [avaxERC20.address],
    log: true,
  })
}
export default func
func.tags = ['avaxBridge']
