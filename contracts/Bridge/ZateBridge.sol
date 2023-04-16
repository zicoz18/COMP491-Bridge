// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../Token/INativeMinter.sol";

contract SubnetBridge {
  /* Selector to call the mintNativeCoin function of INativeMinter */
  bytes4 private constant NATIVE_MINT_SELECTOR =
    bytes4(keccak256(bytes("mintNativeCoin(address,uint256)")));
  /* Address to send tokens to burn them */
  address public constant burnAddress = address(0x0);

  address public constant nativeMinter =
    address(0x0200000000000000000000000000000000000001);

  /* Admin of the contract that is able to call `release()` */
  address public admin;

  /* Gets incremented with each `burn()`, indicates the transferCount
    and prevents double processing the event */
  uint public nonce;

  /* Represents NativeMinterInterface */

  /* Mapping to hold whether nonce is processed or not */
  mapping(uint => bool) public nonceToIsProcessed;

  /* Allows us to indicate whether it is a `mint()` or `burn()` when emitting an event */
  enum Type {
    Mint,
    Burn
  }

  error InvalidBurnAmount(uint amount);
  error NonceAlreadyProcessed(uint nonce);
  error NativeMintFail();
  error BurnFail();
  error NotAdmin(address caller);

  /*
        Event that is emitted with both `mint()` and `burn()`
        Relayer listens to events emitted by `burn()`
        Potential frontend application may want to listen to events emitted by `mint()`
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

  /* Constructor that sets admin as the sender */
  constructor() {
    admin = msg.sender;
  }

  /* Function to allow setting new admin */
  function setAdmin(address newAdmin) external onlyAdmin {
    admin = newAdmin;
  }

  function _safeNativeMint(address to, uint value) private {
    (bool success, ) = nativeMinter.call(
      abi.encodeWithSelector(NATIVE_MINT_SELECTOR, to, value)
    );
    if (!success) {
      revert NativeMintFail();
    }
  }

  function _safeBurn() private {
    (bool success, ) = payable(burnAddress).call{value: msg.value}("");
    if (!success) {
      revert BurnFail();
    }
  }

  /* Function that is called by the relayer to mint some tokens after it is locked on the avax */
  function mint(address to, uint amount, uint avaxNonce) external onlyAdmin {
    if (nonceToIsProcessed[avaxNonce]) {
      revert NonceAlreadyProcessed(avaxNonce);
    }
    nonceToIsProcessed[avaxNonce] = true;

    _safeNativeMint(to, amount);

    emit Transfer(
      msg.sender,
      to,
      amount,
      block.timestamp,
      avaxNonce,
      Type.Mint
    );
  }

  /*
        Function that is called by the user to burn their tokens.
        Relayer listens to this event and if the nonce is not processed,
        it will call `release()` of the AvaxBridge
    */
  function burn(address to) external payable {
    if (msg.value == 0) {
      revert InvalidBurnAmount(msg.value);
    }

    /* Send native token to 0x0 address, effectively burning native token */
    _safeBurn();

    /* Event that is emitted for relayer to process */
    emit Transfer(msg.sender, to, msg.value, block.timestamp, nonce, Type.Burn);

    /* Increment the nonce to prevent double counting */
    unchecked {
      ++nonce;
    }
  }
}
