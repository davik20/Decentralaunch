import React, { ReactElement, useEffect, useState, useMemo } from "react";
import useConnection from "../connectionContext/useConnection";

import { contractContext } from "./useContracts";
import FireSalesRouterJson from "../../contracts/FireSalesRouter.json";
import FireSalesLibraryJson from "../../contracts/FireSalesLibrary.json";
import FireSalesSaleJson from "../../contracts/FireSalesSale.json";
import FireSalesCoreJson from "../../contracts/FireSalesCore.json";
import FireSalesLockerJson from "../../contracts/FireSalesLocker.json";
import TestTokenJson from "../../contracts/TestToken.json";
import Web3 from "web3";
import { useContractCreator } from "../../hooks";
import { ALLOWEDCHAINIDS, CONTRACTS } from "../../constants";

interface Props {
  children: any;
}

function ContractProvider({ children }: Props): ReactElement {
  let { web3, chainId } = useConnection();

  console.log(web3, chainId);

  // const isIncluded = ALLOWEDCHAINIDS.includes(chainId);

  // if(!isIncluded){
  //     chainId =  338
  //     console.log("not included")
  // }

  const FireSalesCoreContract = useContractCreator(
    web3,
    FireSalesCoreJson,
    CONTRACTS[chainId].core
  );
  const FireSalesLibraryContract = useContractCreator(
    web3,
    FireSalesLibraryJson,
    CONTRACTS[chainId].library
  );

  const FireSalesLockerContract = useContractCreator(
    web3,
    FireSalesLockerJson,
    CONTRACTS[chainId].locker
  );
  const FireSalesRouterContract = useContractCreator(
    web3,
    FireSalesRouterJson,
    CONTRACTS[chainId].router
  );

  console.log(FireSalesLibraryContract._address, " firesalelibary conract");

  const value = useMemo(
    () => ({
      FireSalesLibraryContract,
      FireSalesRouterContract,
      FireSalesCoreContract,
      FireSalesSaleJson,
      FireSalesLockerContract,
      TestTokenJson,
    }),
    [
      FireSalesRouterContract,
      FireSalesLibraryContract,
      FireSalesSaleJson,
      FireSalesLockerContract,
    ]
  );

  return (
    <contractContext.Provider value={value}>
      {children}
    </contractContext.Provider>
  );
}

export default ContractProvider;
