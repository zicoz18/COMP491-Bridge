// import { ethers } from 'hardhat'
import * as ethers from 'ethers'
import AvaxBridgeDeploymentInfo from '../../deployments/fuji/AvaxBridge.json'
import ZateBridgeDeploymentInfo from '../../deployments/zate/ZateBridge.json'
import { AvaxBridge, ZateBridge } from '../../typechain-types'

export const getBridgeContracts = (signers: { avax: ethers.Wallet; zate: ethers.Wallet }) => {
  /* AvaxBridge contract with admin singer */
  const avaxBridge = new ethers.Contract(
    AvaxBridgeDeploymentInfo.address,
    AvaxBridgeDeploymentInfo.abi,
    signers.avax
  ) as AvaxBridge

  /* SubnetBridge contract with signer access of bridgeAdmin */
  const zateBridge = new ethers.Contract(
    ZateBridgeDeploymentInfo.address,
    ZateBridgeDeploymentInfo.abi,
    signers.zate
  ) as ZateBridge

  return {
    avax: avaxBridge,
    zate: zateBridge,
  }
}
