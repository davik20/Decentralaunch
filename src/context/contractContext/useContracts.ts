import React, { createContext, useContext } from "react";

type ContractContextType = {
  FireSalesLibraryContract?: any;
  FireSalesRouterContract?: any;
  FireSalesSaleJson?: any;
  FireSalesLockerContract?: any;
  TestTokenJson?: any;
};

export const contractContext = createContext<ContractContextType>({
  FireSalesLibraryContract: null,
  FireSalesRouterContract: null,
  FireSalesSaleJson: null,
});

const useContracts = () => {
  const context = useContext(contractContext);
  if (!context) {
    throw new Error(
      "You cannot use UseContracts outside of its context provider"
    );
  }
  return context;
};

export default useContracts;
