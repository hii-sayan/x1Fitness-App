import { ethers } from 'ethers';
import X1_ABI from '/Users/sayan/Desktop/react-n/x1_fitness/contracts/X1TestCoin.sol/X1TestCoin.json';
import STAKING_ABI from '/Users/sayan/Desktop/react-n/x1_fitness/contracts/Staking.sol/Staking.json';
import { CHAIN_CONFIG } from './config';

export const getContracts = (providerOrSigner) => {
  return {
    x1Contract: new ethers.Contract(
      CHAIN_CONFIG.x1Address,
      X1_ABI.abi,
      providerOrSigner
    ),
    stakingContract: new ethers.Contract(
      CHAIN_CONFIG.stakingAddress,
      STAKING_ABI.abi,
      providerOrSigner
    )
  };
};