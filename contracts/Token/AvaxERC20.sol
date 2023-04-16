// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// A standard ERC20 token with maxSupply of 1 million
contract AvaxERC20 is ERC20 {
  uint public MAX_SUPPLY = 1000000 ether;

  // maxSupply is sent to the creator of the token
  constructor(
    string memory _name,
    string memory _symbol
  ) ERC20(_name, _symbol) {
    _mint(msg.sender, MAX_SUPPLY);
  }
}
