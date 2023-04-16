// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../Token/IERC20.sol";

contract AvaxBridge {
  /* Selector to call the transfer function of an ERC20 */
  bytes4 private constant TRANSFER_SELECTOR =
    bytes4(keccak256(bytes("transfer(address,uint256)")));

  /* Selector to call the transferFrom function of an ERC20 */
  bytes4 private constant TRANSFER_FROM_SELECTOR =
    bytes4(keccak256(bytes("transferFrom(address,address,uint256)")));

  /* Represents the ERC20 token */
  address public immutable avaxERC20;

  /* Admin of the contract that is able to call `release()` */
  address public admin;

  /* Gets incremented with each `lock()`, indicates the transferCount
    and prevents double processing the event */
  uint public nonce;

  /* Mapping to hold whether nonce is processed or not */
  mapping(uint => bool) public nonceToIsProcessed;

  /* Allows us to indicate whether it is a `release()` or `lock()` when emitting an event */
  enum Type {
    Release,
    Lock
  }

  error NonceAlreadyProcessed(uint nonce);
  error ERC20TransferFail();
  error ERC20TransferFromFail();
  error NotAdmin(address caller);
  /*
        Event that is emitted with both `release()` and `lock()`
        Relayer listens to events emitted by `lock()`
        Potential frontend application may want to listen to events emitted by `release()`
    */
  event Transfer(
    address from,
    address to,
    uint amount,
    uint time,
    uint nonce,
    Type indexed transferType
  );

  /* Modifier to allow some functions to be only called by admin */
  modifier onlyAdmin() {
    _onlyAdmin();
    _;
  }

  function _onlyAdmin() private view {
    if (msg.sender != admin) {
      revert NotAdmin(msg.sender);
    }
  }

  /* Constructor that sets admin as the sender and initializes the ERC20 token inside contract */
  constructor(address _token) {
    admin = msg.sender;
    avaxERC20 = _token;
  }

  /* Function to allow setting a new admin */
  function setAdmin(address _admin) external onlyAdmin {
    admin = _admin;
  }

  function _safeTransfer(address token, address to, uint value) private {
    (bool success, bytes memory data) = token.call(
      abi.encodeWithSelector(TRANSFER_SELECTOR, to, value)
    );
    if (!(success && (data.length == 0 || abi.decode(data, (bool))))) {
      revert ERC20TransferFail();
    }
  }

  function _safeTransferFrom(
    address token,
    address from,
    address to,
    uint value
  ) private {
    (bool success, bytes memory data) = token.call(
      abi.encodeWithSelector(TRANSFER_FROM_SELECTOR, from, to, value)
    );
    if (!(success && (data.length == 0 || abi.decode(data, (bool))))) {
      revert ERC20TransferFromFail();
    }
  }

  /* Function that is called by the relayer to release some tokens after it is burned on the subnet */
  function release(
    address to,
    uint amount,
    uint subnetNonce
  ) external onlyAdmin {
    if (nonceToIsProcessed[subnetNonce]) {
      revert NonceAlreadyProcessed(subnetNonce);
    }
    nonceToIsProcessed[subnetNonce] = true;

    /* Bridge sends locked tokens to the `to` address therefore, releases the tokens */
    // avaxERC20.transfer(to, amount);
    _safeTransfer(avaxERC20, to, amount);

    emit Transfer(
      msg.sender,
      to,
      amount,
      block.timestamp,
      subnetNonce,
      Type.Release
    );
  }

  /*
        Function that is called by the user to lock their tokens.
        Relayer listens to the event emitted by this function and if the nonce is not processed,
        it will call `mint()` of the SubnetBridge
    */
  function lock(address to, uint amount) external {
    /* Send ERC20 tokens from msg.send (user) to bridge to lock the tokens */
    /* Do not forget: sender should approve bridge address to do this */
    _safeTransferFrom(avaxERC20, msg.sender, address(this), amount);

    /* Event that is emitted for relayer to process */
    emit Transfer(msg.sender, to, amount, block.timestamp, nonce, Type.Lock);
    /* Increment the nonce to prevent double counting */
    unchecked {
      ++nonce;
    }
  }
}
