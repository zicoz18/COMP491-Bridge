// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "solmate/src/tokens/ERC20.sol";

// A standard ERC20 token with maxSupply of 1 million
contract AvaxERC20 is ERC20 {
  uint public MAX_SUPPLY = 1000000 ether;

  // maxSupply is sent to the creator of the token
  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) ERC20(_name, _symbol, _decimals) {
    _mint(msg.sender, MAX_SUPPLY);
  }
}
