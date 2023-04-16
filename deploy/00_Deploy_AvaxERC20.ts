import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { admin } = await getNamedAccounts()

  await deploy('AvaxERC20', {
    from: admin,
    args: ['Avax Zate', 'AZATE'],
    log: true,
  })
}
export default func
func.tags = ['avaxERC20']
